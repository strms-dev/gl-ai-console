"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileCheck,
  Copy,
  Check,
  Upload,
  User,
  Calendar,
  Tag,
  Eye,
  Filter,
  BookOpen,
  Youtube,
  Linkedin as LinkedinIcon,
  FileQuestion,
  Globe,
} from "lucide-react"
import {
  FinalDraft,
  ContentType,
  contentTypeLabels,
  contentTypeColors,
} from "@/lib/marketing-content-types"

interface FinalDraftsSectionProps {
  drafts: FinalDraft[]
  onPublish: (draftId: string) => void
  onViewDraft: (draftId: string) => void
}

export function FinalDraftsSection({
  drafts,
  onPublish,
  onViewDraft,
}: FinalDraftsSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all')

  const handleCopy = async (draft: FinalDraft) => {
    // Build complete content including FAQs
    let fullContent = draft.content

    // Add FAQs section if present
    if (draft.faqs && draft.faqs.length > 0) {
      fullContent += '\n\n## Frequently Asked Questions\n\n'
      draft.faqs.forEach(faq => {
        fullContent += `**Q: ${faq.question}**\n${faq.answer}\n\n`
      })
    }

    await navigator.clipboard.writeText(fullContent)
    setCopiedId(draft.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'blog':
        return <BookOpen className="w-4 h-4" />
      case 'youtube':
        return <Youtube className="w-4 h-4" />
      case 'linkedin':
        return <LinkedinIcon className="w-4 h-4" />
      case 'case_study':
        return <FileQuestion className="w-4 h-4" />
      case 'website_page':
        return <Globe className="w-4 h-4" />
      default:
        return <FileCheck className="w-4 h-4" />
    }
  }

  const filteredDrafts = typeFilter === 'all'
    ? drafts
    : drafts.filter(d => d.targetFormat === typeFilter)

  const unpublishedDrafts = filteredDrafts.filter(d => !d.publishedAt)
  const publishedDrafts = filteredDrafts.filter(d => d.publishedAt)

  const contentTypes: { value: ContentType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Formats' },
    { value: 'blog', label: 'Blog Posts' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'case_study', label: 'Case Studies' },
    { value: 'website_page', label: 'Website Pages' },
  ]

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C8E4BB]/30 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-[#407B9D]" />
            </div>
            <div>
              <CardTitle
                className="text-lg text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Final Drafts
              </CardTitle>
              <CardDescription style={{ fontFamily: 'var(--font-body)' }}>
                Approved content ready for publishing
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-[#C8E4BB] text-[#463939]">
            {unpublishedDrafts.length} Ready
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {contentTypes.map((type) => {
            const count = type.value === 'all'
              ? drafts.length
              : drafts.filter(d => d.targetFormat === type.value).length

            return (
              <button
                key={type.value}
                onClick={() => setTypeFilter(type.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  typeFilter === type.value
                    ? 'bg-[#407B9D] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {type.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Ready to Publish Section */}
        {unpublishedDrafts.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#463939] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#C8E4BB] rounded-full"></span>
              Ready to Publish
            </h4>
            <div className="space-y-3">
              {unpublishedDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3
                          className="font-medium text-[#463939]"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {draft.title}
                        </h3>
                        <Badge className={contentTypeColors[draft.targetFormat]}>
                          {getTypeIcon(draft.targetFormat)}
                          <span className="ml-1">{contentTypeLabels[draft.targetFormat]}</span>
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          <span>{draft.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Approved {draft.approvedAt}</span>
                        </div>
                      </div>

                      {draft.keywords.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                          {draft.keywords.slice(0, 3).map((kw, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {kw}
                            </Badge>
                          ))}
                          {draft.keywords.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{draft.keywords.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleCopy(draft)}
                        variant="outline"
                        className="border-[#407B9D] text-[#407B9D]"
                      >
                        {copiedId === draft.id ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onPublish(draft.id)}
                        className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80"
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Published
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Already Published Section */}
        {publishedDrafts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Recently Published
            </h4>
            <div className="space-y-2">
              {publishedDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="p-3 border rounded-lg bg-slate-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[#463939]">{draft.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Published {draft.publishedAt} • {contentTypeLabels[draft.targetFormat]}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewDraft(draft.id)}
                    className="text-[#407B9D]"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredDrafts.length === 0 && (
          <div className="text-center py-8">
            <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
              {typeFilter === 'all'
                ? 'No final drafts yet. Complete the Brief Builder workflow to add drafts here.'
                : `No ${contentTypeLabels[typeFilter as ContentType]} drafts yet.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
