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

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export const SearchFormDataSchema = z.object({
  departurePlace: z.string().min(1, "Please enter a departure location"),
  returnPlace: z.string().min(1, "Please enter an arrival location"),
  departureDate: z.string(),
  returnDate: z.string().nullable().optional(),
})

export type SearchFormData = z.infer<typeof SearchFormDataSchema>

export const SearchStateSchema = z.object({
  sessionId: z.string(),
  formData: SearchFormDataSchema,
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
  })),
  trigger: z.enum(["search", "chat"]),
})

export type SearchState = z.infer<typeof SearchStateSchema>

export const FlightSchema = z.object({
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

export type Flight = z.infer<typeof FlightSchema>

export const SuggestedFilterSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
})

export type SuggestedFilter = z.infer<typeof SuggestedFilterSchema>

export const SearchResponseSchema = z.object({
  message: z.string(),
  flights: z.array(FlightSchema),
  suggestedFilters: z.array(SuggestedFilterSchema),
})

export type SearchResponse = z.infer<typeof SearchResponseSchema> 