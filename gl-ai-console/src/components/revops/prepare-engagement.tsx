"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PrepareEngagementStageData } from "@/lib/sales-pipeline-timeline-types"
import {
  CheckCircle2,
  FileText,
  Wand2,
  Loader2,
  Pencil,
  X,
  ArrowRight
} from "lucide-react"

interface PrepareEngagementProps {
  engagementData: PrepareEngagementStageData
  companyName: string
  onStartGeneration: () => void
  onCompleteGeneration: () => void
  onUpdateWalkthrough: (text: string) => void
  onConfirmWalkthrough: () => void
}

export function PrepareEngagement({
  engagementData,
  companyName,
  onStartGeneration,
  onCompleteGeneration,
  onUpdateWalkthrough,
  onConfirmWalkthrough
}: PrepareEngagementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(engagementData.walkthroughText || "")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateWalkthrough = useCallback(() => {
    setIsGenerating(true)
    onStartGeneration()

    // Simulate AI generation with 2 second delay
    setTimeout(() => {
      onCompleteGeneration()
      setIsGenerating(false)
    }, 2000)
  }, [onStartGeneration, onCompleteGeneration])

  const handleSaveEdit = () => {
    onUpdateWalkthrough(editedText)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedText(engagementData.walkthroughText || "")
    setIsEditing(false)
  }

  const hasWalkthrough = !!engagementData.walkthroughText && engagementData.walkthroughText.trim() !== ""
  const isConfirmed = !!engagementData.walkthroughConfirmedAt

  // If confirmed, show completed state
  if (isConfirmed) {
    return (
      <div className="mt-4 p-4 border border-[#C8E4BB] rounded-lg bg-[#C8E4BB]/10">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#5A8A4A]" />
          <h4
            className="text-lg font-medium text-[#463939]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Engagement Walkthrough Confirmed
          </h4>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          <p>
            Walkthrough for {companyName} has been confirmed and is ready for internal review.
          </p>
          {engagementData.walkthroughConfirmedAt && (
            <p className="mt-1 text-[#5A8A4A]">
              Confirmed on {new Date(engagementData.walkthroughConfirmedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 border border-[#407B9D]/30 rounded-lg bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#407B9D]" />
          <h4
            className="text-lg font-medium text-[#463939]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Prepare Engagement Walkthrough
          </h4>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "var(--font-body)" }}>
        Generate an AI-powered engagement walkthrough document that outlines the services, pricing, and terms for {companyName}.
      </p>

      {/* Step 1: Generate Walkthrough */}
      <div className={`mb-4 p-4 rounded-lg border ${hasWalkthrough ? "bg-[#C8E4BB]/10 border-[#C8E4BB]" : "bg-gray-50 border-gray-200"}`}>
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            {hasWalkthrough && <CheckCircle2 className="w-4 h-4 text-[#5A8A4A]" />}
            Step 1: Generate Walkthrough
          </h5>
          {!hasWalkthrough && (
            <Button
              size="sm"
              onClick={handleGenerateWalkthrough}
              disabled={isGenerating}
              className="h-8 bg-[#407B9D] hover:bg-[#366a88] text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          )}
        </div>

        {isGenerating && (
          <p className="text-xs text-muted-foreground">
            AI is analyzing your quote and client data to generate a personalized walkthrough...
          </p>
        )}

        {hasWalkthrough && (
          <p className="text-xs text-[#5A8A4A]">
            Walkthrough generated on {engagementData.walkthroughGeneratedAt ? new Date(engagementData.walkthroughGeneratedAt).toLocaleDateString() : ""}
            {engagementData.isEdited && " (edited)"}
          </p>
        )}
      </div>

      {/* Step 2: Review and Edit Walkthrough */}
      {hasWalkthrough && (
        <div className="mb-4 p-4 rounded-lg border bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-medium" style={{ fontFamily: "var(--font-heading)" }}>
              Step 2: Review Walkthrough
            </h5>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditedText(engagementData.walkthroughText || "")
                  setIsEditing(true)
                }}
                className="h-6 text-xs text-[#407B9D] hover:bg-[#407B9D]/10"
              >
                <Pencil className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="walkthrough" className="text-xs">Walkthrough Content</Label>
                <Textarea
                  id="walkthrough"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={15}
                  className="mt-1 font-mono text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-7"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  className="h-7 bg-[#407B9D] hover:bg-[#366a88] text-white"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-white p-3 max-h-[300px] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-xs text-[#463939]">
                  {engagementData.walkthroughText}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirm and Continue */}
      {hasWalkthrough && !isEditing && (
        <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium" style={{ fontFamily: "var(--font-heading)" }}>
              Step 3: Confirm and Send for Internal Review
            </h5>
            <Button
              onClick={onConfirmWalkthrough}
              className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm Walkthrough
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
