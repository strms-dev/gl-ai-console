"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Lightbulb, ArrowRight, FlaskConical, ChevronDown, Sparkles, Target } from "lucide-react"
import { HypothesisEntryMode } from "@/lib/lead-discovery-types"

interface HypothesisLabCardProps {
  activeHypothesesCount: number
  onOpenModal: () => void
  onStartWorkflow: (entryMode: HypothesisEntryMode) => void
}

export function HypothesisLabCard({
  activeHypothesesCount,
  onOpenModal,
  onStartWorkflow,
}: HypothesisLabCardProps) {
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
                  className="border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D]/10"
                >
                  New Hypothesis
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => onStartWorkflow('general')}
                  className="cursor-pointer"
                >
                  <div className="flex items-start gap-3 py-1">
                    <Sparkles className="w-4 h-4 mt-0.5 text-[#407B9D]" />
                    <div className="flex flex-col">
                      <span className="font-medium">General</span>
                      <span className="text-xs text-muted-foreground">
                        AI generates hypothesis ideas based on ICP
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onStartWorkflow('specific')}
                  className="cursor-pointer"
                >
                  <div className="flex items-start gap-3 py-1">
                    <Target className="w-4 h-4 mt-0.5 text-[#407B9D]" />
                    <div className="flex flex-col">
                      <span className="font-medium">Specific</span>
                      <span className="text-xs text-muted-foreground">
                        You provide the target audience details
                      </span>
                    </div>
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
