"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, ExternalLink, Send, Building2, User, Mail } from "lucide-react"
import {
  ClayLead,
  leadStatusLabels,
  leadStatusColors,
  leadSourceLabels,
  leadSourceColors,
  icpMatchLabels,
  icpMatchColors,
} from "@/lib/lead-discovery-types"

interface ClayPipelineModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leads: ClayLead[]
  onStartOutreach: (leadId: string) => void
  onMarkResponded: (leadId: string) => void
  onMarkQualified: (leadId: string) => void
}

export function ClayPipelineModal({
  open,
  onOpenChange,
  leads,
  onStartOutreach,
  onMarkResponded,
  onMarkQualified,
}: ClayPipelineModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#407B9D]/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-[#407B9D]" />
            </div>
            <div>
              <DialogTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Clay Pipeline
              </DialogTitle>
              <DialogDescription style={{ fontFamily: 'var(--font-body)' }}>
                Manage enriched leads and outreach sequences
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3
                        className="font-semibold text-[#463939]"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {lead.name}
                      </h3>
                      <Badge className={leadStatusColors[lead.status]}>
                        {leadStatusLabels[lead.status]}
                      </Badge>
                      <Badge className={leadSourceColors[lead.source]}>
                        {leadSourceLabels[lead.source]}
                      </Badge>
                      <Badge className={icpMatchColors[lead.icpMatch]}>
                        {icpMatchLabels[lead.icpMatch]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{lead.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>{lead.title}</span>
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Enrichment Data */}
                    {lead.enrichmentData && (
                      <div className="bg-slate-50 rounded-md p-3 mb-2">
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                          Enrichment Data
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {lead.enrichmentData.industry && (
                            <div>
                              <span className="text-muted-foreground">Industry:</span>{' '}
                              <span className="font-medium">{lead.enrichmentData.industry}</span>
                            </div>
                          )}
                          {lead.enrichmentData.companySize && (
                            <div>
                              <span className="text-muted-foreground">Size:</span>{' '}
                              <span className="font-medium">{lead.enrichmentData.companySize}</span>
                            </div>
                          )}
                          {lead.enrichmentData.revenue && (
                            <div>
                              <span className="text-muted-foreground">Revenue:</span>{' '}
                              <span className="font-medium">{lead.enrichmentData.revenue}</span>
                            </div>
                          )}
                          {lead.enrichmentData.techStack && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Tech:</span>{' '}
                              <span className="font-medium">{lead.enrichmentData.techStack.join(', ')}</span>
                            </div>
                          )}
                          {lead.enrichmentData.recentNews && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">News:</span>{' '}
                              <span className="text-[#407B9D]">{lead.enrichmentData.recentNews}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      From: {lead.sourceName} | Added {lead.addedAt}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {lead.status === 'enriched' && (
                      <Badge className="bg-blue-100 text-blue-800 py-1.5 px-3">
                        Ready to Outreach
                      </Badge>
                    )}
                    {lead.status === 'ready_for_outreach' && (
                      <Button
                        size="sm"
                        onClick={() => onStartOutreach(lead.id)}
                        className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Start Outreach
                      </Button>
                    )}
                    {lead.status === 'in_outreach' && (
                      <Button
                        size="sm"
                        onClick={() => onMarkResponded(lead.id)}
                        className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80"
                      >
                        Mark Responded
                      </Button>
                    )}
                    {lead.status === 'responded' && (
                      <Button
                        size="sm"
                        onClick={() => onMarkQualified(lead.id)}
                        className="bg-green-600 hover:bg-green-600/90 text-white"
                      >
                        Mark Qualified
                      </Button>
                    )}
                    {lead.linkedinUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#407B9D] text-[#407B9D]"
                        onClick={() => window.open(lead.linkedinUrl, '_blank')}
                      >
                        LinkedIn
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {leads.length === 0 && (
              <div className="text-center py-12">
                <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  No leads in pipeline yet. Push leads from Trigify or activate a hypothesis.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {leads.length} lead{leads.length !== 1 ? 's' : ''} in pipeline
          </p>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
