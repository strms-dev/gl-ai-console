"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  sender: "user" | "agent"
  timestamp: Date
  type?: "command" | "response" | "suggestion"
}

interface ChatInterfaceProps {
  title?: string
  className?: string
}

const mockResponses = [
  "I've analyzed the lead data and generated a readiness assessment. The automation readiness score is 85% based on their tech stack and process complexity.",
  "I can schedule the scoping call with Nick for tomorrow at 2 PM. Would you like me to send the calendar invite?",
  "Based on the demo transcript, I recommend focusing on their data entry automation and API integrations in the scoping call.",
  "The proposal has been generated with a 2-sprint timeline and $24,000 estimate. Ready for your review.",
  "I've created the ClickUp task and Airtable entry for the signed EA. Project setup is complete."
]

export function ChatInterface({ title = "AI Agent Assistant", className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi! I'm your STRMS AI assistant. I can help you with lead management, proposal generation, and workflow automation. How can I help you today?",
      sender: "agent",
      timestamp: new Date(),
      type: "response"
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
      type: "command"
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        sender: "agent",
        timestamp: new Date(),
        type: "response"
      }
      setMessages(prev => [...prev, agentMessage])
      setIsTyping(false)
    }, 1500)
  }

  const quickCommands = [
    "Show readiness score for Acme Corp",
    "Draft proposal for 2 sprints",
    "Schedule scoping call",
    "Generate kickoff email"
  ]

  return (
    <Card className={cn("flex flex-col h-[600px]", className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center space-x-2">
          <span>🤖</span>
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] p-3 rounded-lg break-words",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <p className="text-sm break-words">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4 space-y-3 flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            {quickCommands.map((command, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => sendMessage(command)}
                className="text-xs"
              >
                {command}
              </Button>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  sendMessage(inputValue)
                }
              }}
              placeholder="Ask the AI agent anything..."
              className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
            >
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}