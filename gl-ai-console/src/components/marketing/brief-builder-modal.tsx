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
  Send,
  MessageCircle,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import {
  ContentBrief,
  BriefStep,
  ContentType,
  OutlineSection,
  TopicIdea,
  FAQ,
  LinkRecommendation,
  ApprovalStatus,
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
  onNavigateToFinalDrafts?: () => void
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

// Draft viewer component with FAQ/Links approval and chatbot refinement
function DraftViewer({
  brief,
  onApprove,
  onEdit,
  isGenerating,
  onUpdateBrief,
}: {
  brief: ContentBrief
  onApprove: () => void
  onEdit: () => void
  isGenerating?: boolean
  onUpdateBrief?: (updates: Partial<ContentBrief>) => void
}) {
  const [copied, setCopied] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [isChatExpanded, setIsChatExpanded] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [showAddInternalLink, setShowAddInternalLink] = useState(false)
  const [showAddExternalLink, setShowAddExternalLink] = useState(false)
  const [newExternalLink, setNewExternalLink] = useState({ title: '', url: '' })
  const [internalLinkSearch, setInternalLinkSearch] = useState('')
  const [showValidationMessage, setShowValidationMessage] = useState(false)

  // Mock content library for internal link search
  const contentLibrary = [
    { id: 'content-1', title: '5 Signs You Need a Fractional CFO', url: '/blog/signs-need-fractional-cfo' },
    { id: 'content-2', title: 'Client Success Stories', url: '/case-studies' },
    { id: 'content-3', title: 'Understanding Financial Statements', url: '/blog/understanding-financial-statements' },
    { id: 'content-4', title: 'Cash Flow Management Best Practices', url: '/blog/cash-flow-management' },
    { id: 'content-5', title: 'When to Hire a CFO vs Controller', url: '/blog/cfo-vs-controller' },
  ]

  const filteredContentLibrary = contentLibrary.filter(item =>
    item.title.toLowerCase().includes(internalLinkSearch.toLowerCase())
  )

  const handleCopy = async () => {
    if (brief.firstDraft) {
      await navigator.clipboard.writeText(brief.firstDraft)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleFAQApproval = (faqId: string, status: ApprovalStatus) => {
    if (!brief.faqs || !onUpdateBrief) return
    const updatedFaqs = brief.faqs.map(faq =>
      faq.id === faqId ? { ...faq, approvalStatus: status } : faq
    )
    onUpdateBrief({ faqs: updatedFaqs })
  }

  const handleLinkApproval = (linkId: string, type: 'internal' | 'external', status: ApprovalStatus) => {
    if (!onUpdateBrief) return
    if (type === 'internal' && brief.internalLinks) {
      const updatedLinks = brief.internalLinks.map(link =>
        link.id === linkId ? { ...link, approvalStatus: status } : link
      )
      onUpdateBrief({ internalLinks: updatedLinks })
    } else if (type === 'external' && brief.externalLinks) {
      const updatedLinks = brief.externalLinks.map(link =>
        link.id === linkId ? { ...link, approvalStatus: status } : link
      )
      onUpdateBrief({ externalLinks: updatedLinks })
    }
  }

  const handleAddInternalLink = (contentItem: { id: string; title: string; url: string }) => {
    if (!onUpdateBrief) return
    const newLink: LinkRecommendation = {
      id: `link-int-${Date.now()}`,
      title: contentItem.title,
      url: contentItem.url,
      type: 'internal',
      context: 'Manually added',
      approvalStatus: 'approved',
    }
    const updatedLinks = [...(brief.internalLinks || []), newLink]
    onUpdateBrief({ internalLinks: updatedLinks })
    setShowAddInternalLink(false)
    setInternalLinkSearch('')
  }

  const handleAddExternalLink = () => {
    if (!onUpdateBrief || !newExternalLink.title || !newExternalLink.url) return
    const newLink: LinkRecommendation = {
      id: `link-ext-${Date.now()}`,
      title: newExternalLink.title,
      url: newExternalLink.url.startsWith('http') ? newExternalLink.url : `https://${newExternalLink.url}`,
      type: 'external',
      context: 'Manually added',
      approvalStatus: 'approved',
    }
    const updatedLinks = [...(brief.externalLinks || []), newLink]
    onUpdateBrief({ externalLinks: updatedLinks })
    setShowAddExternalLink(false)
    setNewExternalLink({ title: '', url: '' })
  }

  const handleChatSubmit = () => {
    if (!chatInput.trim() || !onUpdateBrief) return
    setIsRefining(true)

    // Simulate AI refinement
    setTimeout(() => {
      // This would normally call an AI API - for now just show feedback was received
      setIsRefining(false)
      setChatInput('')
      // In real implementation, this would update the draft based on AI response
    }, 2000)
  }

  // Count items needing decisions (no approvalStatus or status is 'pending')
  const pendingFaqs = brief.faqs?.filter(f => !f.approvalStatus || f.approvalStatus === 'pending').length || 0
  const pendingInternalLinks = brief.internalLinks?.filter(l => !l.approvalStatus || l.approvalStatus === 'pending').length || 0
  const pendingExternalLinks = brief.externalLinks?.filter(l => !l.approvalStatus || l.approvalStatus === 'pending').length || 0

  // Total pending items that need a decision
  const totalPendingDecisions = pendingFaqs + pendingInternalLinks + pendingExternalLinks

  // Check if all items have been decided (approved or rejected)
  const allDecisionsMade = totalPendingDecisions === 0

  const handleApproveClick = () => {
    if (!allDecisionsMade) {
      setShowValidationMessage(true)
      // Auto-hide after 5 seconds
      setTimeout(() => setShowValidationMessage(false), 5000)
      return
    }
    setShowValidationMessage(false)
    onApprove()
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

      {/* FAQs with Approve/Deny */}
      {brief.faqs && brief.faqs.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-amber-50 px-4 py-2 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-[#463939]">FAQs</span>
              <Badge variant="secondary" className="text-xs">
                {brief.faqs.filter(f => f.approvalStatus !== 'rejected').length} active
              </Badge>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {brief.faqs.map((faq) => {
              const isRejected = faq.approvalStatus === 'rejected'
              const isApproved = faq.approvalStatus === 'approved'
              return (
                <div
                  key={faq.id}
                  className={`p-3 rounded-lg border ${
                    isRejected
                      ? 'bg-red-50/50 border-red-200 opacity-50'
                      : isApproved
                      ? 'bg-green-50/50 border-green-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 text-sm">
                      <p className={`font-medium ${isRejected ? 'text-slate-400 line-through' : 'text-[#463939]'}`}>
                        {faq.question}
                      </p>
                      <p className={`mt-1 ${isRejected ? 'text-slate-400' : 'text-muted-foreground'}`}>
                        {faq.answer}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!isRejected && (
                        <button
                          onClick={() => handleFAQApproval(faq.id, 'approved')}
                          className={`p-1.5 rounded-md transition-colors ${
                            isApproved
                              ? 'bg-green-500 text-white'
                              : 'hover:bg-green-100 text-green-600'
                          }`}
                          title="Approve FAQ"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {!isApproved && (
                        <button
                          onClick={() => handleFAQApproval(faq.id, 'rejected')}
                          className={`p-1.5 rounded-md transition-colors ${
                            isRejected
                              ? 'bg-red-500 text-white'
                              : 'hover:bg-red-100 text-red-600'
                          }`}
                          title="Reject FAQ"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Links with Approve/Deny/Add */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Internal Links */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-blue-50 px-4 py-2 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-[#463939]">Internal Links</span>
              {brief.internalLinks && brief.internalLinks.filter(l => l.approvalStatus !== 'rejected').length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {brief.internalLinks.filter(l => l.approvalStatus !== 'rejected').length}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddInternalLink(!showAddInternalLink)}
              className="text-blue-600 h-7 px-2"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>

          {/* Add Internal Link Search */}
          {showAddInternalLink && (
            <div className="p-3 bg-blue-50/50 border-b">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={internalLinkSearch}
                  onChange={(e) => setInternalLinkSearch(e.target.value)}
                  placeholder="Search content library..."
                  className="pl-9 h-8 text-sm"
                />
              </div>
              {internalLinkSearch && (
                <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                  {filteredContentLibrary.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAddInternalLink(item)}
                      className="w-full text-left p-2 text-sm rounded hover:bg-blue-100 transition-colors"
                    >
                      {item.title}
                    </button>
                  ))}
                  {filteredContentLibrary.length === 0 && (
                    <p className="text-sm text-muted-foreground p-2">No matching content found</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="p-3 space-y-2">
            {brief.internalLinks && brief.internalLinks.length > 0 ? (
              brief.internalLinks.map((link) => {
                const isRejected = link.approvalStatus === 'rejected'
                const isApproved = link.approvalStatus === 'approved'
                return (
                  <div
                    key={link.id}
                    className={`flex items-center justify-between gap-2 p-2 rounded ${
                      isRejected ? 'bg-red-50 opacity-50' : isApproved ? 'bg-green-50' : 'bg-slate-50'
                    }`}
                  >
                    <span className={`text-sm ${isRejected ? 'text-slate-400 line-through' : 'text-[#407B9D]'}`}>
                      {link.title}
                    </span>
                    <div className="flex items-center gap-1">
                      {!isRejected && (
                        <button
                          onClick={() => handleLinkApproval(link.id, 'internal', 'approved')}
                          className={`p-1 rounded transition-colors ${
                            isApproved ? 'bg-green-500 text-white' : 'hover:bg-green-100 text-green-600'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                      {!isApproved && (
                        <button
                          onClick={() => handleLinkApproval(link.id, 'internal', 'rejected')}
                          className={`p-1 rounded transition-colors ${
                            isRejected ? 'bg-red-500 text-white' : 'hover:bg-red-100 text-red-600'
                          }`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">No internal links suggested</p>
            )}
          </div>
        </div>

        {/* External Links */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-purple-50 px-4 py-2 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-[#463939]">External Links</span>
              {brief.externalLinks && brief.externalLinks.filter(l => l.approvalStatus !== 'rejected').length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {brief.externalLinks.filter(l => l.approvalStatus !== 'rejected').length}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddExternalLink(!showAddExternalLink)}
              className="text-purple-600 h-7 px-2"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>

          {/* Add External Link Form */}
          {showAddExternalLink && (
            <div className="p-3 bg-purple-50/50 border-b space-y-2">
              <Input
                value={newExternalLink.title}
                onChange={(e) => setNewExternalLink(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Link title..."
                className="h-8 text-sm"
              />
              <div className="flex gap-2">
                <Input
                  value={newExternalLink.url}
                  onChange={(e) => setNewExternalLink(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                  className="h-8 text-sm flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleAddExternalLink}
                  disabled={!newExternalLink.title || !newExternalLink.url}
                  className="h-8 bg-purple-600 hover:bg-purple-700"
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          <div className="p-3 space-y-2">
            {brief.externalLinks && brief.externalLinks.length > 0 ? (
              brief.externalLinks.map((link) => {
                const isRejected = link.approvalStatus === 'rejected'
                const isApproved = link.approvalStatus === 'approved'
                return (
                  <div
                    key={link.id}
                    className={`flex items-center justify-between gap-2 p-2 rounded ${
                      isRejected ? 'bg-red-50 opacity-50' : isApproved ? 'bg-green-50' : 'bg-slate-50'
                    }`}
                  >
                    <span className={`text-sm ${isRejected ? 'text-slate-400 line-through' : 'text-purple-600'}`}>
                      {link.title}
                    </span>
                    <div className="flex items-center gap-1">
                      {!isRejected && (
                        <button
                          onClick={() => handleLinkApproval(link.id, 'external', 'approved')}
                          className={`p-1 rounded transition-colors ${
                            isApproved ? 'bg-green-500 text-white' : 'hover:bg-green-100 text-green-600'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                      {!isApproved && (
                        <button
                          onClick={() => handleLinkApproval(link.id, 'external', 'rejected')}
                          className={`p-1 rounded transition-colors ${
                            isRejected ? 'bg-red-500 text-white' : 'hover:bg-red-100 text-red-600'
                          }`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">No external links suggested</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Refinement Chat */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => setIsChatExpanded(!isChatExpanded)}
          className="w-full bg-[#407B9D]/5 px-4 py-3 flex items-center justify-between hover:bg-[#407B9D]/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#407B9D]" />
            <span className="text-sm font-medium text-[#463939]">Refine with AI</span>
            <span className="text-xs text-muted-foreground">
              Give feedback to improve the draft, FAQs, or links
            </span>
          </div>
          {isChatExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {isChatExpanded && (
          <div className="p-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Describe what you&apos;d like to change. For example: &quot;Make the introduction more engaging&quot; or &quot;Add more detail to section 2&quot; or &quot;Suggest FAQs about pricing&quot;
            </p>
            <div className="flex gap-2">
              <Textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your feedback here..."
                className="flex-1 min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleChatSubmit()
                  }
                }}
              />
            </div>
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleChatSubmit}
                disabled={!chatInput.trim() || isRefining}
                className="bg-[#407B9D] hover:bg-[#407B9D]/90"
              >
                {isRefining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Refining...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1" />
                    Send Feedback
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Validation Message */}
      {showValidationMessage && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <HelpCircle className="w-3 h-3 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">Action Required</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Please approve or reject all FAQs and links before approving the draft.
              {pendingFaqs > 0 && ` ${pendingFaqs} FAQ${pendingFaqs > 1 ? 's' : ''} pending.`}
              {pendingInternalLinks > 0 && ` ${pendingInternalLinks} internal link${pendingInternalLinks > 1 ? 's' : ''} pending.`}
              {pendingExternalLinks > 0 && ` ${pendingExternalLinks} external link${pendingExternalLinks > 1 ? 's' : ''} pending.`}
            </p>
          </div>
          <button
            onClick={() => setShowValidationMessage(false)}
            className="text-amber-600 hover:text-amber-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex justify-end pt-4 items-center gap-3">
        {!allDecisionsMade && (
          <span className="text-xs text-muted-foreground">
            {totalPendingDecisions} item{totalPendingDecisions > 1 ? 's' : ''} need{totalPendingDecisions === 1 ? 's' : ''} approval
          </span>
        )}
        <Button
          onClick={handleApproveClick}
          className={allDecisionsMade
            ? "bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80"
            : "bg-slate-200 text-slate-500 hover:bg-slate-300"
          }
        >
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

// Final review component - shows only approved content
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

  // Filter to only approved FAQs and links (or those without status set, for backwards compatibility)
  const approvedFaqs = brief.faqs?.filter(f => f.approvalStatus !== 'rejected') || []
  const approvedInternalLinks = brief.internalLinks?.filter(l => l.approvalStatus !== 'rejected') || []
  const approvedExternalLinks = brief.externalLinks?.filter(l => l.approvalStatus !== 'rejected') || []

  // Build complete content for copy
  const buildFullContent = () => {
    let content = brief.finalDraft || brief.firstDraft || ''

    // Add FAQs section if any approved
    if (approvedFaqs.length > 0) {
      content += '\n\n## Frequently Asked Questions\n\n'
      approvedFaqs.forEach(faq => {
        content += `**Q: ${faq.question}**\n${faq.answer}\n\n`
      })
    }

    // Add links section if any approved
    if (approvedInternalLinks.length > 0 || approvedExternalLinks.length > 0) {
      content += '\n\n## Related Resources\n\n'
      if (approvedInternalLinks.length > 0) {
        content += '### Internal Links\n'
        approvedInternalLinks.forEach(link => {
          content += `- [${link.title}](${link.url})\n`
        })
      }
      if (approvedExternalLinks.length > 0) {
        content += '\n### External Links\n'
        approvedExternalLinks.forEach(link => {
          content += `- [${link.title}](${link.url})\n`
        })
      }
    }

    return content
  }

  const handleCopy = async () => {
    const fullContent = buildFullContent()
    await navigator.clipboard.writeText(fullContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
            {copied ? 'Copied All!' : 'Copy All Content'}
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

      {/* Approved FAQs Summary */}
      {approvedFaqs.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-amber-50 px-4 py-2 border-b flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-[#463939]">
              Approved FAQs ({approvedFaqs.length})
            </span>
          </div>
          <div className="p-3 space-y-2 max-h-32 overflow-y-auto">
            {approvedFaqs.map(faq => (
              <div key={faq.id} className="text-sm">
                <p className="font-medium text-[#463939]">{faq.question}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Links Summary */}
      {(approvedInternalLinks.length > 0 || approvedExternalLinks.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {approvedInternalLinks.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-2 border-b flex items-center gap-2">
                <Link className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-[#463939]">
                  Internal ({approvedInternalLinks.length})
                </span>
              </div>
              <div className="p-2 space-y-1 text-sm">
                {approvedInternalLinks.map(link => (
                  <p key={link.id} className="text-[#407B9D] truncate">{link.title}</p>
                ))}
              </div>
            </div>
          )}
          {approvedExternalLinks.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-purple-50 px-4 py-2 border-b flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-[#463939]">
                  External ({approvedExternalLinks.length})
                </span>
              </div>
              <div className="p-2 space-y-1 text-sm">
                {approvedExternalLinks.map(link => (
                  <p key={link.id} className="text-purple-600 truncate">{link.title}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
  onNavigateToFinalDrafts,
  initialBriefId,
}: BriefBuilderModalProps) {
  const [viewMode, setViewMode] = useState<'list' | 'source_selection' | 'workflow'>('list')
  const [selectedBrief, setSelectedBrief] = useState<ContentBrief | null>(null)
  const [workflowStep, setWorkflowStep] = useState<BriefStep>('format_selection')
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Track recently completed brief IDs to filter them immediately (before props update)
  const [completedBriefIds, setCompletedBriefIds] = useState<Set<string>>(new Set())

  // Workflow state for new brief creation
  const [newBriefData, setNewBriefData] = useState<Partial<ContentBrief>>({
    outline: [],
    targetKeywords: [],
  })

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      // Clear the completed briefs tracking when modal opens
      // (the actual data should be in sync with localStorage now)
      setCompletedBriefIds(new Set())

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
      // Generate format-specific outline
      const baseId = Date.now()
      const format = idea.suggestedFormat
      let outline: OutlineSection[] = []

      if (format === 'youtube') {
        outline = [
          { id: `section-${baseId}-1`, title: 'Hook (0:00-0:30)', description: 'Attention-grabbing opener that makes viewers want to keep watching' },
          { id: `section-${baseId}-2`, title: 'Intro & Context (0:30-1:30)', description: 'Introduce yourself and set up the topic' },
          { id: `section-${baseId}-3`, title: 'Main Content (1:30-5:00)', description: 'Core value delivery - the meat of your video' },
          { id: `section-${baseId}-4`, title: 'Key Takeaways (5:00-6:00)', description: 'Summarize the main points viewers should remember' },
          { id: `section-${baseId}-5`, title: 'CTA & Outro (6:00-6:30)', description: 'Subscribe, comment, next video preview' },
        ]
      } else if (format === 'linkedin') {
        outline = [
          { id: `section-${baseId}-1`, title: 'Hook Line', description: 'First line that stops the scroll - make it count' },
          { id: `section-${baseId}-2`, title: 'The Story/Problem', description: 'Share context or a relatable challenge' },
          { id: `section-${baseId}-3`, title: 'Key Insight', description: 'Your main point or lesson learned' },
          { id: `section-${baseId}-4`, title: 'Call to Action', description: 'Engage your audience - question or action step' },
        ]
      } else if (format === 'case_study') {
        outline = [
          { id: `section-${baseId}-1`, title: 'Executive Summary', description: 'Quick overview of client, challenge, and results' },
          { id: `section-${baseId}-2`, title: 'The Client', description: 'Background on the company and their situation' },
          { id: `section-${baseId}-3`, title: 'The Challenge', description: 'What problem were they facing?' },
          { id: `section-${baseId}-4`, title: 'The Solution', description: 'How we approached solving the problem' },
          { id: `section-${baseId}-5`, title: 'The Results', description: 'Measurable outcomes and impact' },
          { id: `section-${baseId}-6`, title: 'Key Takeaways', description: 'Lessons that apply to similar businesses' },
        ]
      } else if (format === 'website_page') {
        outline = [
          { id: `section-${baseId}-1`, title: 'Hero Section', description: 'Main headline and value proposition' },
          { id: `section-${baseId}-2`, title: 'Problem Statement', description: 'What challenge does this page address?' },
          { id: `section-${baseId}-3`, title: 'Solution Overview', description: 'How we solve the problem' },
          { id: `section-${baseId}-4`, title: 'Benefits/Features', description: 'Key benefits or features to highlight' },
          { id: `section-${baseId}-5`, title: 'Social Proof', description: 'Testimonials, logos, or stats' },
          { id: `section-${baseId}-6`, title: 'Call to Action', description: 'What should visitors do next?' },
        ]
      } else {
        // Default blog format
        outline = [
          { id: `section-${baseId}-1`, title: `Introduction - Why ${idea.topic.split(':')[0]} matters`, description: 'Hook readers with a compelling problem statement.' },
          { id: `section-${baseId}-2`, title: 'The Core Challenge', description: 'Define the problem your audience faces.' },
          { id: `section-${baseId}-3`, title: 'Key Insights and Solutions', description: 'Present your main points with supporting evidence.' },
          { id: `section-${baseId}-4`, title: 'Practical Steps', description: 'Actionable advice readers can implement.' },
          { id: `section-${baseId}-5`, title: 'Common Mistakes to Avoid', description: 'What not to do - prevents errors.' },
          { id: `section-${baseId}-6`, title: 'Conclusion and Next Steps', description: 'Summarize key points and include CTA.' },
        ]
      }

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
    // Reset state directly without calling handleBackToList (which could save again)
    setHasUnsavedChanges(false)
    setViewMode('list')
    setSelectedBrief(null)
    setNewBriefData({})
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
        const format = brief.targetFormat || 'blog'

        // Generate format-specific outlines
        let outline: OutlineSection[] = []

        if (format === 'youtube') {
          // YouTube video script format
          outline = [
            { id: `section-${baseId}-1`, title: 'Hook (0:00-0:30)', description: 'Attention-grabbing opener that makes viewers want to keep watching' },
            { id: `section-${baseId}-2`, title: 'Intro & Context (0:30-1:30)', description: 'Introduce yourself and set up the topic' },
            { id: `section-${baseId}-3`, title: 'Main Content (1:30-5:00)', description: 'Core value delivery - the meat of your video' },
            { id: `section-${baseId}-4`, title: 'Key Takeaways (5:00-6:00)', description: 'Summarize the main points viewers should remember' },
            { id: `section-${baseId}-5`, title: 'CTA & Outro (6:00-6:30)', description: 'Subscribe, comment, next video preview' },
          ]
        } else if (format === 'linkedin') {
          // LinkedIn post format (shorter)
          outline = [
            { id: `section-${baseId}-1`, title: 'Hook Line', description: 'First line that stops the scroll - make it count' },
            { id: `section-${baseId}-2`, title: 'The Story/Problem', description: 'Share context or a relatable challenge' },
            { id: `section-${baseId}-3`, title: 'Key Insight', description: 'Your main point or lesson learned' },
            { id: `section-${baseId}-4`, title: 'Call to Action', description: 'Engage your audience - question or action step' },
          ]
        } else if (format === 'case_study') {
          // Case study format
          outline = [
            { id: `section-${baseId}-1`, title: 'Executive Summary', description: 'Quick overview of client, challenge, and results' },
            { id: `section-${baseId}-2`, title: 'The Client', description: 'Background on the company and their situation' },
            { id: `section-${baseId}-3`, title: 'The Challenge', description: 'What problem were they facing?' },
            { id: `section-${baseId}-4`, title: 'The Solution', description: 'How we approached solving the problem' },
            { id: `section-${baseId}-5`, title: 'The Results', description: 'Measurable outcomes and impact' },
            { id: `section-${baseId}-6`, title: 'Key Takeaways', description: 'Lessons that apply to similar businesses' },
          ]
        } else if (format === 'website_page') {
          // Website page format
          outline = [
            { id: `section-${baseId}-1`, title: 'Hero Section', description: 'Main headline and value proposition' },
            { id: `section-${baseId}-2`, title: 'Problem Statement', description: 'What challenge does this page address?' },
            { id: `section-${baseId}-3`, title: 'Solution Overview', description: 'How we solve the problem' },
            { id: `section-${baseId}-4`, title: 'Benefits/Features', description: 'Key benefits or features to highlight' },
            { id: `section-${baseId}-5`, title: 'Social Proof', description: 'Testimonials, logos, or stats' },
            { id: `section-${baseId}-6`, title: 'Call to Action', description: 'What should visitors do next?' },
          ]
        } else {
          // Default blog format
          outline = [
            { id: `section-${baseId}-1`, title: `Introduction - Why ${brief.title?.split(':')[0] || 'this topic'} matters`, description: 'Hook readers with a compelling opening.' },
            { id: `section-${baseId}-2`, title: 'The Core Challenge', description: 'Define the problem your audience faces.' },
            { id: `section-${baseId}-3`, title: 'Key Solutions', description: 'Present your main points with evidence.' },
            { id: `section-${baseId}-4`, title: 'Practical Steps', description: 'Actionable advice readers can implement.' },
            { id: `section-${baseId}-5`, title: 'Mistakes to Avoid', description: 'Common pitfalls to watch out for.' },
            { id: `section-${baseId}-6`, title: 'Conclusion', description: 'Summary and clear call to action.' },
          ]
        }

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
            // Brief List View - filter out completed/published briefs AND recently completed ones
            <div className="space-y-4">
              {briefs.filter(b => b.status !== 'completed' && b.currentStep !== 'published' && !completedBriefIds.has(b.id)).map((brief) => (
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

              {briefs.filter(b => b.status !== 'completed' && b.currentStep !== 'published' && !completedBriefIds.has(b.id)).length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-[#463939] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    No Active Briefs
                  </p>
                  <p className="text-muted-foreground mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                    Create a content brief to get started, or check Final Drafts for completed content.
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
                      const format = currentBrief.targetFormat || 'blog'
                      let outline: OutlineSection[] = []

                      // Generate format-specific alternative outlines
                      if (format === 'youtube') {
                        outline = [
                          { id: `section-${baseId}-1`, title: 'Pattern Interrupt (0:00-0:20)', description: 'Start with something unexpected' },
                          { id: `section-${baseId}-2`, title: 'Big Promise (0:20-1:00)', description: 'What will viewers learn?' },
                          { id: `section-${baseId}-3`, title: 'Quick Win (1:00-2:30)', description: 'Give immediate value upfront' },
                          { id: `section-${baseId}-4`, title: 'Deep Dive (2:30-5:30)', description: 'The detailed breakdown' },
                          { id: `section-${baseId}-5`, title: 'Recap & CTA (5:30-6:00)', description: 'Summarize and ask for engagement' },
                        ]
                      } else if (format === 'linkedin') {
                        outline = [
                          { id: `section-${baseId}-1`, title: 'Contrarian Take', description: 'Challenge conventional wisdom' },
                          { id: `section-${baseId}-2`, title: 'Personal Experience', description: 'Share your perspective' },
                          { id: `section-${baseId}-3`, title: 'The Lesson', description: 'What you learned' },
                          { id: `section-${baseId}-4`, title: 'Engage', description: 'Ask for opinions or shares' },
                        ]
                      } else if (format === 'case_study') {
                        outline = [
                          { id: `section-${baseId}-1`, title: 'The Transformation', description: 'Before vs after snapshot' },
                          { id: `section-${baseId}-2`, title: 'Why They Came to Us', description: 'The breaking point' },
                          { id: `section-${baseId}-3`, title: 'Our Approach', description: 'Methodology and process' },
                          { id: `section-${baseId}-4`, title: 'Key Milestones', description: 'Timeline of progress' },
                          { id: `section-${baseId}-5`, title: 'ROI & Impact', description: 'Numbers that matter' },
                          { id: `section-${baseId}-6`, title: 'Client Testimonial', description: 'In their own words' },
                        ]
                      } else if (format === 'website_page') {
                        outline = [
                          { id: `section-${baseId}-1`, title: 'Bold Statement', description: 'Lead with your strongest claim' },
                          { id: `section-${baseId}-2`, title: 'The Gap', description: 'What is missing in the market?' },
                          { id: `section-${baseId}-3`, title: 'Our Difference', description: 'How we fill that gap' },
                          { id: `section-${baseId}-4`, title: 'Proof Points', description: 'Evidence and credentials' },
                          { id: `section-${baseId}-5`, title: 'FAQ Section', description: 'Address common objections' },
                          { id: `section-${baseId}-6`, title: 'Next Step', description: 'Clear path forward' },
                        ]
                      } else {
                        outline = [
                          { id: `section-${baseId}-1`, title: `Fresh Angle on ${currentBrief.title?.split(':')[0] || 'this topic'}`, description: 'New hook approach.' },
                          { id: `section-${baseId}-2`, title: 'Problem Reframed', description: 'Different perspective on the challenge.' },
                          { id: `section-${baseId}-3`, title: 'Alternative Solutions', description: 'Explore different approaches.' },
                          { id: `section-${baseId}-4`, title: 'Implementation Guide', description: 'Step by step walkthrough.' },
                          { id: `section-${baseId}-5`, title: 'Real Examples', description: 'Case scenarios and applications.' },
                          { id: `section-${baseId}-6`, title: 'Action Plan', description: 'What to do next.' },
                        ]
                      }

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
                  onUpdateBrief={(updates) => {
                    if (selectedBrief) {
                      setSelectedBrief({ ...selectedBrief, ...updates })
                    } else {
                      setNewBriefData({ ...newBriefData, ...updates })
                    }
                    setHasUnsavedChanges(true)
                  }}
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
                    // Save brief first, then create final draft
                    onSaveBrief(completedBrief)
                    onApproveFinalDraft?.(currentBrief.id)

                    // Mark this brief as completed immediately so it's filtered from list
                    // This prevents the "still showing" issue before props update
                    setCompletedBriefIds(prev => new Set([...prev, currentBrief.id]))

                    // Clear current selection
                    setSelectedBrief(null)
                    setNewBriefData({})
                    setHasUnsavedChanges(false)

                    // Close the modal and navigate to Final Drafts section
                    onOpenChange(false)
                    onNavigateToFinalDrafts?.()
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
              {briefs.filter(b => b.status !== 'completed' && b.currentStep !== 'published' && !completedBriefIds.has(b.id)).length} active brief{briefs.filter(b => b.status !== 'completed' && b.currentStep !== 'published' && !completedBriefIds.has(b.id)).length !== 1 ? 's' : ''}
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
