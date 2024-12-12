import { NextResponse } from "next/server"
import OpenAI from "openai"
import { zodResponseFormat } from "openai/helpers/zod"
import { z } from "zod"
import {
  SearchState,
  FlightSchema,
  SuggestedFilterSchema,
  SearchFormDataSchema,
  SearchResponse,
} from "@/types/search"
import { flightsPrompt, filtersPrompt, formUpdatesPrompt } from "@/prompts/flight-search"
import dedent from "dedent"
import { faker } from "@faker-js/faker"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const kiwiSearchApiSchema = z.object({
  flyFrom: z.string(),
  to: z.string(),
  dateFrom: z.string(),
  dateTo: z.string(),
})

const mockedResponse = {
  messages: [
    { role: "user", content: "I want to fly from Prague (PRG) to London (LON) on March 1, 2024." },
    { role: "assistant", content: "I found several flight options for your trip from Prague (PRG) to London (LON) on March 1, 2024. Prices range from $242 to $946, with durations varying between 3 to 9 hours and stops from 0 to 2. Some airlines offering flights include Douglas and Sons, Schiller and Sons, Denesik - Kozey, Reynolds and Sons, and O'Kon, Krajcik and Adams." },
  ],
  flights: [
    {
      id: "bacf7765-6943-440b-89c3-b801c0ab2498",
      airline: "Douglas and Sons",
      flightNumber: "8418",
      departureTime: "2024-12-12T05:15:33.966Z",
      arrivalTime: "2024-12-12T02:03:07.858Z",
      price: 242,
      currency: "USD",
      duration: "9h",
      stops: 2
    },
    {
      id: "82622366-9e57-48e6-8e10-9268cc78eabc",
      airline: "Schiller and Sons",
      flightNumber: "8308",
      departureTime: "2024-12-12T16:15:25.196Z",
      arrivalTime: "2024-12-12T07:21:31.435Z",
      price: 499,
      currency: "USD",
      duration: "5h",
      stops: 2
    },
    {
      id: "e50c7dad-5ce7-4a17-a013-8f68fdbaff6f",
      airline: "Denesik - Kozey",
      flightNumber: "6380",
      departureTime: "2024-12-11T20:15:48.853Z",
      arrivalTime: "2024-12-11T21:02:09.492Z",
      price: 395,
      currency: "USD",
      duration: "8h",
      stops: 0
    },
    {
      id: "ef3d4138-9d56-4fdf-ad87-3ef82c39e62a",
      airline: "Reynolds and Sons",
      flightNumber: "3716",
      departureTime: "2024-12-12T13:53:51.716Z",
      arrivalTime: "2024-12-12T14:23:16.298Z",
      price: 946,
      currency: "USD",
      duration: "3h",
      stops: 2
    },
    {
      id: "589e4f11-7252-426e-8031-e040f4252e3e",
      airline: "O'Kon, Krajcik and Adams",
      flightNumber: "3531",
      departureTime: "2024-12-12T01:41:50.303Z",
      arrivalTime: "2024-12-12T04:58:05.149Z",
      price: 610,
      currency: "USD",
      duration: "3h",
      stops: 0
    }
  ],
  suggestedFilters: [
    {
      id: "filter-under-500",
      label: "Flights under $500",
      prompt: "Search flights priced under $500"
    },
    {
      id: "filter-non-stop",
      label: "Non-stop flights only",
      prompt: "Search for non-stop flights only"
    },
    {
      id: "filter-morning-departure",
      label: "Morning departures only",
      prompt: "Search for flights departing in the morning"
    },
    {
      id: "filter-under-5-hours",
      label: "Flights under 5 hours duration",
      prompt: "Search for flights with duration under 5 hours"
    }
  ],
  formUpdates: {
    departurePlace: "BRQ",
    returnPlace: "London (LON)",
    departureDate: "2024-12-12",
    returnDate: null
  }
} as const

const useMock = false

export async function POST(request: Request) {
  if (useMock) {
    await new Promise(resolve => setTimeout(resolve, 1500))
    return NextResponse.json(mockedResponse)
  }

  try {
    const body = await request.json()
    const searchStateSchema = z.object({
      formData: SearchFormDataSchema,
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string()
      })),
      trigger: z.string()
    })
    const searchState = searchStateSchema.parse(body)

    // Combine form data and chat history into a single prompt

    // 1. Generate flights
    const flightsCompletion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: flightsPrompt
        },
        {
          role: "user", content: dedent(`
            Search Parameters:
            ${JSON.stringify(searchState.formData, null, 2)}

            Chat History:
            ${searchState.messages.map(m => `${m.role}: ${m.content}`).join("\n")}

            What user action triggered this search call: ${searchState.trigger}
        `)
        },
      ],
      response_format: zodResponseFormat(kiwiSearchApiSchema, "flights"),
    })

    const searchApiReqParams = flightsCompletion.choices[0]?.message?.parsed

    console.log("[API] Kiwi Search API Request", searchApiReqParams)

    const flights = await fakeApi(searchApiReqParams as { flyFrom: string; to: string; dateFrom: string; dateTo: string })

    // 2. Generate suggested filters
    const filtersCompletion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: filtersPrompt
        },
        {
          role: "user",
          content: dedent(`
            Original user search request:
            Search Parameters:
            ${JSON.stringify(searchState.formData, null, 2)}

            Flight results:
            ${JSON.stringify(flights, null, 2)}
          `)
        }
      ],
      response_format: zodResponseFormat(z.object({ filters: z.array(SuggestedFilterSchema) }), "filters"),
    })

    const suggestedFilters = filtersCompletion.choices[0]?.message?.parsed?.filters

    console.log("[API] Suggested Filters", suggestedFilters)


    // 3. Generate form updates
    let formUpdates = null
    try {
      const formUpdateCompletion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: formUpdatesPrompt
          },
          {
            role: "user", content: dedent(`
              Search Parameters:
              ${JSON.stringify(searchState.formData, null, 2)}

              Chat History:
              ${searchState.messages.map(m => `${m.role}: ${m.content}`).join("\n")}

              What user action triggered : ${searchState.trigger}
            `)
          },
        ],
        response_format: zodResponseFormat(SearchFormDataSchema, "form_updates"),
      })

      formUpdates = formUpdateCompletion.choices[0]?.message?.parsed
    } catch (error) {
      console.error("Error generating form updates:", error)
      formUpdates = null
    }

    console.log("[API] Form Updates", formUpdates)

    // Generate a summary message
    // const summaryCompletion = await openai.chat.completions.create({
    //   model: "gpt-4o-mini",
    //   messages: [
    //     {
    //       role: "system",
    //       content: dedent(`
    //         Generate a short, friendly summary of the flight search results. 
    //         Be concise and highlight key findings.`
    //       )
    //     },
    //     {
    //       role: "user",
    //       content: dedent(`
    //         Search Parameters:
    //         ${JSON.stringify(searchState.formData, null, 2)}

    //         Chat History:
    //         ${searchState.messages.map(m => `${m.role}: ${m.content}`).join("\n")}

    //         What user action triggered this search call: ${searchState.trigger}

    //         Found Flights:
    //         ${JSON.stringify(flights, null, 2)}
    //       `)
    //     },
    //   ],
    //   temperature: 0.7,
    //   max_tokens: 150,
    // })

    const summaryMessage = "Here are your flight options."

    // Append summary message to the chat history
    const updatedMessages = [...searchState.messages, { role: "assistant", content: summaryMessage }]

    return NextResponse.json({
      messages: updatedMessages,
      flights,
      suggestedFilters,
      formUpdates,
    })

  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}

async function fakeApi(apiRequest: z.infer<typeof kiwiSearchApiSchema>) {
  const numResults = faker.number.int({ min: 1, max: 5 })
  return Array.from({ length: numResults }, (_, index) => ({
    id: faker.string.uuid(),
    airline: faker.company.name(),
    flightNumber: faker.number.int({ min: 1000, max: 9999 }).toString(),
    departureTime: faker.date.soon().toISOString(),
    arrivalTime: faker.date.soon().toISOString(),
    price: faker.number.int({ min: 100, max: 1000 }),
    currency: "USD",
    duration: faker.number.int({ min: 1, max: 10 }).toString() + "h",
    stops: faker.number.int({ min: 0, max: 2 }),
  }))
}
