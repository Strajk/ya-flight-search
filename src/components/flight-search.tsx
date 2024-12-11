"use client"

import { useState } from "react"
import { Calendar, MapPin, Plus, Search, Briefcase, Users, AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { SearchInput, SearchState, TripType, ChatMessage, SearchInputSchema } from "@/types/search"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function FlightSearch() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [showResults, setShowResults] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<SearchInput>({
    resolver: zodResolver(SearchInputSchema),
    defaultValues: {
      tripType: "return",
      from: "",
      to: "",
      passengers: 1,
      bags: 0,
    },
  })

  const tripType = watch("tripType")
  const searchMutation = useSearchFlights()

  const onSubmit = (data: SearchInput) => {
    console.log("Form data:", data)

    const searchState: SearchState = {
      input: data,
      chatHistory,
      results: [],
    }

    searchMutation.mutate(searchState, {
      onSuccess: () => {
        setShowResults(true)
        toast({
          title: "Search successful",
          description: "Found flights matching your criteria.",
        })
      },
      onError: (error) => {
        console.error("Search error:", error)
        toast({
          variant: "destructive",
          title: "Search failed",
          description: "Failed to search for flights. Please try again.",
        })
      },
    })
  }

  return (
    <div className="flex flex-col h-dvh">
      <div className="flex-none space-y-4 p-4">
        <h1 className="font-bold text-2xl">Where do we fly next?</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Select
              value={tripType}
              onValueChange={(value: TripType) => {
                setValue("tripType", value)
                trigger("tripType")
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trip type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oneway">One-way</SelectItem>
                <SelectItem value="return">Return</SelectItem>
                <SelectItem value="multicity">Multi-city</SelectItem>
              </SelectContent>
            </Select>
            {errors.tripType && (
              <p className="flex items-center gap-2 mt-1 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.tripType.message}
              </p>
            )}
          </div>

          <div className="gap-4 grid">
            <div className="relative">
              <Label htmlFor="from">From</Label>
              <div className="relative">
                <MapPin className="top-3 left-3 absolute w-4 h-4 text-muted-foreground" />
                <Input
                  id="from"
                  placeholder="Departure city or airport"
                  className={cn("pl-9", errors.from && "border-destructive")}
                  {...register("from")}
                />
              </div>
              {errors.from && (
                <p className="flex items-center gap-2 mt-1 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.from.message}
                </p>
              )}
            </div>

            <div className="relative">
              <Label htmlFor="to">To</Label>
              <div className="relative">
                <MapPin className="top-3 left-3 absolute w-4 h-4 text-muted-foreground" />
                <Input
                  id="to"
                  placeholder="Arrival city or airport"
                  className={cn("pl-9", errors.to && "border-destructive")}
                  {...register("to")}
                />
              </div>
              {errors.to && (
                <p className="flex items-center gap-2 mt-1 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.to.message}
                </p>
              )}
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
              <DatePicker
                date={watch("departDate")}
                setDate={(date) => {
                  setValue("departDate", date)
                  trigger("departDate")
                }}
              />
              {errors.departDate && (
                <p className="flex items-center gap-2 mt-1 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.departDate.message}
                </p>
              )}
            </div>
            {tripType === "return" && (
              <div>
                <Label>Return</Label>
                <DatePicker
                  date={watch("returnDate") || undefined}
                  setDate={(date) => {
                    setValue("returnDate", date || null)
                    trigger("returnDate")
                  }}
                />
                {errors.returnDate && (
                  <p className="flex items-center gap-2 mt-1 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.returnDate.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="gap-4 grid sm:grid-cols-2">
            <div>
              <Label>Passengers</Label>
              <div className="relative">
                <Users className="top-3 left-3 absolute w-4 h-4 text-muted-foreground" />
                <Select
                  value={watch("passengers").toString()}
                  onValueChange={(value) => {
                    setValue("passengers", parseInt(value, 10))
                    trigger("passengers")
                  }}
                >
                  <SelectTrigger className={cn("pl-9", errors.passengers && "border-destructive")}>
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
                {errors.passengers && (
                  <p className="flex items-center gap-2 mt-1 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.passengers.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label>Bags</Label>
              <div className="relative">
                <Briefcase className="top-3 left-3 absolute w-4 h-4 text-muted-foreground" />
                <Select
                  value={watch("bags").toString()}
                  onValueChange={(value) => {
                    setValue("bags", parseInt(value, 10))
                    trigger("bags")
                  }}
                >
                  <SelectTrigger className={cn("pl-9", errors.bags && "border-destructive")}>
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
                {errors.bags && (
                  <p className="flex items-center gap-2 mt-1 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.bags.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full"
            disabled={searchMutation.isPending}
          >
            <Search className="mr-2 w-4 h-4" />
            {searchMutation.isPending ? "Searching..." : "Search Flights"}
          </Button>
        </form>
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

