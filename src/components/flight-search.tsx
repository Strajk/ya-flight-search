"use client"

import { useState } from "react"
import { Calendar, MapPin, Plus, Search, Briefcase, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchResults } from "@/components/search-results"
import { AIPrompt } from "@/components/ai-prompt"
import { DatePicker } from "@/components/date-picker"
import { useSearchFlights } from "@/lib/api"
import { SearchInput, SearchState, TripType, ChatMessage } from "@/types/search"

export function FlightSearch() {
  const [tripType, setTripType] = useState<TripType>("return")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [departDate, setDepartDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [passengers, setPassengers] = useState(1)
  const [bags, setBags] = useState(0)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [showResults, setShowResults] = useState(false)

  const searchMutation = useSearchFlights()

  const handleSearch = () => {
    if (!departDate) return

    const searchInput: SearchInput = {
      tripType,
      from,
      to,
      departDate,
      returnDate: tripType === "return" ? returnDate : null,
      passengers,
      bags,
    }

    const searchState: SearchState = {
      input: searchInput,
      chatHistory,
      results: [],
    }

    searchMutation.mutate(searchState, {
      onSuccess: () => {
        setShowResults(true)
      },
    })
  }

  return (
    <div className="flex flex-col h-dvh">
      <div className="flex-none space-y-4 p-4">
        <h1 className="font-bold text-2xl">Where do we fly next?</h1>
        
        <div className="space-y-4">
          <Select value={tripType} onValueChange={(value: TripType) => setTripType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select trip type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oneway">One-way</SelectItem>
              <SelectItem value="return">Return</SelectItem>
              <SelectItem value="multicity">Multi-city</SelectItem>
            </SelectContent>
          </Select>

          <div className="gap-4 grid">
            <div className="relative">
              <Label htmlFor="from">From</Label>
              <div className="relative">
                <MapPin className="top-3 left-3 absolute w-4 h-4 text-muted-foreground" />
                <Input
                  id="from"
                  placeholder="Departure city or airport"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="relative">
              <Label htmlFor="to">To</Label>
              <div className="relative">
                <MapPin className="top-3 left-3 absolute w-4 h-4 text-muted-foreground" />
                <Input
                  id="to"
                  placeholder="Arrival city or airport"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {tripType === "multicity" && (
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 w-4 h-4" />
                Add another flight
              </Button>
            )}
          </div>

          <div className="gap-4 grid sm:grid-cols-2">
            <div>
              <Label>Departure</Label>
              <DatePicker date={departDate} setDate={setDepartDate} />
            </div>
            {tripType === "return" && (
              <div>
                <Label>Return</Label>
                <DatePicker date={returnDate} setDate={setReturnDate} />
              </div>
            )}
          </div>

          <div className="gap-4 grid sm:grid-cols-2">
            <div>
              <Label>Passengers</Label>
              <div className="relative">
                <Users className="top-3 left-3 absolute w-4 h-4 text-muted-foreground" />
                <Select 
                  value={passengers.toString()} 
                  onValueChange={(value) => setPassengers(parseInt(value, 10))}
                >
                  <SelectTrigger className="pl-9">
                    <SelectValue placeholder="Select passengers" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "passenger" : "passengers"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Bags</Label>
              <div className="relative">
                <Briefcase className="top-3 left-3 absolute w-4 h-4 text-muted-foreground" />
                <Select 
                  value={bags.toString()} 
                  onValueChange={(value) => setBags(parseInt(value, 10))}
                >
                  <SelectTrigger className="pl-9">
                    <SelectValue placeholder="Select bags" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "bag" : "bags"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSearch} 
            className="w-full"
            disabled={searchMutation.isPending}
          >
            <Search className="mr-2 w-4 h-4" />
            {searchMutation.isPending ? "Searching..." : "Search Flights"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {showResults && <SearchResults results={searchMutation.data} />}
      </div>

      <AIPrompt className="flex-none" onMessage={(message) => {
        setChatHistory((prev) => [...prev, { role: "user", content: message }])
      }} />
    </div>
  )
}

