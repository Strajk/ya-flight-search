import { format } from "date-fns"
import { Card } from "@/components/ui/card"
import { Plane, MessageCircle } from "lucide-react"
import { Flight, SearchResponse } from "@/types/search"
import { cn } from "@/lib/utils"

interface SearchResultsProps {
  results?: SearchResponse
}

export function SearchResults({ results }: SearchResultsProps) {
  if (!results) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No results found. Try adjusting your search criteria.
      </div>
    )
  }

  // Handle chat message response
  if (!results.flights) {
    return (
      <div className="p-4">
        <Card className="p-4">
          <div className="flex gap-3">
            <MessageCircle className="flex-shrink-0 mt-1 w-5 h-5" />
            <div className="dark:prose-invert prose prose-sm">
              {results.message.split('\n').map((line, i) => (
                <p key={i} className="my-2">{line}</p>
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Handle flight results
  if (results.flights.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No flights found. Try adjusting your search criteria.
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {results.message && (
        <div className="mb-4 text-muted-foreground text-sm">
          {results.message}
        </div>
      )}
      {results.flights.map((flight) => (
        <Card key={flight.id} className="p-4">
          <div className="flex sm:flex-row flex-col justify-between gap-4">
            <div className="flex items-start space-x-4">
              <Plane className="flex-shrink-0 mt-1 w-6 h-6" />
              <div className="space-y-1">
                <div className="font-medium">
                  {flight.airline} {flight.flightNumber}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <span>{format(new Date(flight.departureTime), "HH:mm")}</span>
                    <span>→</span>
                    <span>{format(new Date(flight.arrivalTime), "HH:mm")}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {flight.duration} • {flight.stops === 0 ? "Direct" : `${flight.stops} stops`}
                  </div>
                </div>
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-4 sm:flex-col sm:items-end",
              "sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0"
            )}>
              <div className="font-medium">
                {new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: flight.currency,
                }).format(flight.price)}
              </div>
              <div className="text-muted-foreground text-sm">per person</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

