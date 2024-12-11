import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const FlightSchema = z.object({
  id: z.string(),
  airline: z.string(),
  flightNumber: z.string(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  price: z.number(),
  currency: z.string(),
  duration: z.string(),
  stops: z.number(),
})

type Flight = z.infer<typeof FlightSchema>

const SuggestedFilterSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
})

type SuggestedFilter = z.infer<typeof SuggestedFilterSchema>

const ChatRequestSchema = z.object({
  sessionId: z.string(),
  formData: z.object({
    departurePlace: z.string(),
    returnPlace: z.string(),
    departureDate: z.string(),
    returnDate: z.string().nullable().optional(),
  }),
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })),
  trigger: z.enum(["search", "chat"]),
})

function generateSuggestedFilters(flights: Flight[]): SuggestedFilter[] {
  const suggestedFilters: SuggestedFilter[] = []
  
  // Early departures (before 10:00)
  const hasEarlyDepartures = flights.some(flight => {
    const departureHour = new Date(flight.departureTime).getHours()
    return departureHour < 10
  })
  if (hasEarlyDepartures) {
    suggestedFilters.push({
      id: "early-departures",
      label: "Early departures",
      description: "Flights departing before 10:00"
    })
  }

  // Evening returns (after 18:00)
  const hasEveningReturns = flights.some(flight => {
    const arrivalHour = new Date(flight.arrivalTime).getHours()
    return arrivalHour >= 18
  })
  if (hasEveningReturns) {
    suggestedFilters.push({
      id: "evening-returns",
      label: "Evening returns",
      description: "Flights arriving after 18:00"
    })
  }

  // Price ranges
  const prices = flights.map(f => f.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  if (minPrice < 100) {
    suggestedFilters.push({
      id: "under-100",
      label: "Under $100",
      description: "Budget-friendly options"
    })
  }
  if (minPrice < 500) {
    suggestedFilters.push({
      id: "under-500",
      label: "Under $500",
      description: "Mid-range options"
    })
  }

  // Direct flights
  const hasDirectFlights = flights.some(f => f.stops === 0)
  if (hasDirectFlights) {
    suggestedFilters.push({
      id: "direct",
      label: "Direct flights",
      description: "No layovers"
    })
  }

  return suggestedFilters
}

// Mock flight data for testing
const mockFlights: Flight[] = [
  {
    id: "1",
    airline: "Example Air",
    flightNumber: "EA123",
    departureTime: "2024-03-20T08:00:00Z",
    arrivalTime: "2024-03-20T10:00:00Z",
    price: 299,
    currency: "USD",
    duration: "2h",
    stops: 0,
  },
  {
    id: "2",
    airline: "Budget Wings",
    flightNumber: "BW456",
    departureTime: "2024-03-20T14:30:00Z",
    arrivalTime: "2024-03-20T17:45:00Z",
    price: 199,
    currency: "USD",
    duration: "3h 15m",
    stops: 1,
  },
  {
    id: "3",
    airline: "Luxury Lines",
    flightNumber: "LL789",
    departureTime: "2024-03-20T18:15:00Z",
    arrivalTime: "2024-03-20T20:00:00Z",
    price: 499,
    currency: "USD",
    duration: "1h 45m",
    stops: 0,
  },
]

const systemMessage = `You are a helpful flight search assistant. Help users find flights based on their preferences and the current search parameters. Be concise and friendly.

Current search parameters:
- Departure: {departurePlace}
- Arrival: {returnPlace}
- Date: {departureDate}
- Return: {returnDate}

Respond with short, helpful messages focused on flight options and suggestions.`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = ChatRequestSchema.parse(body)

    // Replace placeholders in system message
    const customizedSystemMessage = systemMessage
      .replace("{departurePlace}", validatedData.formData.departurePlace)
      .replace("{returnPlace}", validatedData.formData.returnPlace)
      .replace("{departureDate}", validatedData.formData.departureDate)
      .replace("{returnDate}", validatedData.formData.returnDate || "N/A")

    // For search trigger, return mock flights with a generic message
    if (validatedData.trigger === "search") {
      return NextResponse.json({
        message: `Found ${mockFlights.length} flights from ${validatedData.formData.departurePlace} to ${validatedData.formData.returnPlace}`,
        flights: mockFlights,
        suggestedFilters: generateSuggestedFilters(mockFlights),
      })
    }

    // For chat trigger, process with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: customizedSystemMessage },
        ...validatedData.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    const aiMessage = completion.choices[0]?.message?.content || "I couldn't process your request."

    return NextResponse.json({
      message: aiMessage,
      flights: mockFlights,
      suggestedFilters: generateSuggestedFilters(mockFlights),
    })

  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
} 