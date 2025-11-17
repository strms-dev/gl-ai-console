"use client"

import Link from "next/link"
import { Timeline } from "@/components/leads/timeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { stageLabels, stageColors, Lead } from "@/lib/dummy-data"
import { getTimelineForLead } from "@/lib/timeline-data"
import { cn } from "@/lib/utils"
import { FileUpload } from "@/components/leads/file-upload"
import { fileTypes, UploadedFile } from "@/lib/file-types"
import { getLeadById, updateLead } from "@/lib/leads-store"
import { uploadFile, replaceFile, deleteFilesByType, getProjectFiles, getFileUploadDate } from "@/lib/supabase/files"
import { getStageCompletionDate } from "@/lib/supabase/stage-data"
import { use, useState, useEffect, useMemo } from "react"
import { Zap, User } from "lucide-react"

interface LeadDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function LeadDetailPage({ params }: LeadDetailPageProps) {
  // Use React's use hook for client components
  const { id } = use(params)

  // Reactive lead state that updates when lead data changes
  const [lead, setLead] = useState<Lead | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  // Generate timeline based on current lead stage
  const timeline = useMemo(() => {
    return getTimelineForLead(id, lead?.stage)
  }, [id, lead?.stage])

  // State to track uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({})

  // State to track completion dates for each stage
  const [completionDates, setCompletionDates] = useState<Record<string, string>>({})

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

    // Special case: if we're at kickoff stage and the kickoff file has been uploaded, count it as completed
    if (lead.stage === 'kickoff' && uploadedFiles['kickoff-meeting-brief']) {
      completedCount++
    }

    return { completed: completedCount, total: timeline.length }
  }

  const { completed: completedStages, total: totalStages } = calculateTimelineProgress()

  // State to track collapsible sections
  const [collapsedSections, setCollapsedSections] = useState({
    summary: false,
    timeline: false,
    documents: false
  })

  // Monitor for lead data changes
  useEffect(() => {
    let isInitialLoad = true

    const checkForLeadUpdates = async () => {
      // Only show loading on initial load
      if (isInitialLoad) {
        setIsLoading(true)
      }

      const updatedLead = await getLeadById(id)
      setLead(updatedLead)

      if (isInitialLoad) {
        setIsLoading(false)
        isInitialLoad = false
      }
    }

    // Check immediately
    checkForLeadUpdates()

    // Set up an interval to check for updates (every 5 seconds)
    // This will update in the background without showing loading state
    const interval = setInterval(checkForLeadUpdates, 5000)

    return () => clearInterval(interval)
  }, [id])

  // Load existing files from Supabase on mount
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const files = await getProjectFiles(id)
        const filesMap: Record<string, UploadedFile> = {}

        files.forEach(file => {
          filesMap[file.file_type_id] = {
            id: file.id,
            fileTypeId: file.file_type_id,
            fileName: file.file_name,
            uploadDate: file.uploaded_at,
            fileSize: Number(file.file_size),
            uploadedBy: file.uploaded_by,
            isDemoFile: false,
            storagePath: file.storage_path // Include storage path for downloading
          }
        })

        setUploadedFiles(filesMap)
      } catch (error) {
        console.error("Failed to load files from Supabase:", error)
      }
    }

    loadFiles()
  }, [id])

  // Function to load completion dates for stages
  const loadCompletionDates = async () => {
    try {
      const dates: Record<string, string> = {}

      // Define which stages use file upload dates vs stage data dates
      const fileBasedStages = ['demo', 'readiness', 'scoping-prep', 'scoping', 'dev-overview', 'workflow-docs', 'internal-client-docs', 'kickoff']
      const fileTypeMapping: Record<string, string> = {
        'demo': 'demo-call-transcript',
        'readiness': 'readiness-pdf',
        'scoping-prep': 'scoping-prep-doc',
        'scoping': 'scoping-call-transcript',
        'dev-overview': 'developer-audio-overview',
        'workflow-docs': 'workflow-description',
        'internal-client-docs': 'internal-client-documentation',
        'kickoff': 'kickoff-meeting-brief'
      }

      // Load dates for all stages in timeline
      for (const event of timeline) {
        if (fileBasedStages.includes(event.type)) {
          // Get file upload date
          const fileTypeId = fileTypeMapping[event.type]
          if (fileTypeId) {
            const date = await getFileUploadDate(id, fileTypeId)
            if (date) {
              dates[event.id] = date
            }
          }
        } else {
          // Get stage data completion date
          const date = await getStageCompletionDate(id, event.id)
          if (date) {
            dates[event.id] = date
          }
        }
      }

      setCompletionDates(dates)
    } catch (error) {
      console.error("Failed to load completion dates:", error)
    }
  }

  // Load completion dates on mount and when timeline changes
  useEffect(() => {
    if (timeline.length > 0) {
      loadCompletionDates()
    }
  }, [id, timeline])

  const handleFileUploaded = async (file: UploadedFile) => {
    console.log('=== handleFileUploaded called ===', file.fileTypeId)

    // Optimistic update - update UI immediately
    setUploadedFiles(prev => ({
      ...prev,
      [file.fileTypeId]: file
    }))

    // Replace file in Supabase Storage in the background (deletes old file if exists, uploads new)
    if (file.fileData) {
      try {
        await replaceFile(id, file.fileTypeId, file.fileData as File, 'User')

        // Reload files from Supabase to get the correct storage path and metadata
        const files = await getProjectFiles(id)
        const filesMap: Record<string, UploadedFile> = {}
        files.forEach(f => {
          filesMap[f.file_type_id] = {
            id: f.id,
            fileTypeId: f.file_type_id,
            fileName: f.file_name,
            uploadDate: f.uploaded_at,
            fileSize: Number(f.file_size),
            uploadedBy: f.uploaded_by,
            isDemoFile: false,
            storagePath: f.storage_path
          }
        })
        setUploadedFiles(filesMap)

        // Reload completion dates to show the new completion date immediately
        await loadCompletionDates()
      } catch (error) {
        console.error("Failed to upload file to Supabase:", error)
        alert("Failed to upload file. Please try again.")
        // Revert the optimistic update
        setUploadedFiles(prev => {
          const updated = { ...prev }
          delete updated[file.fileTypeId]
          return updated
        })
        return
      }
    }


    // Define file to stage transition mappings
    const fileStageMap: Record<string, Lead['stage']> = {
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
      setTimeout(async () => {
        const currentLead = await getLeadById(id)
        if (currentLead) {
          await updateLead(id, { stage: nextStage }) // Move to next stage
          // Force refresh of lead data
          const refreshedLead = await getLeadById(id)
          setLead(refreshedLead)
        }
      }, 100)
    }
  }

  const handleFileCleared = async (fileTypeId: string) => {
    // Store the old file in case we need to revert
    const oldFile = uploadedFiles[fileTypeId]

    // Optimistic update - update UI immediately
    setUploadedFiles(prev => {
      const updated = { ...prev }
      delete updated[fileTypeId]
      return updated
    })

    // Delete from Supabase Storage in the background
    try {
      await deleteFilesByType(id, fileTypeId)
    } catch (error) {
      console.error("Failed to delete file from Supabase:", error)
      alert("Failed to delete file. Please try again.")
      // Revert the optimistic update
      if (oldFile) {
        setUploadedFiles(prev => ({
          ...prev,
          [fileTypeId]: oldFile
        }))
      }
      return
    }

    // Define file to stage reset mappings (back to the stage that requires the file)
    const fileResetStageMap: Record<string, Lead['stage']> = {
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
      const asyncReset = async () => {
        const currentLead = await getLeadById(id)
        if (currentLead) {
          await updateLead(id, { stage: resetStage }) // Move back to required stage
          // Force refresh of lead data
          const refreshedLead = await getLeadById(id)
          setLead(refreshedLead)
        }
      }
      asyncReset()
    }
  }

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (isLoading) {
    return (
      <div className="p-8 bg-muted/30">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-32 h-9 bg-gray-200 rounded-md animate-pulse"></div>
            <div>
              <div className="w-64 h-9 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="w-32 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        <div className="space-y-8">
          {/* Project Summary Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-40 h-7 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i}>
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Onboarding Timeline Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-48 h-7 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                        <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Two-column layout for Assistant and Documents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AI Assistant Skeleton */}
            <Card className="h-[600px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-32 h-7 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="w-3/4 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-2/3 h-16 bg-gray-200 rounded-lg animate-pulse ml-auto"></div>
                  <div className="w-3/4 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </CardContent>
            </Card>

            {/* Project Documents Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-40 h-7 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="p-8 bg-muted/30">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Lead Not Found</h1>
          <Link href="/strms">
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
          <Link href="/strms/sales-pipeline">
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
              {lead.notes && (
                <div className="mt-6 pt-6 border-t border-border">
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-foreground mt-2 whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
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
                    className="bg-[#407B9D] h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round((completedStages / totalStages) * 100)}%`
                    }}
                  />
                </div>
                {/* Automation Level Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#C8E4BB]/20 text-[#5A8A4A] border border-[#C8E4BB]/40">
                      <Zap className="w-3 h-3" /> Automated
                    </span>
                    <span className="text-xs text-muted-foreground">7 stages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/30">
                      <User className="w-3 h-3" /> Manual
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
              completionDates={completionDates}
            />
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