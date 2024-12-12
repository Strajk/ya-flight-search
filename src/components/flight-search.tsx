"use client"

import { useState } from "react"
import { Calendar, Plane, Search } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchResults } from "@/components/search-results"
import { DatePicker } from "@/components/date-picker"
import { PassengerSelector } from "@/components/passenger-selector"
import { useSearchFlights } from "@/lib/api"
import { SearchFormData, SearchFormDataSchema, ChatMessage, SearchState } from "@/types/search"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { AIPrompt } from "./ai-prompt"
import { createRoot } from "react-dom/client"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"

const defaultFormValues: SearchFormData = {
  departurePlace: "Madrid",
  returnPlace: "Dublin",
  departureDate: "2024-01-25",
  returnDate: "2024-02-01",
}

export function FlightSearch() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const { toast } = useToast()
  const sessionId = "test123" // In production, this should be generated uniquely
  const [passengers, setPassengers] = useState(1)
  const [bags, setBags] = useState(0)

  const {
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
    const searchState: SearchState = {
      sessionId,
      formData,
      messages,
      trigger: "search",
    }

    searchMutation.mutate(searchState, {
      onSuccess: (data) => {
        if (data.formUpdates) {
          Object.entries(data.formUpdates).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              setValue(key as keyof SearchFormData, value as string)
            }
          })
          trigger()
        }

        if (data.messages && data.messages.length > 0) {
          const newAssistantMessage = data.messages[data.messages.length - 1]
          if (newAssistantMessage.role === "assistant") {
            setMessages(prev => [...prev, newAssistantMessage])
          }
        }
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

    setMessages(prev => [...prev, newMessage])

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

    searchMutation.mutate(searchState)
  }

  const departurePlace = watch("departurePlace")
  const returnPlace = watch("returnPlace")

  return (
    <div className="flex flex-col h-dvh">
      <div className="flex-none space-y-6 p-4">
        <div>
          <h1 className="font-semibold text-[2rem] leading-tight">Hello 👋</h1>
          <h2 className="font-semibold text-[2rem] leading-tight">Where do we fly next?</h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-2 bg-white shadow-sm p-4 rounded-lg">
            <Select defaultValue="return">
              <SelectTrigger className="border-0 hover:bg-transparent p-0 focus:ring-0 w-[120px] h-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="return">Return</SelectItem>
                <SelectItem value="one-way">One-way</SelectItem>
              </SelectContent>
            </Select>

            <div className="bg-border w-[1px] h-6" />

            <PassengerSelector
              passengers={passengers}
              bags={bags}
              onPassengersChange={setPassengers}
              onBagsChange={setBags}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-muted-foreground" />
              <Badge variant="success" onClose={() => setValue("departurePlace", "")}>
                {departurePlace}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-muted-foreground" />
              <Badge variant="secondary" onClose={() => setValue("returnPlace", "")}>
                {returnPlace}
              </Badge>
              <span className="text-muted-foreground text-sm">Add more</span>
            </div>
          </div>

          <div 
            className="flex items-center gap-2 bg-white shadow-sm p-4 rounded-lg cursor-pointer"
            onClick={() => {
              const departureDate = watch("departureDate") ? new Date(watch("departureDate")) : undefined
              const returnDate = watch("returnDate") ? new Date(watch("returnDate")) : undefined
              
              const backdrop = document.createElement("div")
              backdrop.style.position = "fixed"
              backdrop.style.top = "0"
              backdrop.style.left = "0"
              backdrop.style.width = "100%"
              backdrop.style.height = "100%"
              backdrop.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
              backdrop.style.zIndex = "40"
              document.body.appendChild(backdrop)
              
              const popover = document.createElement("div")
              popover.style.position = "fixed"
              popover.style.top = "50%"
              popover.style.left = "50%"
              popover.style.transform = "translate(-50%, -50%)"
              popover.style.zIndex = "50"
              document.body.appendChild(popover)
              
              const root = createRoot(popover)
              root.render(
                <Card className="p-4 w-[320px]">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Departure date</Label>
                      <DatePicker
                        date={departureDate}
                        setDate={(date) => {
                          if (date) {
                            setValue("departureDate", format(date, "yyyy-MM-dd"))
                            // If return date is before departure date, clear it
                            if (returnDate && returnDate < date) {
                              setValue("returnDate", null)
                            }
                            trigger()
                          }
                        }}
                        fromDate={new Date()}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Return date</Label>
                      <DatePicker
                        date={returnDate}
                        setDate={(date) => {
                          if (date) {
                            setValue("returnDate", format(date, "yyyy-MM-dd"))
                            trigger()
                          }
                        }}
                        fromDate={departureDate || new Date()}
                      />
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        document.body.removeChild(backdrop)
                        document.body.removeChild(popover)
                        root.unmount()
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </Card>
              )
            }}
          >
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {watch("departureDate") && new Date(watch("departureDate")).toLocaleDateString("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
              {" to "}
              {watch("returnDate") && new Date(watch("returnDate")).toLocaleDateString("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>

          <Button 
            type="submit"
            className="w-full"
            disabled={searchMutation.isPending}
          >
            {searchMutation.isPending ? "Searching..." : "Search"}
          </Button>
        </form>
      </div>

      <div className="flex-1 overflow-auto">
        <SearchResults
          results={messages.length > 0 ? { messages, formUpdates: searchMutation.data?.formUpdates } : null}
          onFilterClick={(filter) => handleChatMessage(filter.prompt)}
          isLoading={searchMutation.isPending}
        />
      </div>

      <AIPrompt className="flex-none" onMessage={handleChatMessage} />
    </div>
  )
}

