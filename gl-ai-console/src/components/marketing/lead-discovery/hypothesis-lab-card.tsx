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
    <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#C8E4BB]/30 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C8E4BB]/15 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="pb-4 relative">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C8E4BB] to-[#95CBD7] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#C8E4BB]/20 group-hover:scale-105 transition-transform">
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
                <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB] border-none">
                  {activeHypothesesCount} Active
                </Badge>
              )}
            </div>
            <CardDescription className="leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              Generate and validate lead hypotheses. Define ICP criteria and discover untapped lead sources.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-slate-50 px-3 py-1.5 rounded-full">
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
                  className="border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D] hover:text-white transition-colors"
                >
                  New Hypothesis
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <DropdownMenuItem
                  onClick={() => onStartWorkflow('general')}
                  className="cursor-pointer p-3 rounded-lg hover:bg-[#407B9D]/5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-[#407B9D]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-[#463939]">General</span>
                      <span className="text-xs text-muted-foreground">
                        AI generates hypothesis ideas based on ICP
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onStartWorkflow('specific')}
                  className="cursor-pointer p-3 rounded-lg hover:bg-[#407B9D]/5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#C8E4BB]/30 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-[#407B9D]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-[#463939]">Specific</span>
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
              className="bg-[#407B9D] hover:bg-[#407B9D]/90 shadow-sm hover:shadow-md transition-all"
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
