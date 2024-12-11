import { Card } from "@/components/ui/card"
import { Plane } from "lucide-react"

interface FlightResult {
  route: string
  duration: string
  stops: number
  price: string
}

interface SearchResultsProps {
  results?: FlightResult[]
}

export function SearchResults({ results = [] }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No flights found. Try adjusting your search criteria.
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {results.map((result, index) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Plane className="w-6 h-6" />
              <div>
                <p className="font-medium">{result.route}</p>
                <p className="text-muted-foreground text-sm">
                  {result.duration} • {result.stops === 0 ? "Direct" : `${result.stops} stops`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">{result.price}</p>
              <p className="text-muted-foreground text-sm">per person</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

