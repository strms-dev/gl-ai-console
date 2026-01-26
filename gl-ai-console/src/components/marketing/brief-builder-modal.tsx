"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  FileText,
  Edit,
  Eye,
  User,
  Calendar,
  Tag,
  ChevronRight,
  Check,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  GripVertical,
  Copy,
  Link,
  ExternalLink,
  HelpCircle,
  Sparkles,
  RefreshCw,
  CheckCircle,
  BookOpen,
  Youtube,
  Linkedin as LinkedinIcon,
  FileQuestion,
  Globe,
  Lightbulb,
  PenTool,
  Loader2,
  Save,
  X,
} from "lucide-react"
import {
  ContentBrief,
  BriefStep,
  ContentType,
  OutlineSection,
  TopicIdea,
  briefStatusLabels,
  briefStatusColors,
  briefStepLabels,
  briefStepColors,
  contentTypeLabels,
  contentTypeColors,
  availableAuthors,
} from "@/lib/marketing-content-types"

interface BriefBuilderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  briefs: ContentBrief[]
  approvedTopicIdeas?: TopicIdea[]
  onSaveBrief: (brief: ContentBrief) => void
  onEditBrief: (briefId: string) => void
  onViewBrief: (briefId: string) => void
  onCreateNew: () => void
  onCreateFromIdea?: (ideaId: string) => void
  onApproveFinalDraft?: (briefId: string) => void
  initialBriefId?: string | null
}

// Step indicator component
function StepIndicator({
  steps,
  currentStep,
  onStepClick
}: {
  steps: { key: BriefStep; label: string; completed: boolean }[]
  currentStep: BriefStep
  onStepClick?: (step: BriefStep) => void
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {steps.map((step, index) => {
        const isCurrent = step.key === currentStep
        const isCompleted = step.completed
        const isClickable = isCompleted || isCurrent

        return (
          <div key={step.key} className="flex items-center">
            <button
              onClick={() => isClickable && onStepClick?.(step.key)}
              disabled={!isClickable}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isCurrent
                  ? 'bg-[#407B9D] text-white'
                  : isCompleted
                  ? 'bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80'
                  : 'bg-slate-100 text-slate-400'
              }`}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {isCompleted && !isCurrent ? (
                <Check className="w-3 h-3" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  {index + 1}
                </span>
              )}
              <span className="whitespace-nowrap">{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-slate-300 mx-1 flex-shrink-0" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Content type selector component
function ContentTypeSelector({
  selected,
  onSelect
}: {
  selected?: ContentType
  onSelect: (type: ContentType) => void
}) {
  const contentTypes: { value: ContentType; icon: React.ReactNode; description: string }[] = [
    { value: 'blog', icon: <BookOpen className="w-5 h-5" />, description: 'Long-form article for website' },
    { value: 'youtube', icon: <Youtube className="w-5 h-5" />, description: 'Video script and description' },
    { value: 'linkedin', icon: <LinkedinIcon className="w-5 h-5" />, description: 'Post or article for LinkedIn' },
    { value: 'case_study', icon: <FileQuestion className="w-5 h-5" />, description: 'Client success story' },
    { value: 'website_page', icon: <Globe className="w-5 h-5" />, description: 'Static page content' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {contentTypes.map((type) => (
        <button
          key={type.value}
          onClick={() => onSelect(type.value)}
          className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
            selected === type.value
              ? 'border-[#407B9D] bg-[#407B9D]/5'
              : 'border-slate-200 hover:border-[#407B9D]/50'
          }`}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
            selected === type.value ? 'bg-[#407B9D] text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {type.icon}
          </div>
          <h4
            className="font-medium text-[#463939] mb-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {contentTypeLabels[type.value]}
          </h4>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
            {type.description}
          </p>
        </button>
      ))}
    </div>
  )
}

// Outline editor component
function OutlineEditor({
  sections,
  onSectionsChange,
  onApprove,
  onRegenerate,
  isGenerating
}: {
  sections: OutlineSection[]
  onSectionsChange: (sections: OutlineSection[]) => void
  onApprove: () => void
  onRegenerate: () => void
  isGenerating?: boolean
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleEdit = (section: OutlineSection) => {
    setEditingId(section.id)
    setEditValue(section.title)
  }

  const handleSave = (id: string) => {
    onSectionsChange(
      sections.map(s => s.id === id ? { ...s, title: editValue } : s)
    )
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    onSectionsChange(sections.filter(s => s.id !== id))
  }

  const handleAdd = () => {
    const newSection: OutlineSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: ''
    }
    onSectionsChange([...sections, newSection])
    handleEdit(newSection)
  }

  if (isGenerating) {
    return (
      <div className="text-center py-12">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-[#407B9D]/20 animate-ping" />
          <div className="relative w-16 h-16 rounded-full bg-[#407B9D]/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#407B9D] animate-spin" />
          </div>
        </div>
        <p className="text-lg font-medium text-[#463939] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Generating Outline...
        </p>
        <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
          AI is creating a structured outline for your content.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-[#463939]" style={{ fontFamily: 'var(--font-heading)' }}>
          Outline Sections
        </h4>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            className="text-[#407B9D] border-[#407B9D]"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Regenerate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Section
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg group"
          >
            <GripVertical className="w-4 h-4 text-slate-300 mt-1 cursor-grab" />
            <span className="w-6 h-6 bg-[#407B9D] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
              {index + 1}
            </span>
            <div className="flex-1">
              {editingId === section.id ? (
                <div className="flex gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleSave(section.id)}
                    autoFocus
                  />
                  <Button size="sm" onClick={() => handleSave(section.id)}>Save</Button>
                </div>
              ) : (
                <>
                  <p className="font-medium text-[#463939]" style={{ fontFamily: 'var(--font-body)' }}>
                    {section.title}
                  </p>
                  {section.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {section.description}
                    </p>
                  )}
                </>
              )}
            </div>
            {editingId !== section.id && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(section)}
                  className="p-1 hover:bg-slate-200 rounded"
                >
                  <Edit className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={() => handleDelete(section.id)}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onApprove} className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80">
          <Check className="w-4 h-4 mr-1" />
          Approve Outline
        </Button>
      </div>
    </div>
  )
}

// Draft viewer component
function DraftViewer({
  brief,
  onApprove,
  onEdit,
  isGenerating
}: {
  brief: ContentBrief
  onApprove: () => void
  onEdit: () => void
  isGenerating?: boolean
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (brief.firstDraft) {
      await navigator.clipboard.writeText(brief.firstDraft)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isGenerating) {
    return (
      <div className="text-center py-12">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-[#407B9D]/20 animate-ping" />
          <div className="relative w-16 h-16 rounded-full bg-[#407B9D]/10 flex items-center justify-center">
            <PenTool className="w-8 h-8 text-[#407B9D] animate-pulse" />
          </div>
        </div>
        <p className="text-lg font-medium text-[#463939] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Writing First Draft...
        </p>
        <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
          AI is generating your content based on the approved outline.
        </p>
        <div className="mt-6 max-w-xs mx-auto">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#407B9D] rounded-full animate-pulse" style={{ width: '75%' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Draft Content */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-4 py-2 border-b flex items-center justify-between">
          <span className="text-sm font-medium text-[#463939]">First Draft</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-[#407B9D]"
          >
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        <div className="p-4 max-h-64 overflow-y-auto">
          <div className="prose prose-sm max-w-none text-[#463939]" style={{ fontFamily: 'var(--font-body)' }}>
            {brief.firstDraft?.split('\n').map((line, i) => (
              <p key={i} className={line.startsWith('#') ? 'font-bold text-lg mb-2' : 'mb-2'}>
                {line.replace(/^#+\s*/, '')}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* FAQs */}
      {brief.faqs && brief.faqs.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-amber-50 px-4 py-2 border-b flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-[#463939]">FAQs ({brief.faqs.length})</span>
          </div>
          <div className="p-4 space-y-3">
            {brief.faqs.map((faq) => (
              <div key={faq.id} className="text-sm">
                <p className="font-medium text-[#463939]">{faq.question}</p>
                <p className="text-muted-foreground mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      <div className="grid grid-cols-2 gap-4">
        {brief.internalLinks && brief.internalLinks.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-blue-50 px-4 py-2 border-b flex items-center gap-2">
              <Link className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-[#463939]">Internal Links</span>
            </div>
            <div className="p-3 space-y-2">
              {brief.internalLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-2 text-sm">
                  <span className="text-[#407B9D] hover:underline cursor-pointer">{link.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {brief.externalLinks && brief.externalLinks.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-purple-50 px-4 py-2 border-b flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-[#463939]">External Links</span>
            </div>
            <div className="p-3 space-y-2">
              {brief.externalLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-2 text-sm">
                  <span className="text-purple-600 hover:underline cursor-pointer">{link.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-1" />
          Edit Draft
        </Button>
        <Button onClick={onApprove} className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80">
          <Check className="w-4 h-4 mr-1" />
          Approve Draft
        </Button>
      </div>
    </div>
  )
}

// Author selector component
function AuthorSelector({
  selected,
  recommended,
  onSelect
}: {
  selected?: string
  recommended?: string
  onSelect: (authorId: string) => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
        Select the author who will be credited for this content. The AI recommends an author based on topic expertise.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {availableAuthors.map((author) => (
          <button
            key={author.id}
            onClick={() => onSelect(author.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
              selected === author.id
                ? 'border-[#407B9D] bg-[#407B9D]/5'
                : 'border-slate-200 hover:border-[#407B9D]/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                selected === author.id ? 'bg-[#407B9D] text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {author.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-[#463939]" style={{ fontFamily: 'var(--font-heading)' }}>
                    {author.name}
                  </h4>
                  {recommended === author.id && (
                    <Badge className="bg-[#C8E4BB] text-[#463939] text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{author.role}</p>
                {author.expertise.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {author.expertise.slice(0, 3).map((exp) => (
                      <Badge key={exp} variant="secondary" className="text-xs">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Final review component
function FinalReview({
  brief,
  onApproveForPublish,
  onCopy
}: {
  brief: ContentBrief
  onApproveForPublish: () => void
  onCopy: () => void
}) {
  const [copied, setCopied] = useState(false)
  const author = availableAuthors.find(a => a.id === brief.assignedTo)

  const handleCopy = async () => {
    if (brief.finalDraft || brief.firstDraft) {
      await navigator.clipboard.writeText(brief.finalDraft || brief.firstDraft || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-[#407B9D]/5 p-4 rounded-lg">
        <h4 className="font-medium text-[#463939] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          Content Summary
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Format:</span>
            <Badge className={`ml-2 ${contentTypeColors[brief.targetFormat]}`}>
              {contentTypeLabels[brief.targetFormat]}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Author:</span>
            <span className="ml-2 font-medium text-[#463939]">{author?.name || 'Not assigned'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Keywords:</span>
            <div className="flex gap-1 mt-1 flex-wrap">
              {brief.targetKeywords.map((kw, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Final Draft Preview */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-green-50 px-4 py-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-[#463939]">Final Draft Ready</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-[#407B9D]"
          >
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </div>
        <div className="p-4 max-h-48 overflow-y-auto">
          <div className="prose prose-sm max-w-none text-[#463939]" style={{ fontFamily: 'var(--font-body)' }}>
            {(brief.finalDraft || brief.firstDraft)?.split('\n').slice(0, 10).map((line, i) => (
              <p key={i} className={line.startsWith('#') ? 'font-bold text-lg mb-2' : 'mb-2'}>
                {line.replace(/^#+\s*/, '')}
              </p>
            ))}
            <p className="text-muted-foreground italic">... content continues ...</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onApproveForPublish} className="bg-[#407B9D] hover:bg-[#407B9D]/90">
          <Check className="w-4 h-4 mr-1" />
          Approve for Final Drafts
        </Button>
      </div>
    </div>
  )
}

// Source selection component - choose between manual or approved ideas
function SourceSelector({
  approvedIdeas,
  onSelectManual,
  onSelectIdea
}: {
  approvedIdeas: TopicIdea[]
  onSelectManual: () => void
  onSelectIdea: (ideaId: string) => void
}) {
  return (
    <div className="space-y-6">
      {/* Manual Entry Option */}
      <div>
        <h4 className="text-sm font-medium text-[#463939] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          Start Fresh
        </h4>
        <button
          onClick={onSelectManual}
          className="w-full p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-[#407B9D] bg-slate-50 hover:bg-[#407B9D]/5 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-slate-200 group-hover:bg-[#407B9D]/20 flex items-center justify-center transition-colors">
              <PenTool className="w-6 h-6 text-slate-500 group-hover:text-[#407B9D]" />
            </div>
            <div>
              <h5 className="font-medium text-[#463939] group-hover:text-[#407B9D]" style={{ fontFamily: 'var(--font-heading)' }}>
                Create Custom Brief
              </h5>
              <p className="text-sm text-muted-foreground">
                Start from scratch with your own topic and content idea
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#407B9D] ml-auto" />
          </div>
        </button>
      </div>

      {/* Approved Ideas */}
      {approvedIdeas.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-[#463939] mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <Lightbulb className="w-4 h-4 text-[#407B9D]" />
            From Approved Topic Ideas
            <Badge className="bg-[#C8E4BB] text-[#463939] text-xs">{approvedIdeas.length}</Badge>
          </h4>
          <div className="space-y-2">
            {approvedIdeas.map((idea) => (
              <button
                key={idea.id}
                onClick={() => onSelectIdea(idea.id)}
                className="w-full p-4 rounded-lg border border-slate-200 hover:border-[#407B9D] bg-white hover:bg-[#407B9D]/5 transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-[#407B9D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-[#463939] group-hover:text-[#407B9D] truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                      {idea.topic}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={contentTypeColors[idea.suggestedFormat]} style={{ fontSize: '10px' }}>
                        {contentTypeLabels[idea.suggestedFormat]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Gap Score: {idea.gapScore}%
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#407B9D] flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {approvedIdeas.length === 0 && (
        <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <Lightbulb className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No approved topic ideas available. Run an analysis in Topic Radar to generate ideas.
          </p>
        </div>
      )}
    </div>
  )
}

export function BriefBuilderModal({
  open,
  onOpenChange,
  briefs,
  approvedTopicIdeas = [],
  onSaveBrief,
  onEditBrief,
  onViewBrief,
  onCreateNew,
  onCreateFromIdea,
  onApproveFinalDraft,
  initialBriefId,
}: BriefBuilderModalProps) {
  const [viewMode, setViewMode] = useState<'list' | 'source_selection' | 'workflow'>('list')
  const [selectedBrief, setSelectedBrief] = useState<ContentBrief | null>(null)
  const [workflowStep, setWorkflowStep] = useState<BriefStep>('format_selection')
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Workflow state for new brief creation
  const [newBriefData, setNewBriefData] = useState<Partial<ContentBrief>>({
    outline: [],
    targetKeywords: [],
  })

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      // If we have an initial brief ID, load it
      if (initialBriefId) {
        const brief = briefs.find(b => b.id === initialBriefId)
        if (brief) {
          setSelectedBrief(brief)
          setWorkflowStep(brief.currentStep)
          setViewMode('workflow')
        }
      } else {
        setViewMode('list')
        setSelectedBrief(null)
      }
    }
  }, [open, initialBriefId, briefs])

  const handleStartNewBrief = () => {
    setViewMode('source_selection')
  }

  const handleSelectManualBrief = () => {
    const now = new Date().toISOString().split('T')[0]
    setSelectedBrief(null)
    setNewBriefData({
      id: `brief-${Date.now()}`,
      title: '',
      outline: [],
      targetKeywords: [],
      status: 'draft',
      currentStep: 'format_selection',
      createdAt: now,
      updatedAt: now,
    })
    setWorkflowStep('format_selection')
    setViewMode('workflow')
    setHasUnsavedChanges(true)
  }

  const handleSelectIdeaBrief = (ideaId: string) => {
    const idea = approvedTopicIdeas.find(i => i.id === ideaId)
    if (!idea) return

    const now = new Date().toISOString().split('T')[0]

    // Create brief from idea with format already selected
    setSelectedBrief(null)
    setNewBriefData({
      id: `brief-${Date.now()}`,
      title: idea.topic,
      outline: [],
      targetKeywords: idea.topic.toLowerCase().split(' ').filter(w => w.length > 3).slice(0, 5),
      status: 'draft',
      currentStep: 'outline',
      targetFormat: idea.suggestedFormat,
      sourceTopicId: idea.id,
      createdAt: now,
      updatedAt: now,
    })
    setWorkflowStep('outline')
    setViewMode('workflow')
    setHasUnsavedChanges(true)

    // Trigger outline generation
    setIsGenerating(true)
    setTimeout(() => {
      // Generate outline
      const baseId = Date.now()
      const outline: OutlineSection[] = [
        { id: `section-${baseId}-1`, title: `Introduction - Why ${idea.topic.split(':')[0]} matters`, description: 'Hook readers with a compelling problem statement.' },
        { id: `section-${baseId}-2`, title: 'The Core Challenge', description: 'Define the problem your audience faces.' },
        { id: `section-${baseId}-3`, title: 'Key Insights and Solutions', description: 'Present your main points with supporting evidence.' },
        { id: `section-${baseId}-4`, title: 'Practical Steps', description: 'Actionable advice readers can implement.' },
        { id: `section-${baseId}-5`, title: 'Common Mistakes to Avoid', description: 'What not to do - prevents errors.' },
        { id: `section-${baseId}-6`, title: 'Conclusion and Next Steps', description: 'Summarize key points and include CTA.' },
      ]

      setNewBriefData(prev => ({ ...prev, outline }))
      setIsGenerating(false)
    }, 2000)

    // Notify parent to remove from topic ideas
    onCreateFromIdea?.(ideaId)
  }

  const handleStartWorkflow = (brief: ContentBrief) => {
    setSelectedBrief(brief)
    setWorkflowStep(brief.currentStep)
    setViewMode('workflow')
  }

  const handleBackToList = () => {
    // Save current brief before going back
    if (hasUnsavedChanges) {
      const briefToSave = selectedBrief || (newBriefData as ContentBrief)
      if (briefToSave.id && briefToSave.title) {
        onSaveBrief({
          ...briefToSave,
          currentStep: workflowStep,
        } as ContentBrief)
      }
    }

    setViewMode('list')
    setSelectedBrief(null)
    setNewBriefData({})
    setHasUnsavedChanges(false)
  }

  const handleSaveAndExit = () => {
    const briefToSave = selectedBrief || (newBriefData as ContentBrief)
    if (briefToSave.id && briefToSave.title) {
      onSaveBrief({
        ...briefToSave,
        currentStep: workflowStep,
      } as ContentBrief)
    }
    setHasUnsavedChanges(false)
    handleBackToList()
  }

  const getWorkflowSteps = (): { key: BriefStep; label: string; completed: boolean }[] => {
    const brief = selectedBrief || (newBriefData as ContentBrief)
    const stepOrder: BriefStep[] = ['format_selection', 'outline', 'first_draft', 'author_selection', 'final_review', 'published']
    const currentIndex = stepOrder.indexOf(workflowStep)

    return stepOrder.slice(0, -1).map((step, index) => ({
      key: step,
      label: briefStepLabels[step],
      completed: index < currentIndex
    }))
  }

  const handleNextStep = (nextStep: BriefStep) => {
    const brief = selectedBrief || (newBriefData as ContentBrief)

    // Update the brief with current step
    const updatedBrief = {
      ...brief,
      currentStep: nextStep,
    } as ContentBrief

    if (selectedBrief) {
      setSelectedBrief(updatedBrief)
    } else {
      setNewBriefData(updatedBrief)
    }

    setWorkflowStep(nextStep)
    setHasUnsavedChanges(true)

    // Handle step transitions that need generation
    if (nextStep === 'outline' && (brief.outline?.length === 0 || !brief.outline)) {
      setIsGenerating(true)
      setTimeout(() => {
        const baseId = Date.now()
        const outline: OutlineSection[] = [
          { id: `section-${baseId}-1`, title: `Introduction - Why ${brief.title?.split(':')[0] || 'this topic'} matters`, description: 'Hook readers.' },
          { id: `section-${baseId}-2`, title: 'The Core Challenge', description: 'Define the problem.' },
          { id: `section-${baseId}-3`, title: 'Key Solutions', description: 'Main points.' },
          { id: `section-${baseId}-4`, title: 'Practical Steps', description: 'Actionable advice.' },
          { id: `section-${baseId}-5`, title: 'Mistakes to Avoid', description: 'What not to do.' },
          { id: `section-${baseId}-6`, title: 'Conclusion', description: 'Summary and CTA.' },
        ]

        if (selectedBrief) {
          setSelectedBrief({ ...selectedBrief, outline, currentStep: nextStep })
        } else {
          setNewBriefData(prev => ({ ...prev, outline }))
        }
        setIsGenerating(false)
      }, 2000)
    }

    if (nextStep === 'first_draft' && !brief.firstDraft) {
      setIsGenerating(true)
      setTimeout(() => {
        const title = brief.title || 'Untitled Content'
        const outline = brief.outline || []

        let firstDraft = `# ${title}\n\n`
        outline.forEach((section, index) => {
          firstDraft += `## ${section.title}\n\n`
          if (index === 0) {
            firstDraft += `Every growing business reaches a point where they need to understand ${title.toLowerCase().split(' ').slice(0, 3).join(' ')}. In this guide, we explore everything you need to know.\n\n`
          } else if (index === outline.length - 1) {
            firstDraft += `Ready to take the next step? Schedule a consultation with our team to discuss your specific needs.\n\n`
          } else {
            firstDraft += `${section.description || 'This section covers important aspects of the topic.'}\n\nThis is where we would expand on the key points and provide valuable insights to our readers. The content would include:\n\n- Specific examples and case studies\n- Data-backed recommendations\n- Actionable takeaways\n\n`
          }
        })

        const faqs = [
          { id: `faq-${Date.now()}-1`, question: `What is the most important thing to know about ${title.toLowerCase().split(' ').slice(0, 4).join(' ')}?`, answer: 'Understanding your specific business needs is critical.' },
          { id: `faq-${Date.now()}-2`, question: 'How long does this typically take to implement?', answer: 'Most businesses see results within 30-90 days.' },
          { id: `faq-${Date.now()}-3`, question: 'What are the typical costs involved?', answer: 'Costs depend on your requirements. Schedule a consultation for pricing.' },
        ]

        const internalLinks = [
          { id: `link-int-${Date.now()}-1`, title: '5 Signs You Need a Fractional CFO', url: '/blog/signs-need-fractional-cfo', type: 'internal' as const, context: 'Reference in introduction' },
          { id: `link-int-${Date.now()}-2`, title: 'Client Success Stories', url: '/case-studies', type: 'internal' as const, context: 'Link when discussing examples' },
        ]

        const externalLinks = [
          { id: `link-ext-${Date.now()}-1`, title: 'Industry Research Report', url: 'https://example.com/research', type: 'external' as const, context: 'Source for statistics' },
        ]

        if (selectedBrief) {
          setSelectedBrief({ ...selectedBrief, firstDraft, faqs, internalLinks, externalLinks, outlineApproved: true, recommendedAuthor: 'dan', currentStep: nextStep })
        } else {
          setNewBriefData(prev => ({ ...prev, firstDraft, faqs, internalLinks, externalLinks, outlineApproved: true, recommendedAuthor: 'dan' }))
        }
        setIsGenerating(false)
      }, 2500)
    }
  }

  const currentBrief = selectedBrief || (newBriefData as ContentBrief)

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen && hasUnsavedChanges) {
        // Auto-save on close
        const briefToSave = selectedBrief || (newBriefData as ContentBrief)
        if (briefToSave.id && briefToSave.title) {
          onSaveBrief({
            ...briefToSave,
            currentStep: workflowStep,
          } as ContentBrief)
        }
      }
      onOpenChange(newOpen)
    }}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(viewMode === 'workflow' || viewMode === 'source_selection') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToList}
                  className="mr-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div className="w-10 h-10 rounded-lg bg-[#95CBD7]/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#407B9D]" />
              </div>
              <div>
                <DialogTitle
                  className="text-xl text-[#463939]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {viewMode === 'list'
                    ? 'Brief Builder'
                    : viewMode === 'source_selection'
                    ? 'Create New Brief'
                    : (currentBrief?.title || 'New Content Brief')}
                </DialogTitle>
                <DialogDescription style={{ fontFamily: 'var(--font-body)' }}>
                  {viewMode === 'list'
                    ? 'Manage and create content briefs for your team'
                    : viewMode === 'source_selection'
                    ? 'Choose how to start your brief'
                    : briefStepLabels[workflowStep]
                  }
                </DialogDescription>
              </div>
            </div>
            {viewMode === 'list' && (
              <Button
                onClick={handleStartNewBrief}
                className="bg-[#407B9D] hover:bg-[#407B9D]/90"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Brief
              </Button>
            )}
            {viewMode === 'workflow' && hasUnsavedChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveAndExit}
                className="border-[#407B9D] text-[#407B9D]"
              >
                <Save className="w-4 h-4 mr-1" />
                Save & Exit
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Workflow Step Indicator */}
        {viewMode === 'workflow' && (
          <div className="border-b pb-2">
            <StepIndicator
              steps={getWorkflowSteps()}
              currentStep={workflowStep}
              onStepClick={(step) => setWorkflowStep(step)}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-4">
          {viewMode === 'list' ? (
            // Brief List View
            <div className="space-y-4">
              {briefs.map((brief) => (
                <div
                  key={brief.id}
                  className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {brief.sourceTopicId && (
                          <Lightbulb className="w-4 h-4 text-[#407B9D]" />
                        )}
                        <h3
                          className="font-semibold text-[#463939]"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {brief.title}
                        </h3>
                        <Badge className={briefStatusColors[brief.status]}>
                          {briefStatusLabels[brief.status]}
                        </Badge>
                        <Badge className={briefStepColors[brief.currentStep]}>
                          {briefStepLabels[brief.currentStep]}
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
                              {availableAuthors.find(a => a.id === brief.assignedTo)?.name || brief.assignedTo}
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
                        {brief.sourceTopicId && (
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-[#407B9D]" />
                            <span className="text-xs text-muted-foreground">From Topic Radar</span>
                          </div>
                        )}
                      </div>

                      {/* Outline Preview */}
                      {brief.outline.length > 0 && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-md">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            OUTLINE ({brief.outline.length} sections)
                          </p>
                          <ol className="text-sm text-[#463939] space-y-1">
                            {brief.outline.slice(0, 3).map((section, idx) => (
                              <li key={section.id} className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground w-4">
                                  {idx + 1}.
                                </span>
                                {section.title}
                              </li>
                            ))}
                            {brief.outline.length > 3 && (
                              <li className="text-muted-foreground text-xs">
                                ... and {brief.outline.length - 3} more sections
                              </li>
                            )}
                          </ol>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStartWorkflow(brief)}
                        className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                      >
                        <ArrowRight className="w-4 h-4 mr-1" />
                        Continue
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
                  <p className="text-lg font-medium text-[#463939] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    No Briefs Yet
                  </p>
                  <p className="text-muted-foreground mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                    Create your first content brief to get started.
                  </p>
                  <Button
                    onClick={handleStartNewBrief}
                    className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create Brief
                  </Button>
                </div>
              )}
            </div>
          ) : viewMode === 'source_selection' ? (
            // Source Selection View
            <SourceSelector
              approvedIdeas={approvedTopicIdeas}
              onSelectManual={handleSelectManualBrief}
              onSelectIdea={handleSelectIdeaBrief}
            />
          ) : (
            // Workflow View
            <div>
              {workflowStep === 'format_selection' && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#463939] mb-2">
                      Brief Title
                    </label>
                    <Input
                      value={currentBrief.title || ''}
                      onChange={(e) => {
                        if (selectedBrief) {
                          setSelectedBrief({ ...selectedBrief, title: e.target.value })
                        } else {
                          setNewBriefData({ ...newBriefData, title: e.target.value })
                        }
                        setHasUnsavedChanges(true)
                      }}
                      placeholder="Enter a title for your content..."
                      className="text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#463939] mb-3">
                      Select Content Format
                    </label>
                    <ContentTypeSelector
                      selected={currentBrief.targetFormat}
                      onSelect={(type) => {
                        if (selectedBrief) {
                          setSelectedBrief({ ...selectedBrief, targetFormat: type })
                        } else {
                          setNewBriefData({ ...newBriefData, targetFormat: type })
                        }
                        setHasUnsavedChanges(true)
                      }}
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => handleNextStep('outline')}
                      disabled={!currentBrief.title || !currentBrief.targetFormat}
                      className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                    >
                      Generate Outline
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {workflowStep === 'outline' && (
                <OutlineEditor
                  sections={currentBrief.outline || []}
                  isGenerating={isGenerating}
                  onSectionsChange={(sections) => {
                    if (selectedBrief) {
                      setSelectedBrief({ ...selectedBrief, outline: sections })
                    } else {
                      setNewBriefData({ ...newBriefData, outline: sections })
                    }
                    setHasUnsavedChanges(true)
                  }}
                  onApprove={() => handleNextStep('first_draft')}
                  onRegenerate={() => {
                    setIsGenerating(true)
                    setTimeout(() => {
                      const baseId = Date.now()
                      const outline: OutlineSection[] = [
                        { id: `section-${baseId}-1`, title: `Introduction - Fresh take on ${currentBrief.title?.split(':')[0] || 'this topic'}`, description: 'New hook approach.' },
                        { id: `section-${baseId}-2`, title: 'Problem Overview', description: 'Reframed challenge.' },
                        { id: `section-${baseId}-3`, title: 'Alternative Solutions', description: 'Different angle.' },
                        { id: `section-${baseId}-4`, title: 'Implementation Guide', description: 'Step by step.' },
                        { id: `section-${baseId}-5`, title: 'Case Examples', description: 'Real scenarios.' },
                        { id: `section-${baseId}-6`, title: 'Action Plan', description: 'What to do next.' },
                      ]

                      if (selectedBrief) {
                        setSelectedBrief({ ...selectedBrief, outline })
                      } else {
                        setNewBriefData(prev => ({ ...prev, outline }))
                      }
                      setIsGenerating(false)
                      setHasUnsavedChanges(true)
                    }, 2000)
                  }}
                />
              )}

              {workflowStep === 'first_draft' && (
                <DraftViewer
                  brief={currentBrief}
                  isGenerating={isGenerating}
                  onApprove={() => handleNextStep('author_selection')}
                  onEdit={() => console.log('Edit draft')}
                />
              )}

              {workflowStep === 'author_selection' && (
                <div className="space-y-4">
                  <AuthorSelector
                    selected={currentBrief.assignedTo}
                    recommended={currentBrief.recommendedAuthor}
                    onSelect={(authorId) => {
                      if (selectedBrief) {
                        setSelectedBrief({ ...selectedBrief, assignedTo: authorId })
                      } else {
                        setNewBriefData({ ...newBriefData, assignedTo: authorId })
                      }
                      setHasUnsavedChanges(true)
                    }}
                  />
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => handleNextStep('final_review')}
                      disabled={!currentBrief.assignedTo}
                      className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                    >
                      Continue to Review
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {workflowStep === 'final_review' && (
                <FinalReview
                  brief={currentBrief}
                  onApproveForPublish={() => {
                    // Update brief to completed and save
                    const completedBrief = {
                      ...currentBrief,
                      status: 'completed' as const,
                      currentStep: 'published' as BriefStep,
                      finalDraft: currentBrief.firstDraft,
                    }
                    onSaveBrief(completedBrief)
                    onApproveFinalDraft?.(currentBrief.id)
                    setHasUnsavedChanges(false)
                    handleBackToList()
                  }}
                  onCopy={() => console.log('Copy content')}
                />
              )}
            </div>
          )}
        </div>

        {viewMode === 'list' && (
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
        )}
      </DialogContent>
    </Dialog>
  )
}
