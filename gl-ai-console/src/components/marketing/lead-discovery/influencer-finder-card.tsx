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
import { Search, ArrowRight, Sparkles, ChevronDown, Linkedin, CheckCircle, Loader2 } from "lucide-react"

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
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')

  const handleRunGeneral = () => {
    onRunDiscovery('general')
  }

  const handleRunCustom = () => {
    setShowCustomInput(true)
  }

  const handleSubmitCustom = () => {
    if (customPrompt.trim()) {
      onRunDiscovery('custom', customPrompt)
      setCustomPrompt('')
      setShowCustomInput(false)
    }
  }

  return (
    <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#407B9D]/20 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isDiscovering}
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
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <DropdownMenuItem onClick={handleRunGeneral} className="cursor-pointer p-3 rounded-lg hover:bg-[#407B9D]/5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-[#407B9D]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-[#463939]">General</span>
                      <span className="text-xs text-muted-foreground">
                        Auto-discover based on your ICP
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRunCustom} className="cursor-pointer p-3 rounded-lg hover:bg-[#407B9D]/5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#95CBD7]/20 flex items-center justify-center flex-shrink-0">
                      <Search className="w-4 h-4 text-[#407B9D]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-[#463939]">Custom</span>
                      <span className="text-xs text-muted-foreground">
                        Specify campaign or audience type
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
