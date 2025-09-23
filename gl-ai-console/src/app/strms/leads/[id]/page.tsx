"use client"

import Link from "next/link"
import { Timeline } from "@/components/leads/timeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { stageLabels, stageColors, Lead } from "@/lib/dummy-data"
import { getTimelineForLead } from "@/lib/timeline-data"
import { cn } from "@/lib/utils"
import { FileUpload } from "@/components/leads/file-upload"
import { fileTypes, getFilesByCategory, UploadedFile } from "@/lib/file-types"
import { getLeadById } from "@/lib/leads-store"
import { use, useState, useEffect } from "react"

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
  const timeline = getTimelineForLead(id)

  // State to track uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({})

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
  }

  if (!lead) {
    return (
      <div className="p-8 bg-muted/30">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Lead Not Found</h1>
          <Link href="/strms">
            <Button>Back to STRMS Leads</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-muted/30">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/strms">
            <Button variant="outline" size="sm">← Back to Leads</Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {lead.company}
            </h1>
            <p className="text-muted-foreground">
              Contact: {lead.contact} • {lead.email}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
            stageColors[lead.stage]
          )}>
            {stageLabels[lead.stage]}
          </span>
        </div>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Lead Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company</label>
                <p className="text-foreground">{lead.company}</p>
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
        </Card>

        <Timeline events={timeline} leadId={id} />

        <Card>
          <CardHeader>
            <CardTitle>📁 Lead Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {fileTypes.map((fileType) => (
                <FileUpload
                  key={fileType.id}
                  fileType={fileType}
                  onFileUploaded={handleFileUploaded}
                  existingFile={uploadedFiles[fileType.id]}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}