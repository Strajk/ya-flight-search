import * as React from "react"
import { Minus, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface PassengerSelectorProps {
  passengers: number
  bags: number
  onPassengersChange: (value: number) => void
  onBagsChange: (value: number) => void
  className?: string
}

export function PassengerSelector({
  passengers,
  bags,
  onPassengersChange,
  onBagsChange,
  className,
}: PassengerSelectorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className={cn("flex items-center gap-4", className)}>
          <button
            type="button"
            className="flex items-center gap-2 text-sm hover:text-foreground/80 transition-colors"
          >
            <Users className="w-4 h-4" />
            {passengers}
          </button>

          <div className="bg-border w-[1px] h-6" />

          <button
            type="button"
            className="flex items-center gap-2 text-sm hover:text-foreground/80 transition-colors"
          >
            <span className="font-medium">{bags}</span>
          </button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-4 w-80" align="start">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Passengers</div>
              <div className="text-muted-foreground text-sm">Add traveling passengers</div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="w-8 h-8"
                onClick={() => onPassengersChange(Math.max(1, passengers - 1))}
                disabled={passengers <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="w-12 font-medium text-center">{passengers}</div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="w-8 h-8"
                onClick={() => onPassengersChange(Math.min(9, passengers + 1))}
                disabled={passengers >= 9}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Bags</div>
              <div className="text-muted-foreground text-sm">Add checked bags</div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="w-8 h-8"
                onClick={() => onBagsChange(Math.max(0, bags - 1))}
                disabled={bags <= 0}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="w-12 font-medium text-center">{bags}</div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="w-8 h-8"
                onClick={() => onBagsChange(Math.min(9, bags + 1))}
                disabled={bags >= 9}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 