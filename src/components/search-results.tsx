import { format } from "date-fns"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plane, MessageCircle, Filter, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Flight, SuggestedFilter } from "@/types/search"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { useRef, useState } from "react"

interface SearchResponse {
  message: string
  flights: Flight[]
  suggestedFilters: SuggestedFilter[]
}

interface SearchResultsProps {
  results: SearchResponse | null
  onFilterClick: (filter: SuggestedFilter) => void
  isLoading?: boolean
}

export function SearchResults({ results, onFilterClick, isLoading }: SearchResultsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5) // 5px threshold
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Searching for flights...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Start by entering your search criteria above.
      </div>
    )
  }

  return (
    <div className="p-4">
      <Card className="p-4">
        <div className="space-y-1">
          {/* Message */}
          <div className="flex gap-3">
            <MessageCircle className="flex-shrink-0 mt-1 w-5 h-5" />
            <div className="dark:prose-invert prose prose-sm">
              {results.message.split('\n').map((line, i) => (
                <p key={i} className="my-2">{line}</p>
              ))}
            </div>
          </div>

          {/* Flights */}
          {results.flights && results.flights.length > 0 && (
            <>
              <div className="relative">
                {/* Scroll buttons */}
                {canScrollLeft && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="top-1/2 left-0 z-10 absolute bg-background/80 backdrop-blur-sm -translate-y-1/2"
                    onClick={() => scroll('left')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                )}
                {canScrollRight && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="top-1/2 right-0 z-10 absolute bg-background/80 backdrop-blur-sm -translate-y-1/2"
                    onClick={() => scroll('right')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
                
                {/* Scrollable container */}
                <div
                  ref={scrollContainerRef}
                  className="flex gap-4 snap-mandatory snap-x overflow-x-auto scrollbar-hide"
                  onScroll={() => checkScrollButtons()}
                >
                  {results.flights.map((flight) => (
                    <Card 
                      key={flight.id} 
                      className="flex-none bg-muted/50 p-4 snap-start w-[300px] sm:w-[400px]"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start space-x-4">
                          <Plane className="flex-shrink-0 mt-1 w-6 h-6" />
                          <div className="space-y-1">
                            <div className="font-medium">
                              {flight.airline} {flight.flightNumber}
                            </div>
                            <div className="text-sm">
                              <span>{format(new Date(flight.departureTime), "HH:mm")}</span>
                              <span className="mx-2">→</span>
                              <span>{format(new Date(flight.arrivalTime), "HH:mm")}</span>
                              <span className="mx-2">·</span>
                              <span>{flight.duration}</span>
                              <span className="mx-2">·</span>
                              <span>{flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {flight.price} {flight.currency}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            per person
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Suggested Filters */}
          {results.suggestedFilters && results.suggestedFilters.length > 0 && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm">
                  <Filter className="w-4 h-4" />
                  <span>Try filtering by:</span>
                </div>
                <div className="relative">
                  <div className="flex gap-2 snap-mandatory snap-x pb-2 overflow-x-auto scrollbar-hide">
                    {results.suggestedFilters.map((filter) => (
                      <Button
                        key={filter.id}
                        variant="outline"
                        size="sm"
                        onClick={() => onFilterClick?.(filter)}
                        title={filter.description}
                        className="flex-none bg-background/50 hover:bg-background/80 px-2 py-0.5 snap-start h-auto text-xs"
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* No flights message */}
          {(!results.flights || results.flights.length === 0) && (
            <>
              <Separator className="my-4" />
              <div className="text-center text-muted-foreground">
                No flights found matching your criteria.
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

