"use client"

import { useState } from "react"
import { Calendar, MapPin, Search, Briefcase, Users, AlertCircle } from "lucide-react"
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
import { SearchFormData, SearchFormDataSchema, ChatMessage, SearchState, SuggestedFilter } from "@/types/search"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Example values matching the API example
const defaultFormValues: SearchFormData = {
  departurePlace: "PRG",
  returnPlace: "LON",
  departureDate: "2024-03-01",
  returnDate: "2024-03-01",
}

export function FlightSearch() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [searchResults, setSearchResults] = useState<Array<typeof searchMutation.data>>([])
  const { toast } = useToast()
  const sessionId = "test123" // In production, this should be generated uniquely

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<SearchFormData>({
    resolver: zodResolver(SearchFormDataSchema),
    defaultValues: defaultFormValues,
  })

  const searchMutation = useSearchFlights()

  const onSubmit = (formData: SearchFormData) => {
    console.log("Form data:", formData)

    const searchState: SearchState = {
      sessionId,
      formData: {
        departurePlace: formData.departurePlace,
        returnPlace: formData.returnPlace,
        departureDate: formData.departureDate,
        returnDate: formData.returnDate,
      },
      messages,
      trigger: "search",
    }

    searchMutation.mutate(searchState, {
      onSuccess: (data) => {
        if (data.message) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.message },
          ])
        }

        // Update form values if formUpdates are present
        if (data.formUpdates) {
          Object.entries(data.formUpdates).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              setValue(key as keyof SearchFormData, value as string)
            }
          })
          // Trigger validation after form updates
          trigger()
        }

        setSearchResults(prev => [...prev, data])
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

  const handleChatMessage = (message: string) => {
    const newMessage: ChatMessage = {
      role: "user",
      content: message,
    }
    setMessages((prev) => [...prev, newMessage])

    const searchState: SearchState = {
      sessionId,
      formData: {
        departurePlace: watch("departurePlace"),
        returnPlace: watch("returnPlace"),
        departureDate: watch("departureDate"),
        returnDate: watch("returnDate"),
      },
      messages: [...messages, newMessage],
      trigger: "chat",
    }

    searchMutation.mutate(searchState, {
      onSuccess: (data) => {
        if (data.message) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.message },
          ])
        }

        // Update form values if formUpdates are present
        if (data.formUpdates) {
          Object.entries(data.formUpdates).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              setValue(key as keyof SearchFormData, value as string)
            }
          })
          // Trigger validation after form updates
          trigger()
        }

        // Update the last result set instead of adding a new one
        setSearchResults(prev => {
          const newResults = [...prev]
          if (newResults.length > 0) {
            newResults[newResults.length - 1] = data
          }
          return newResults
        })
      },
      onError: (error) => {
        console.error("Chat error:", error)
        toast({
          variant: "destructive",
          title: "Chat failed",
          description: "Failed to process your message. Please try again.",
        })
      },
    })
  }

  const handleFilterClick = (filter: SuggestedFilter) => {
    const message = `Show me flights that are ${filter.label.toLowerCase()}`
    handleChatMessage(message)
  }

  const returnDate = watch("returnDate")
  const parsedReturnDate = returnDate ? new Date(returnDate) : undefined

  return (
    <div className="flex flex-col h-dvh">
      <div className="flex-none space-y-4 p-4">
        <h1 className="font-bold text-2xl">Where do we fly next?</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="gap-4 grid">
            <div className="relative">
              <Label htmlFor="departurePlace">From</Label>
              <div className="relative">
                <MapPin className="top-3 left-3 absolute w-4 h-4 text-muted-foreground" />
                <Input
                  id="departurePlace"
                  placeholder="Departure city or airport"
                  className={cn("pl-9", errors.departurePlace && "border-destructive")}
                  {...register("departurePlace")}
                />
              </div>
              {errors.departurePlace && (
                <p className="flex items-center gap-2 mt-1 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.departurePlace.message}
                </p>
              )}
            </div>

            <div className="relative">
              <Label htmlFor="returnPlace">To</Label>
              <div className="relative">
                <MapPin className="top-3 left-3 absolute w-4 h-4 text-muted-foreground" />
                <Input
                  id="returnPlace"
                  placeholder="Arrival city or airport"
                  className={cn("pl-9", errors.returnPlace && "border-destructive")}
                  {...register("returnPlace")}
                />
              </div>
              {errors.returnPlace && (
                <p className="flex items-center gap-2 mt-1 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.returnPlace.message}
                </p>
              )}
            </div>

            <div className="gap-4 grid sm:grid-cols-2">
              <div>
                <Label>Departure</Label>
                <DatePicker
                  date={watch("departureDate") ? new Date(watch("departureDate")) : undefined}
                  setDate={(date) => {
                    setValue("departureDate", date ? date.toISOString().split("T")[0] : "")
                    trigger("departureDate")
                  }}
                />
              </div>
              <div>
                <Label>Return</Label>
                <DatePicker
                  date={parsedReturnDate}
                  setDate={(date) => {
                    setValue("returnDate", date ? date.toISOString().split("T")[0] : null)
                    trigger("returnDate")
                  }}
                />
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
        {searchResults.map((result, index) => (
          <SearchResults
            key={index}
            results={result}
            onFilterClick={handleFilterClick}
            isLoading={searchMutation.isPending}
          />
        ))}
      </div>

      <AIPrompt className="flex-none" onMessage={handleChatMessage} />
    </div>
  )
}

