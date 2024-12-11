"use client"

import { useState } from "react"
import { Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface AIPromptProps {
  className?: string
}

export function AIPrompt({ className }: AIPromptProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState("")

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex gap-4">
          <Input
            placeholder="Find me flights, please!"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsExpanded(true)}
          />
          <Button size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {isExpanded && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Try asking:
            </p>
            <ul className="text-sm space-y-1">
              <li>"Find me cheap weekend flights to somewhere warm"</li>
              <li>"What's the best time to fly to avoid delays?"</li>
              <li>"Show me flights under €200 with good layover times"</li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  )
}

