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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = ChatRequestSchema.parse(body)

    console.log("Validated data:", validatedData)

    if (validatedData.trigger === "search") {
      // TODO: Replace with actual flight search API integration
      const mockFlights = [
        {
          id: "f1",
          airline: "Example Airlines",
          flightNumber: "EA123",
          departureTime: "2024-01-20T10:00:00Z",
          arrivalTime: "2024-01-20T12:00:00Z",
          price: 299.99,
          currency: "USD",
          duration: "2h",
          stops: 0,
        },
        {
          id: "f2",
          airline: "Example Airlines",
          flightNumber: "EA456",
          departureTime: "2024-01-20T14:00:00Z",
          arrivalTime: "2024-01-20T16:00:00Z",
          price: 349.99,
          currency: "USD",
          duration: "2h",
          stops: 0,
        },
      ]

      return NextResponse.json({
        message: "Found 2 direct flights matching your criteria.",
        flights: mockFlights,
        sessionId: validatedData.sessionId,
      })
    }

    const systemMessage = {
      role: "system" as const,
      content: `You are a helpful flight search assistant. Help users find flights based on their preferences.
Current search parameters:
- From: ${validatedData.formData.departurePlace}
- To: ${validatedData.formData.returnPlace}
- Departure: ${validatedData.formData.departureDate}
- Return: ${validatedData.formData.returnDate || "N/A"}

Provide helpful suggestions and answer questions about flights, travel tips, and destinations.`
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        systemMessage,
        ...validatedData.messages.map(msg => ({
          role: msg.role as const,
          content: msg.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    return NextResponse.json({
      message: response.choices[0].message.content,
      sessionId: validatedData.sessionId,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    )
  }
} 