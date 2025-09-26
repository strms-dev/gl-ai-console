"use client"

import Link from "next/link"
import { Timeline } from "@/components/leads/timeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChatInterface } from "@/components/chat/chat-interface"
import { stageLabels, stageColors, Lead } from "@/lib/dummy-data"
import { getTimelineForLead } from "@/lib/timeline-data"
import { cn } from "@/lib/utils"
import { FileUpload } from "@/components/leads/file-upload"
import { fileTypes, UploadedFile } from "@/lib/file-types"
import { getLeadById, updateLead } from "@/lib/leads-store"
import { use, useState, useEffect, useMemo } from "react"

interface LeadDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function LeadDetailPage({ params }: LeadDetailPageProps) {
  // Use React's use hook for client components
  const { id } = use(params)

  // Reactive lead state that updates when lead data changes
  const [lead, setLead] = useState<Lead | undefined>(() => getLeadById(id))

  // Generate timeline based on current lead stage
  const timeline = useMemo(() => {
    return getTimelineForLead(id, lead?.stage)
  }, [id, lead?.stage])

  // State to track uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({})

  // Calculate actual timeline progress based on lead stage and uploaded files
  const calculateTimelineProgress = () => {
    if (!lead) return { completed: 0, total: timeline.length }

    // Define the stage order and their dependencies
    const stageOrder = ['demo', 'readiness', 'decision', 'scoping-prep', 'scoping', 'dev-overview', 'workflow-docs', 'sprint-pricing', 'proposal', 'proposal-decision', 'internal-client-docs', 'ea', 'setup', 'kickoff']
    const currentStageIndex = stageOrder.indexOf(lead.stage)

    let completedCount = 0

    // Count stages before current stage as completed
    // Current stage is only completed if we've moved past it
    for (let i = 0; i < currentStageIndex && i < stageOrder.length; i++) {
      completedCount++
    }

    return { completed: completedCount, total: timeline.length }
  }

  const { completed: completedStages, total: totalStages } = calculateTimelineProgress()

  // State to track collapsible sections
  const [collapsedSections, setCollapsedSections] = useState({
    summary: false,
    timeline: false,
    assistant: false,
    documents: false
  })


  // Monitor for lead data changes
  useEffect(() => {
    const checkForLeadUpdates = () => {
      const updatedLead = getLeadById(id)
      setLead(updatedLead)
    }

    // Check immediately
    checkForLeadUpdates()

    // Set up an interval to check for updates
    const interval = setInterval(checkForLeadUpdates, 100)

    return () => clearInterval(interval)
  }, [id])

  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFiles(prev => ({
      ...prev,
      [file.fileTypeId]: file
    }))

    // Define file to stage transition mappings
    const fileStageMap: Record<string, string> = {
      'demo-call-transcript': 'readiness',
      'readiness-pdf': 'decision',
      'scoping-prep-doc': 'scoping',
      'scoping-call-transcript': 'dev-overview',
      'developer-audio-overview': 'workflow-docs',
      'workflow-description': 'sprint-pricing',
      'sprint-pricing-estimate': 'proposal',
      'internal-client-documentation': 'ea',
      // Note: kickoff-meeting-brief doesn't need a mapping since kickoff is the final stage
    }

    // Get the next stage for this file type
    const nextStage = fileStageMap[file.fileTypeId]

    if (nextStage) {
      // Small delay for stage automation to not interfere with UI
      setTimeout(() => {
        const currentLead = getLeadById(id)
        if (currentLead) {
          updateLead(id, { stage: nextStage }) // Move to next stage
          // Force refresh of lead data
          setLead(getLeadById(id))
        }
      }, 100)
    }
  }

  const handleFileCleared = (fileTypeId: string) => {
    setUploadedFiles(prev => {
      const updated = { ...prev }
      delete updated[fileTypeId]
      return updated
    })

    // Define file to stage reset mappings (back to the stage that requires the file)
    const fileResetStageMap: Record<string, string> = {
      'demo-call-transcript': 'demo',
      'readiness-pdf': 'readiness',
      'scoping-prep-doc': 'scoping-prep',
      'scoping-call-transcript': 'scoping',
      'developer-audio-overview': 'dev-overview',
      'workflow-description': 'workflow-docs',
      'sprint-pricing-estimate': 'sprint-pricing',
      'internal-client-documentation': 'internal-client-docs',
      'kickoff-meeting-brief': 'kickoff'
    }

    // Get the stage to reset to for this file type
    const resetStage = fileResetStageMap[fileTypeId]

    if (resetStage) {
      // Reset the lead stage back to the stage that requires this file
      const currentLead = getLeadById(id)
      if (currentLead) {
        updateLead(id, { stage: resetStage }) // Move back to required stage
        // Force refresh of lead data
        setLead(getLeadById(id))
      }
    }
  }

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (!lead) {
    return (
      <div className="p-8 bg-muted/30">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Lead Not Found</h1>
          <Link href="/strms" scroll={false}>
            <Button>Back to STRMS Projects</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-muted/30">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/strms" scroll={false}>
            <Button variant="outline" size="sm">← Back to Projects</Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {lead.projectName || "—"}
            </h1>
            <p className="text-muted-foreground">
              {lead.company} • {lead.contact} • {lead.email}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={cn(
            "inline-flex items-center px-4 py-2 rounded-full text-base font-medium",
            stageColors[lead.stage]
          )}>
            {stageLabels[lead.stage]}
          </span>
        </div>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Project Summary</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('summary')}
                className="h-8 w-8 p-0"
              >
                {collapsedSections.summary ? "+" : "−"}
              </Button>
            </div>
          </CardHeader>
          {!collapsedSections.summary && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project Name</label>
                  <p className="text-foreground">{lead.projectName || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company</label>
                  <p className="text-foreground">{lead.company || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Primary Contact</label>
                  <p className="text-foreground">{lead.contact}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground">{lead.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Stage</label>
                  <p className="text-foreground">{stageLabels[lead.stage]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Activity</label>
                  <p className="text-foreground">{lead.lastActivity}</p>
                </div>
                {lead.nextAction && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Next Action</label>
                    <p className="text-foreground">{lead.nextAction}</p>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CardTitle>Onboarding Timeline</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {completedStages} of {totalStages} completed
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('timeline')}
                className="h-8 w-8 p-0"
              >
                {collapsedSections.timeline ? "+" : "−"}
              </Button>
            </div>
            {/* Progress Bar and Legend when not collapsed */}
            {!collapsedSections.timeline && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round((completedStages / totalStages) * 100)}%`
                    }}
                  />
                </div>
                {/* Automation Level Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      ⚡ Automated
                    </span>
                    <span className="text-xs text-muted-foreground">7 stages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      👤 Manual
                    </span>
                    <span className="text-xs text-muted-foreground">7 stages</span>
                  </div>
                </div>
              </>
            )}
          </CardHeader>
          {!collapsedSections.timeline && (
            <Timeline
              events={timeline}
              leadId={id}
              hideHeader={true}
              uploadedFiles={uploadedFiles}
              onFileUploaded={handleFileUploaded}
              onFileCleared={handleFileCleared}
              leadStage={lead?.stage}
            />
          )}
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>STRMS AI Assistant</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('assistant')}
                className="h-8 w-8 p-0"
              >
                {collapsedSections.assistant ? "+" : "−"}
              </Button>
            </div>
          </CardHeader>
          {!collapsedSections.assistant && (
            <ChatInterface title="STRMS AI Assistant" hideHeader={true} />
          )}
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Project Documents</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('documents')}
                className="h-8 w-8 p-0"
              >
                {collapsedSections.documents ? "+" : "−"}
              </Button>
            </div>
          </CardHeader>
          {!collapsedSections.documents && (
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fileTypes.map((fileType) => (
                  <FileUpload
                    key={fileType.id}
                    fileType={fileType}
                    onFileUploaded={handleFileUploaded}
                    onFileCleared={handleFileCleared}
                    existingFile={uploadedFiles[fileType.id]}
                  />
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}