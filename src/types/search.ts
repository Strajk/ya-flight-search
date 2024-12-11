import { z } from "zod"

export const TripTypeSchema = z.enum(["oneway", "return", "multicity"])
export type TripType = z.infer<typeof TripTypeSchema>

export const SearchInputSchema = z.object({
  tripType: TripTypeSchema,
  from: z.string().min(1, "From location is required"),
  to: z.string().min(1, "To location is required"),
  departDate: z.date(),
  returnDate: z.date().optional().nullable(),
  passengers: z.number().min(1).max(6),
  bags: z.number().min(0).max(3),
})

export type SearchInput = z.infer<typeof SearchInputSchema>

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
})

export type ChatMessage = z.infer<typeof ChatMessageSchema>

export const FlightResultSchema = z.object({
  route: z.string(),
  duration: z.string(),
  stops: z.number(),
  price: z.string(),
})

export type FlightResult = z.infer<typeof FlightResultSchema>

export const SearchStateSchema = z.object({
  input: SearchInputSchema,
  chatHistory: z.array(ChatMessageSchema),
  results: z.array(FlightResultSchema).optional(),
})

export type SearchState = z.infer<typeof SearchStateSchema> 