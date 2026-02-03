"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, ArrowRight, FlaskConical, ChevronDown, Sparkles, Target, X } from "lucide-react"
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
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggleDropdown = () => {
    if (!showDropdown && buttonRef.current) {
      // Calculate position before showing
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.right - 320, // 320px is the dropdown width (w-80)
      })
    }
    setShowDropdown(!showDropdown)
  }

  const handleOptionSelect = (mode: HypothesisEntryMode) => {
    setShowDropdown(false)
    onStartWorkflow(mode)
  }

  const options = [
    {
      value: 'general' as HypothesisEntryMode,
      label: 'General',
      description: 'AI generates hypothesis ideas based on ICP',
      icon: <Sparkles className="w-4 h-4 text-[#407B9D]" />,
      bgColor: 'bg-[#407B9D]/10',
    },
    {
      value: 'specific' as HypothesisEntryMode,
      label: 'Specific',
      description: 'You provide the target audience details',
      icon: <Target className="w-4 h-4 text-[#407B9D]" />,
      bgColor: 'bg-[#C8E4BB]/30',
    },
  ]

  return (
    <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#C8E4BB]/30 transition-all duration-300 hover:-translate-y-0.5 relative group">
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
            <Button
              ref={buttonRef}
              variant="outline"
              size="sm"
              onClick={handleToggleDropdown}
              className="border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D] hover:text-white transition-colors"
            >
              New Hypothesis
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </Button>

            {/* Custom Dropdown - Portal to body */}
            {mounted && showDropdown && dropdownPosition && createPortal(
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setShowDropdown(false)}
                />
                {/* Dropdown */}
                <div
                  className="fixed w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
                >
                  <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-[#C8E4BB]/10 to-transparent flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#463939]" style={{ fontFamily: 'var(--font-heading)' }}>
                      Select Hypothesis Type
                    </span>
                    <button
                      onClick={() => setShowDropdown(false)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                  <div className="p-2">
                    {options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleOptionSelect(option.value)}
                        className="w-full p-3 text-left rounded-lg hover:bg-[#407B9D]/5 transition-all flex items-start gap-3 group/item"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${option.bgColor} group-hover/item:scale-105 transition-transform`}>
                          {option.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-[#463939] group-hover/item:text-[#407B9D] transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
                            {option.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                            {option.description}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover/item:text-[#407B9D] group-hover/item:translate-x-0.5 mt-1 flex-shrink-0 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              </>,
              document.body
            )}

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
