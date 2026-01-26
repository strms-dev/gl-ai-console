"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MessageSquare,
  Send,
  ChevronUp,
  ChevronDown,
  Sparkles,
  User,
} from "lucide-react"
import { LeadChatMessage, LeadWorkflowContext } from "@/lib/lead-discovery-types"

interface LeadDiscoveryChatProps {
  messages: LeadChatMessage[]
  workflowContext: LeadWorkflowContext
  onSendMessage: (message: string) => void
}

const contextLabels: Record<LeadWorkflowContext, string> = {
  dashboard: 'Lead Discovery',
  influencer_finder: 'Influencer Finder',
  trigify_tracker: 'Trigify Tracker',
  hypothesis_lab: 'Hypothesis Lab',
  clay_pipeline: 'Clay Pipeline',
  queue: 'Lead Queue',
}

export function LeadDiscoveryChat({
  messages,
  workflowContext,
  onSendMessage,
}: LeadDiscoveryChatProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isExpanded) {
      scrollToBottom()
    }
  }, [messages, isExpanded])

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim())
      setInputValue("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#407B9D]/10 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-[#407B9D]" />
          </div>
          <div className="text-left">
            <p
              className="font-medium text-[#463939] text-sm"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Lead Discovery Assistant
            </p>
            <p className="text-xs text-muted-foreground">
              Context: {contextLabels[workflowContext]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <span className="text-xs text-muted-foreground bg-slate-200 px-2 py-0.5 rounded-full">
              {messages.length} messages
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Chat Area */}
      {isExpanded && (
        <div className="border-t">
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="w-8 h-8 text-[#407B9D]/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Ask questions about lead discovery strategy, influencers, or hypothesis ideas.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  The assistant has context about your {contextLabels[workflowContext].toLowerCase()}.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-[#407B9D]" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-[#407B9D] text-white'
                        : 'bg-white border shadow-sm'
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        message.role === 'user' ? 'text-white' : 'text-[#463939]'
                      }`}
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-white/70' : 'text-muted-foreground'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Ask about lead discovery..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="bg-[#407B9D] hover:bg-[#407B9D]/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send. The assistant will respond based on your current context.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
