"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, AlertCircle, RefreshCw, BarChart3 } from "lucide-react"
import { AppHelpModal, HelpButton } from "@/components/shared/app-help-modal"

const TEAM_CAPACITY_URL = "https://strms-capacity-planning-tool.vercel.app/"
const IFRAME_LOAD_TIMEOUT = 5000 // 5 seconds

export default function TeamCapacityPage() {
  const [iframeStatus, setIframeStatus] = useState<"loading" | "loaded" | "error">("loading")
  const [showFallback, setShowFallback] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Set a timeout to detect if iframe fails to load
    timeoutRef.current = setTimeout(() => {
      if (iframeStatus === "loading") {
        // If still loading after timeout, show fallback option
        setShowFallback(true)
      }
    }, IFRAME_LOAD_TIMEOUT)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [iframeStatus])

  const handleIframeLoad = () => {
    // Clear the timeout since iframe loaded
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIframeStatus("loaded")
    setShowFallback(false)
  }

  const handleIframeError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIframeStatus("error")
    setShowFallback(true)
  }

  const openInNewTab = () => {
    window.open(TEAM_CAPACITY_URL, "_blank", "noopener,noreferrer")
  }

  const retryIframe = () => {
    setIframeStatus("loading")
    setShowFallback(false)
    // Force iframe reload by updating key
    if (iframeRef.current) {
      iframeRef.current.src = TEAM_CAPACITY_URL
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#FAF9F9]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#407B9D]/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#407B9D]" />
          </div>
          <div>
            <h1
              className="text-xl font-semibold text-[#463939]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Team Capacity
            </h1>
            <p
              className="text-sm text-[#666666]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Capacity Planning Tool
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HelpButton onClick={() => setShowHelp(true)} />
          <Button
            variant="outline"
            size="sm"
            onClick={openInNewTab}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Tab
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative">
        {/* Loading indicator */}
        {iframeStatus === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#FAF9F9] z-10">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="w-8 h-8 text-[#407B9D] animate-spin" />
              <p
                className="text-[#666666]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Loading Team Capacity...
              </p>
            </div>
          </div>
        )}

        {/* Fallback UI - shown when iframe might be blocked */}
        {showFallback && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#FAF9F9] z-20">
            <Card className="max-w-md mx-4 bg-white border-none shadow-lg">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 rounded-full bg-[#95CBD7]/20 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-[#407B9D]" />
                </div>
                <CardTitle
                  className="text-xl text-[#463939]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Unable to Embed Team Capacity
                </CardTitle>
                <CardDescription
                  className="text-sm"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Team Capacity may have security settings that prevent embedding. You can still access it in a new tab.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button
                  onClick={openInNewTab}
                  className="w-full bg-[#407B9D] hover:bg-[#407B9D]/90"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Team Capacity in New Tab
                </Button>
                <Button
                  variant="outline"
                  onClick={retryIframe}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* iframe */}
        <iframe
          ref={iframeRef}
          src={TEAM_CAPACITY_URL}
          className="w-full h-full border-0"
          title="Team Capacity - Capacity Planning Tool"
          allow="clipboard-write"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>

      {/* Help Modal */}
      <AppHelpModal
        appName="Team Capacity"
        appDescription="Plan and track team capacity, workload distribution, and resource allocation across projects and team members."
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  )
}
