import { Card } from "@/components/ui/card"
import { Plane } from 'lucide-react'

export function SearchResults() {
  return (
    <div className="p-4 space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Plane className="h-6 w-6" />
            <div>
              <p className="font-medium">Madrid → Ibiza</p>
              <p className="text-sm text-muted-foreground">2h 15m • Direct</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">€199</p>
            <p className="text-sm text-muted-foreground">per person</p>
          </div>
        </div>
      </Card>
      {/* More flight cards would be added here */}
    </div>
  )
}

