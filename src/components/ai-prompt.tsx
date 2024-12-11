"use client"

import { useState } from "react"
import { Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface AIPromptProps {
  className?: string
  onMessage: (message: string) => void
}

export function AIPrompt({ className, onMessage }: AIPromptProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    onMessage(input.trim())
    setInput("")
  }

  return (
    <Card className={`p-4 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <Input
            placeholder="Find me flights, please!"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsExpanded(true)}
          />
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {isExpanded && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              Try asking:
            </p>
            <ul className="space-y-1 text-sm">
              <li>"Find me cheap weekend flights to somewhere warm"</li>
              <li>"What's the best time to fly to avoid delays?"</li>
              <li>"Show me flights under €200 with good layover times"</li>
            </ul>
          </div>
        )}
      </form>
    </Card>
  )
}

