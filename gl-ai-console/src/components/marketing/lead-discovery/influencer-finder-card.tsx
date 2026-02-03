"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowRight, Sparkles, ChevronDown, Linkedin, CheckCircle, Loader2, X } from "lucide-react"

interface InfluencerFinderCardProps {
  newDiscoveriesCount: number
  approvedCount: number
  isDiscovering?: boolean
  onOpenModal: () => void
  onRunDiscovery: (type: 'general' | 'custom', customPrompt?: string) => void
}

export function InfluencerFinderCard({
  newDiscoveriesCount,
  approvedCount,
  isDiscovering = false,
  onOpenModal,
  onRunDiscovery,
}: InfluencerFinderCardProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
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

  const handleRunGeneral = () => {
    setShowDropdown(false)
    onRunDiscovery('general')
  }

  const handleRunCustom = () => {
    setShowDropdown(false)
    setShowCustomInput(true)
  }

  const handleSubmitCustom = () => {
    if (customPrompt.trim()) {
      onRunDiscovery('custom', customPrompt)
      setCustomPrompt('')
      setShowCustomInput(false)
    }
  }

  const options = [
    {
      value: 'general',
      label: 'General',
      description: 'Auto-discover based on your ICP',
      icon: <Sparkles className="w-4 h-4 text-[#407B9D]" />,
      bgColor: 'bg-[#407B9D]/10',
      onClick: handleRunGeneral,
    },
    {
      value: 'custom',
      label: 'Custom',
      description: 'Specify campaign or audience type',
      icon: <Search className="w-4 h-4 text-[#407B9D]" />,
      bgColor: 'bg-[#95CBD7]/20',
      onClick: handleRunCustom,
    },
  ]

  return (
    <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#407B9D]/20 transition-all duration-300 hover:-translate-y-0.5 relative group">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#407B9D]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="pb-4 relative">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#407B9D] to-[#407B9D]/80 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#407B9D]/20 group-hover:scale-105 transition-transform">
            <Search className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <CardTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Influencer Finder
              </CardTitle>
              {newDiscoveriesCount > 0 && (
                <Badge className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB] border-none animate-pulse">
                  {newDiscoveriesCount} New
                </Badge>
              )}
            </div>
            <CardDescription className="leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              Discover LinkedIn influencers whose audience matches your ICP. Find thought leaders in finance, SaaS, and business growth.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Row - Enhanced */}
        <div className="flex items-center gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground bg-[#0A66C2]/5 px-3 py-1.5 rounded-full">
            <Linkedin className="w-4 h-4 text-[#0A66C2]" />
            <span style={{ fontFamily: 'var(--font-body)' }}>
              LinkedIn Only
            </span>
          </div>
          {approvedCount > 0 && (
            <div className="flex items-center gap-1.5 text-[#463939] bg-green-50 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span style={{ fontFamily: 'var(--font-body)' }}>
                {approvedCount} Approved
              </span>
            </div>
          )}
        </div>

        {/* Generating State - Enhanced animation */}
        {isDiscovering && (
          <div className="mb-4 p-4 bg-gradient-to-r from-[#407B9D]/5 to-[#95CBD7]/5 rounded-xl border border-[#407B9D]/20 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#407B9D]/10 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-[#407B9D] animate-spin" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#463939]" style={{ fontFamily: 'var(--font-heading)' }}>
                  Discovering Influencers...
                </p>
                <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  Searching LinkedIn for influencers matching your ICP
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Custom Prompt Input - Enhanced styling */}
        {showCustomInput && !isDiscovering && (
          <div className="mb-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
            <p className="text-sm font-medium text-[#463939] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              What type of influencers are you looking for?
            </p>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., Looking for influencers targeting CPG industry startups, or fractional CFOs for e-commerce brands..."
              className="w-full p-3 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#407B9D] focus:border-transparent transition-all"
              rows={2}
              style={{ fontFamily: 'var(--font-body)' }}
            />
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleSubmitCustom}
                disabled={!customPrompt.trim()}
                className="bg-[#407B9D] hover:bg-[#407B9D]/90 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Run Discovery
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowCustomInput(false)
                  setCustomPrompt('')
                }}
                className="hover:bg-slate-100"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-slate-50 px-3 py-1.5 rounded-full">
            <Sparkles className="w-4 h-4 text-[#407B9D]" />
            <span style={{ fontFamily: 'var(--font-body)' }}>
              AI-powered ICP matching
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              ref={buttonRef}
              variant="outline"
              size="sm"
              disabled={isDiscovering}
              onClick={handleToggleDropdown}
              className="border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D] hover:text-white transition-colors"
            >
              {isDiscovering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Discovering...
                </>
              ) : (
                <>
                  Run Discovery
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </>
              )}
            </Button>

            {/* Custom Dropdown - Portal to body */}
            {mounted && showDropdown && !isDiscovering && dropdownPosition && createPortal(
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
                  <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-[#407B9D]/5 to-transparent flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#463939]" style={{ fontFamily: 'var(--font-heading)' }}>
                      Select Discovery Type
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
                        onClick={option.onClick}
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
