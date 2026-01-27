"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Lightbulb, ArrowRight, FlaskConical, ChevronDown, Sparkles, Loader2 } from "lucide-react"

interface HypothesisLabCardProps {
  activeHypothesesCount: number
  isGenerating?: boolean
  onOpenModal: () => void
  onNewHypothesis: (type: 'general' | 'custom', customPrompt?: string) => void
}

export function HypothesisLabCard({
  activeHypothesesCount,
  isGenerating = false,
  onOpenModal,
  onNewHypothesis,
}: HypothesisLabCardProps) {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')

  const handleRunGeneral = () => {
    onNewHypothesis('general')
  }

  const handleRunCustom = () => {
    setShowCustomInput(true)
  }

  const handleSubmitCustom = () => {
    if (customPrompt.trim()) {
      onNewHypothesis('custom', customPrompt)
      setCustomPrompt('')
      setShowCustomInput(false)
    }
  }

  return (
    <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg bg-[#C8E4BB]/30 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-7 h-7 text-[#407B9D]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <CardTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Hypothesis Lab
              </CardTitle>
              {activeHypothesesCount > 0 && (
                <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]">
                  {activeHypothesesCount} Active
                </Badge>
              )}
            </div>
            <CardDescription style={{ fontFamily: 'var(--font-body)' }}>
              Generate and validate lead hypotheses. Define ICP criteria and discover untapped lead sources.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Generating State */}
        {isGenerating && (
          <div className="mb-4 p-4 bg-[#C8E4BB]/20 rounded-lg border border-[#C8E4BB]/40">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-[#407B9D] animate-spin" />
              <div>
                <p className="text-sm font-medium text-[#463939]" style={{ fontFamily: 'var(--font-heading)' }}>
                  Generating Hypotheses...
                </p>
                <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  Analyzing ICP data to generate lead source ideas
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Custom Prompt Input (shown when custom is selected) */}
        {showCustomInput && !isGenerating && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg border">
            <p className="text-sm font-medium text-[#463939] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              What type of leads are you looking for?
            </p>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., Companies in CPG industry that recently raised funding, or startups searching for fractional CFO services..."
              className="w-full p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#407B9D] focus:border-transparent"
              rows={2}
              style={{ fontFamily: 'var(--font-body)' }}
            />
            <div className="flex items-center gap-2 mt-2">
              <Button
                size="sm"
                onClick={handleSubmitCustom}
                disabled={!customPrompt.trim()}
                className="bg-[#407B9D] hover:bg-[#407B9D]/90"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Generate Ideas
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowCustomInput(false)
                  setCustomPrompt('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FlaskConical className="w-4 h-4 text-[#407B9D]" />
            <span style={{ fontFamily: 'var(--font-body)' }}>
              AI-powered hypothesis generation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                  className="border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D]/10"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      New Hypothesis
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleRunGeneral} className="cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-medium">General</span>
                    <span className="text-xs text-muted-foreground">
                      Auto-generate based on ICP data
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRunCustom} className="cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-medium">Custom</span>
                    <span className="text-xs text-muted-foreground">
                      Provide specific direction
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              onClick={onOpenModal}
              className="bg-[#407B9D] hover:bg-[#407B9D]/90"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
