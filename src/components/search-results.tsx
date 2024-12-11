import { format } from "date-fns"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plane, MessageCircle, Filter, Loader2, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Flight, SearchResponse, SuggestedFilter } from "@/types/search"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { useRef, useState } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"


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
              {results.messages.map((message) => (
                <p key={message.role}>
                  <strong>{message.role === "user" ? "You" : "Assistant"}:</strong> {message.content}
                </p>
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
                      className="flex-none bg-muted/50 hover:bg-muted/70 p-6 snap-start w-[380px] sm:w-[400px] transition-colors"
                    >
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <div className="font-medium text-2xl tracking-tight">
                              {format(new Date(flight.departureTime), "HH:mm")}
                            </div>
                            <HoverCard>
                              <HoverCardTrigger>
                                <div className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                                  {flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                                </div>
                              </HoverCardTrigger>
                              <HoverCardContent>
                                <div className="flex items-center gap-2">
                                  <Plane className="w-4 h-4" />
                                  <span>{flight.airline} {flight.flightNumber}</span>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </div>

                          <div className="flex flex-col items-center px-6">
                            <div className="font-medium text-sm">
                              {flight.duration}
                            </div>
                            <div className="relative my-2 bg-border w-32 h-[2px]">
                              <div className="-top-[5px] -left-1 absolute bg-primary rounded-full w-2 h-2" />
                              <div className="-top-[5px] -right-1 absolute bg-primary rounded-full w-2 h-2" />
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <div className="font-medium text-2xl tracking-tight">
                              {format(new Date(flight.arrivalTime), "HH:mm")}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {format(new Date(flight.arrivalTime), "EEE, MMM d")}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-baseline gap-1">
                            <div className="font-medium text-2xl tracking-tight">
                              {flight.price}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {flight.currency}
                            </div>
                          </div>
                          
                          <Button className="gap-2">
                            Book flight
                            <ArrowRight className="w-4 h-4" />
                          </Button>
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
                        title={filter.prompt}
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

