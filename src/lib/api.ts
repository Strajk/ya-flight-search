import { useMutation } from "@tanstack/react-query"
import { SearchState } from "@/types/search"

export async function searchFlights(searchState: SearchState) {
  const response = await fetch(`/api/chat`, {
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