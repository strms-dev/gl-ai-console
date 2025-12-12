"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  FileSignature,
  ClipboardList,
  ExternalLink,
} from "lucide-react"
import { getPipelineDealById, PipelineDeal } from "@/lib/revops-pipeline-store"
import { SalesPipelineTimeline } from "@/components/revops/sales-pipeline-timeline"

// Helper function to format date/time
function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

// Document types for RevOps
const documentTypes = [
  {
    id: "proposal",
    title: "Proposal Document",
    description: "Sales proposal and pricing",
    icon: FileText,
  },
  {
    id: "contract",
    title: "Contract",
    description: "Service agreement and terms",
    icon: FileSignature,
  },
  {
    id: "notes",
    title: "Meeting Notes",
    description: "Notes from client meetings",
    icon: ClipboardList,
  },
]

export default function DealDetailsPage() {
  const params = useParams()
  const dealId = params.id as string

  const [deal, setDeal] = useState<PipelineDeal | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Collapsible section states
  const [detailsExpanded, setDetailsExpanded] = useState(true)
  const [timelineExpanded, setTimelineExpanded] = useState(true)
  const [documentsExpanded, setDocumentsExpanded] = useState(false)

  // Load deal data
  useEffect(() => {
    const loadDeal = async () => {
      setIsLoading(true)
      const data = await getPipelineDealById(dealId)
      setDeal(data)
      setIsLoading(false)
    }
    loadDeal()
  }, [dealId])

  // Handle deal updates from timeline
  const handleDealUpdate = (updatedDeal: PipelineDeal) => {
    setDeal(updatedDeal)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F9]">
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <p
            className="text-[#666666]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Loading deal...
          </p>
        </div>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-[#FAF9F9]">
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <Link href="/revops/sales-pipeline">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deals
            </Button>
          </Link>
          <p
            className="text-[#666666]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Deal not found.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F9]">
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/revops/sales-pipeline">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deals
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1
                className="text-3xl font-bold text-[#463939] mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {deal.dealName}
              </h1>
              <p
                className="text-[#666666]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {deal.companyName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {deal.hsStage && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#C8E4BB]/50 text-[#463939]">
                  {deal.hsStage}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://app.hubspot.com/contacts/deals/${deal.id}`, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View in HubSpot
              </Button>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Deal Details Section */}
          <Card className="rounded-xl border shadow-sm">
            <CardHeader
              className="cursor-pointer"
              onClick={() => setDetailsExpanded(!detailsExpanded)}
            >
              <div className="flex items-center justify-between">
                <CardTitle
                  className="text-xl text-[#463939]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Deal Details
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {detailsExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {detailsExpanded && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p
                      className="text-sm text-muted-foreground mb-1"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Deal Name
                    </p>
                    <p
                      className="font-medium text-[#463939]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {deal.dealName}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-sm text-muted-foreground mb-1"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Company Name
                    </p>
                    <p
                      className="font-medium text-[#463939]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {deal.companyName}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-sm text-muted-foreground mb-1"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      First Name
                    </p>
                    <p
                      className="font-medium text-[#463939]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {deal.firstName || "-"}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-sm text-muted-foreground mb-1"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Last Name
                    </p>
                    <p
                      className="font-medium text-[#463939]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {deal.lastName || "-"}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-sm text-muted-foreground mb-1"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Email
                    </p>
                    <p
                      className="font-medium text-[#463939]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {deal.email || "-"}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-sm text-muted-foreground mb-1"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Stage
                    </p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#95CBD7]/30 text-[#407B9D]">
                      {deal.stage}
                    </span>
                  </div>
                  <div>
                    <p
                      className="text-sm text-muted-foreground mb-1"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      HS Stage
                    </p>
                    {deal.hsStage ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#C8E4BB]/50 text-[#463939]">
                        {deal.hsStage}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                  <div>
                    <p
                      className="text-sm text-muted-foreground mb-1"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Created
                    </p>
                    <p
                      className="font-medium text-[#463939]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {formatDateTime(deal.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-sm text-muted-foreground mb-1"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Last Updated
                    </p>
                    <p
                      className="font-medium text-[#463939]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {formatDateTime(deal.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Timeline Section */}
          <Card className="rounded-xl border shadow-sm">
            <CardHeader
              className="cursor-pointer"
              onClick={() => setTimelineExpanded(!timelineExpanded)}
            >
              <div className="flex items-center justify-between">
                <CardTitle
                  className="text-xl text-[#463939]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Sales Pipeline Timeline
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {timelineExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {timelineExpanded && (
              <CardContent>
                <SalesPipelineTimeline
                  deal={deal}
                  onDealUpdate={handleDealUpdate}
                />
              </CardContent>
            )}
          </Card>

          {/* Documents Section */}
          <Card className="rounded-xl border shadow-sm">
            <CardHeader
              className="cursor-pointer"
              onClick={() => setDocumentsExpanded(!documentsExpanded)}
            >
              <div className="flex items-center justify-between">
                <CardTitle
                  className="text-xl text-[#463939]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Deal Documents
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {documentsExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {documentsExpanded && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documentTypes.map((doc) => {
                    const IconComponent = doc.icon
                    return (
                      <div
                        key={doc.id}
                        className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-[#407B9D]/50 transition-colors"
                      >
                        <div className="flex justify-center mb-3">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-gray-400" />
                          </div>
                        </div>
                        <h4
                          className="font-medium text-[#463939] mb-1"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {doc.title}
                        </h4>
                        <p
                          className="text-sm text-muted-foreground mb-3"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {doc.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          No file uploaded
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
