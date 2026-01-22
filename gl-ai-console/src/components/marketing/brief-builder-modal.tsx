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
import { FileText, Edit, Eye, User, Calendar, Tag } from "lucide-react"
import {
  ContentBrief,
  briefStatusLabels,
  briefStatusColors,
  contentTypeLabels,
} from "@/lib/marketing-content-types"

interface BriefBuilderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  briefs: ContentBrief[]
  onEditBrief: (briefId: string) => void
  onViewBrief: (briefId: string) => void
  onCreateNew: () => void
}

export function BriefBuilderModal({
  open,
  onOpenChange,
  briefs,
  onEditBrief,
  onViewBrief,
  onCreateNew,
}: BriefBuilderModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#95CBD7]/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#407B9D]" />
              </div>
              <div>
                <DialogTitle
                  className="text-xl text-[#463939]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Brief Builder
                </DialogTitle>
                <DialogDescription style={{ fontFamily: 'var(--font-body)' }}>
                  Manage and create content briefs for your team
                </DialogDescription>
              </div>
            </div>
            <Button
              onClick={onCreateNew}
              className="bg-[#407B9D] hover:bg-[#407B9D]/90"
            >
              New Brief
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-4">
            {briefs.map((brief) => (
              <div
                key={brief.id}
                className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3
                        className="font-semibold text-[#463939]"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {brief.title}
                      </h3>
                      <Badge className={briefStatusColors[brief.status]}>
                        {briefStatusLabels[brief.status]}
                      </Badge>
                      <Badge variant="outline">
                        {contentTypeLabels[brief.targetFormat]}
                      </Badge>
                    </div>

                    {brief.notes && (
                      <p
                        className="text-sm text-muted-foreground mb-3"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {brief.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      {brief.assignedTo && (
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Assigned to:</span>
                          <span className="font-medium text-[#463939]">
                            {brief.assignedTo}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Updated:</span>
                        <span className="font-medium text-[#463939]">
                          {brief.updatedAt}
                        </span>
                      </div>
                    </div>

                    {brief.targetKeywords.length > 0 && (
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                        {brief.targetKeywords.slice(0, 3).map((keyword, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs bg-slate-100"
                          >
                            {keyword}
                          </Badge>
                        ))}
                        {brief.targetKeywords.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{brief.targetKeywords.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Outline Preview */}
                    <div className="mt-3 p-3 bg-slate-50 rounded-md">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        OUTLINE ({brief.outline.length} sections)
                      </p>
                      <ol className="text-sm text-[#463939] space-y-1">
                        {brief.outline.slice(0, 3).map((section, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-4">
                              {idx + 1}.
                            </span>
                            {section}
                          </li>
                        ))}
                        {brief.outline.length > 3 && (
                          <li className="text-muted-foreground text-xs">
                            ... and {brief.outline.length - 3} more sections
                          </li>
                        )}
                      </ol>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => onEditBrief(brief.id)}
                      className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewBrief(brief.id)}
                      className="border-[#407B9D] text-[#407B9D]"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {briefs.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  No briefs yet. Create your first content brief.
                </p>
                <Button
                  onClick={onCreateNew}
                  className="mt-4 bg-[#407B9D] hover:bg-[#407B9D]/90"
                >
                  Create Brief
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {briefs.length} brief{briefs.length !== 1 ? 's' : ''} total
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
