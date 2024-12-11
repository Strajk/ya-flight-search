"use client"

import { useState } from "react"
import { Calendar, MapPin, Plus, Search, Briefcase, Users } from 'lucide-react'
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

export function FlightSearch() {
  const [tripType, setTripType] = useState("return")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [departDate, setDepartDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [passengers, setPassengers] = useState("1")
  const [bags, setBags] = useState("0")
  const [showResults, setShowResults] = useState(false)

  const handleSearch = () => {
    setShowResults(true)
  }

  return (
    <div className="flex flex-col h-dvh">
      <div className="p-4 space-y-4 flex-none">
        <h1 className="text-2xl font-bold">Where do we fly next?</h1>
        
        <div className="space-y-4">
          <Select value={tripType} onValueChange={setTripType}>
            <SelectTrigger>
              <SelectValue placeholder="Select trip type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oneway">One-way</SelectItem>
              <SelectItem value="return">Return</SelectItem>
              <SelectItem value="multicity">Multi-city</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid gap-4">
            <div className="relative">
              <Label htmlFor="from">From</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                <Plus className="mr-2 h-4 w-4" />
                Add another flight
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Passengers</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Select value={passengers} onValueChange={setPassengers}>
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
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Select value={bags} onValueChange={setBags}>
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

          <Button onClick={handleSearch} className="w-full">
            <Search className="mr-2 h-4 w-4" />
            Search Flights
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {showResults && <SearchResults />}
      </div>

      <AIPrompt className="flex-none" />
    </div>
  )
}

