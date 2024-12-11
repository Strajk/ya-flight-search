import { z } from "zod"

export const TripTypeSchema = z.enum(["oneway", "return", "multicity"], {
  required_error: "Please select a trip type",
  invalid_type_error: "Invalid trip type selected",
})
export type TripType = z.infer<typeof TripTypeSchema>

export const SearchInputSchema = z.object({
  tripType: TripTypeSchema,
  from: z.string().min(1, "Please enter a departure location"),
  to: z.string().min(1, "Please enter an arrival location"),
  departDate: z.date({
    required_error: "Please select a departure date",
    invalid_type_error: "Invalid departure date",
  }),
  returnDate: z.date({
    required_error: "Please select a return date",
    invalid_type_error: "Invalid return date",
  }).nullable().optional(),
  passengers: z.number({
    required_error: "Please select number of passengers",
    invalid_type_error: "Invalid number of passengers",
  }).min(1, "At least 1 passenger is required").max(6, "Maximum 6 passengers allowed"),
  bags: z.number({
    required_error: "Please select number of bags",
    invalid_type_error: "Invalid number of bags",
  }).min(0, "Cannot have negative bags").max(3, "Maximum 3 bags allowed"),
}).refine(
  (data) => {
    if (data.tripType === "return" && !data.returnDate) {
      return false
    }
    return true
  },
  {
    message: "Return date is required for round-trip flights",
    path: ["returnDate"],
  }
).refine(
  (data) => {
    if (data.tripType === "return" && data.returnDate && data.returnDate < data.departDate) {
      return false
    }
    return true
  },
  {
    message: "Return date must be after departure date",
    path: ["returnDate"],
  }
)

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