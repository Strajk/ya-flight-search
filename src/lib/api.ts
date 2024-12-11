import { useMutation } from "@tanstack/react-query"
import { SearchState } from "@/types/search"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function searchFlights(searchState: SearchState) {
  const response = await fetch(`${API_BASE_URL}/api/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(searchState),
  })

  if (!response.ok) {
    throw new Error("Search request failed")
  }

  return response.json()
}

export function useSearchFlights() {
  return useMutation({
    mutationFn: searchFlights,
  })
} 