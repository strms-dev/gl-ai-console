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
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Wand2,
  Search,
  Upload,
  Link,
  BookOpen,
  Youtube,
  Linkedin as LinkedinIcon,
  FileQuestion,
  Clock,
  Sparkles,
  Loader2,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRightIcon,
  Edit3,
  Copy,
  ExternalLink,
  Plus,
} from "lucide-react"
import {
  RepurposeItem,
  RepurposeStep,
  RepurposeSourceType,
  ContentType,
  TargetFormatConfig,
  GeneratedFormatContent,
  YouTubeChapter,
  FAQ,
  LinkRecommendation,
  RepurposedOutput,
  ContentItem,
  contentTypeLabels,
  contentTypeColors,
  sourceOriginLabels,
  sourceOriginColors,
  repurposeStepLabels,
  repurposeSourceTypeLabels,
  formatFeatures,
  repurposeTargetFormats,
  FinalDraft,
} from "@/lib/marketing-content-types"

interface RepurposeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: RepurposeItem[]
  libraryContent?: ContentItem[]  // Full content library for Search Library
  readyToRepurpose?: FinalDraft[]  // Recently published briefs
  onRepurpose: (itemId: string, targetFormat: string) => void
  onPublishToLibrary?: (formatId: string, content: string) => void
  initialView?: 'list' | 'workflow'  // Start directly in workflow mode if specified
}

// Step indicator component
function RepurposeStepIndicator({
  steps,
  currentStep,
  onStepClick
}: {
  steps: { key: RepurposeStep; label: string; completed: boolean }[]
  currentStep: RepurposeStep
  onStepClick?: (step: RepurposeStep) => void
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

// Format type icon
function FormatIcon({ format, className = "w-5 h-5" }: { format: ContentType; className?: string }) {
  switch (format) {
    case 'blog':
      return <BookOpen className={className} />
    case 'youtube':
      return <Youtube className={className} />
    case 'linkedin':
      return <LinkedinIcon className={className} />
    case 'case_study':
      return <FileQuestion className={className} />
    default:
      return <BookOpen className={className} />
  }
}

// Expandable source content card for list view
function SourceContentCard({
  item,
  createdOutputs,
  onCreateNew,
  onRepurpose,
}: {
  item: RepurposeItem
  createdOutputs: RepurposedOutput[]
  onCreateNew: (itemId: string) => void
  onRepurpose: (itemId: string, format: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  // Get formats that haven't been created yet
  const remainingFormats = item.suggestedFormats.filter(
    format => !createdOutputs.some(output => output.format === format)
  )

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      {/* Header - always visible */}
      <div
        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3
                className="font-semibold text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {item.sourceTitle}
              </h3>
              <Badge className={contentTypeColors[item.sourceType]}>
                {contentTypeLabels[item.sourceType]}
              </Badge>
              <Badge className={sourceOriginColors[item.sourceOrigin]}>
                {sourceOriginLabels[item.sourceOrigin]}
              </Badge>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-4 text-sm">
              {createdOutputs.length > 0 && (
                <span className="flex items-center gap-1 text-[#407B9D]">
                  <CheckCircle className="w-4 h-4" />
                  {createdOutputs.length} format{createdOutputs.length !== 1 ? 's' : ''} created
                </span>
              )}
              {remainingFormats.length > 0 && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Plus className="w-4 h-4" />
                  {remainingFormats.length} more available
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t px-4 py-4 space-y-4 bg-slate-50/50">
          {/* Created formats section */}
          {createdOutputs.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Created Formats
              </h4>
              <div className="space-y-2">
                {createdOutputs.map((output) => (
                  <div
                    key={output.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white border"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#C8E4BB]/30 flex items-center justify-center">
                      <FormatIcon format={output.format} className="w-4 h-4 text-[#407B9D]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#463939] truncate">
                        {output.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contentTypeLabels[output.format]} • Created {new Date(output.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remaining formats section */}
          {remainingFormats.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Available to Create
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                {remainingFormats.map((format) => (
                  <Button
                    key={format}
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRepurpose(item.id, format)
                    }}
                    className="border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D] hover:text-white transition-colors"
                  >
                    <Wand2 className="w-3.5 h-3.5 mr-1" />
                    {contentTypeLabels[format]}
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Start new repurpose workflow button */}
          <div className="pt-2 border-t">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onCreateNew(item.id)
              }}
              className="bg-[#407B9D] hover:bg-[#407B9D]/90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Multi-Format Repurpose
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Source selection step
function SourceSelectionStep({
  readyToRepurpose,
  libraryContent,
  onSelectSource,
  selectedSource,
  sourceType,
  onSourceTypeChange,
  searchQuery,
  onSearchChange,
  externalUrl,
  onExternalUrlChange,
  externalContent,
  onExternalContentChange,
}: {
  readyToRepurpose: FinalDraft[]
  libraryContent: ContentItem[]
  onSelectSource: (item: ContentItem | FinalDraft) => void
  selectedSource: ContentItem | FinalDraft | null
  sourceType: RepurposeSourceType
  onSourceTypeChange: (type: RepurposeSourceType) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  externalUrl: string
  onExternalUrlChange: (url: string) => void
  externalContent: string
  onExternalContentChange: (content: string) => void
}) {
  const filteredLibrary = libraryContent.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Three entry point cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ready to Repurpose */}
        <button
          onClick={() => onSourceTypeChange('ready_content')}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            sourceType === 'ready_content'
              ? 'border-[#407B9D] bg-[#407B9D]/5'
              : 'border-slate-200 hover:border-[#407B9D]/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              sourceType === 'ready_content' ? 'bg-[#407B9D] text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            {readyToRepurpose.length > 0 && (
              <Badge className="bg-[#C8E4BB] text-[#463939]">
                {readyToRepurpose.length} new
              </Badge>
            )}
          </div>
          <h4
            className="font-medium text-[#463939] mb-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Ready to Repurpose
          </h4>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
            Recently published content from Brief Builder
          </p>
        </button>

        {/* Search Library */}
        <button
          onClick={() => onSourceTypeChange('library_search')}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            sourceType === 'library_search'
              ? 'border-[#407B9D] bg-[#407B9D]/5'
              : 'border-slate-200 hover:border-[#407B9D]/50'
          }`}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
            sourceType === 'library_search' ? 'bg-[#407B9D] text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            <Search className="w-5 h-5" />
          </div>
          <h4
            className="font-medium text-[#463939] mb-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Search Library
          </h4>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
            Find existing content to repurpose
          </p>
        </button>

        {/* External Content */}
        <button
          onClick={() => onSourceTypeChange('external_input')}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            sourceType === 'external_input'
              ? 'border-[#407B9D] bg-[#407B9D]/5'
              : 'border-slate-200 hover:border-[#407B9D]/50'
          }`}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
            sourceType === 'external_input' ? 'bg-[#407B9D] text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            <Upload className="w-5 h-5" />
          </div>
          <h4
            className="font-medium text-[#463939] mb-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            External Content
          </h4>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
            Paste URL or content to repurpose
          </p>
        </button>
      </div>

      {/* Content based on selected source type */}
      {sourceType === 'ready_content' && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Recently Published ({readyToRepurpose.length})
          </h4>
          {readyToRepurpose.length > 0 ? (
            <div className="space-y-2">
              {readyToRepurpose.map((draft) => {
                const isSelected = selectedSource && 'title' in selectedSource && selectedSource.id === draft.id
                return (
                  <button
                    key={draft.id}
                    onClick={() => onSelectSource(draft)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-[#407B9D] bg-[#407B9D]/5'
                        : 'border-slate-200 hover:border-[#407B9D] hover:bg-[#407B9D]/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-[#407B9D] text-white' : 'bg-slate-100'
                      }`}>
                        {isSelected ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <FormatIcon format={draft.targetFormat} className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-[#463939] text-sm">{draft.title}</h5>
                        <p className="text-xs text-muted-foreground">
                          {contentTypeLabels[draft.targetFormat]} • Published {draft.approvedAt}
                        </p>
                      </div>
                      {isSelected ? (
                        <CheckCircle className="w-5 h-5 text-[#407B9D]" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No recently published content.</p>
              <p className="text-xs mt-1">Publish content from Brief Builder to see it here.</p>
            </div>
          )}
        </div>
      )}

      {sourceType === 'library_search' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search content library..."
              className="pl-10"
            />
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {filteredLibrary.map((item) => {
              const isSelected = selectedSource && 'type' in selectedSource && selectedSource.id === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSource(item)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-[#407B9D] bg-[#407B9D]/5'
                      : 'border-slate-200 hover:border-[#407B9D] hover:bg-[#407B9D]/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-[#407B9D] text-white' : 'bg-slate-100'
                    }`}>
                      {isSelected ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <FormatIcon format={item.type} className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-[#463939] text-sm">{item.title}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${contentTypeColors[item.type]}`}>
                          {contentTypeLabels[item.type]}
                        </Badge>
                        {item.author && (
                          <span className="text-xs text-muted-foreground">
                            by {item.author}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected ? (
                      <CheckCircle className="w-5 h-5 text-[#407B9D]" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
              )
            })}
            {filteredLibrary.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No content found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {sourceType === 'external_input' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#463939] mb-2">
              URL (optional)
            </label>
            <div className="relative">
              <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={externalUrl}
                onChange={(e) => onExternalUrlChange(e.target.value)}
                placeholder="https://example.com/article"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#463939] mb-2">
              Or paste content directly
            </label>
            <Textarea
              value={externalContent}
              onChange={(e) => onExternalContentChange(e.target.value)}
              placeholder="Paste your content here..."
              className="min-h-[150px]"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Format selection step
function FormatSelectionStep({
  targetFormats,
  onToggleFormat,
  sourceFormat,
}: {
  targetFormats: TargetFormatConfig[]
  onToggleFormat: (formatId: string) => void
  sourceFormat?: ContentType
}) {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h4 className="text-sm font-medium text-[#463939] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          Select Target Formats
        </h4>
        <p className="text-xs text-muted-foreground">
          Choose which formats you want to create from your source content
        </p>
      </div>

      <div className="space-y-3">
        {targetFormats.map((config) => {
          const features = formatFeatures[config.format]
          const isSourceFormat = config.format === sourceFormat

          return (
            <label
              key={config.id}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                config.selected
                  ? 'border-[#407B9D] bg-[#407B9D]/5'
                  : isSourceFormat
                  ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={config.selected}
                onChange={() => !isSourceFormat && onToggleFormat(config.id)}
                disabled={isSourceFormat}
                className="w-5 h-5 text-[#407B9D] rounded focus:ring-[#407B9D]"
              />
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                config.selected ? 'bg-[#407B9D] text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <FormatIcon format={config.format} />
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-[#463939]">
                  {contentTypeLabels[config.format]}
                  {isSourceFormat && <span className="text-xs text-muted-foreground ml-2">(source)</span>}
                </h5>
                <div className="flex flex-wrap gap-2 mt-1">
                  {features.supportsFaqs && (
                    <Badge className="text-xs bg-blue-50 text-blue-700">+ FAQs</Badge>
                  )}
                  {features.supportsLinks && (
                    <Badge className="text-xs bg-green-50 text-green-700">+ Links</Badge>
                  )}
                  {features.supportsChapters && (
                    <Badge className="text-xs bg-purple-50 text-purple-700">+ Chapters</Badge>
                  )}
                  {features.supportsVariations && (
                    <Badge className="text-xs bg-amber-50 text-amber-700">
                      {features.defaultVariationCount || 5} variations
                    </Badge>
                  )}
                </div>
              </div>
              {config.selected && (
                <CheckCircle className="w-5 h-5 text-[#407B9D]" />
              )}
            </label>
          )
        })}
      </div>
    </div>
  )
}

// Content review step with tabs for each format
function ContentReviewStep({
  generatedContent,
  onContentChange,
  activeTab,
  onTabChange,
  isGenerating,
  onRegenerate,
}: {
  generatedContent: GeneratedFormatContent[]
  onContentChange: (content: GeneratedFormatContent) => void
  activeTab: string
  onTabChange: (tab: string) => void
  isGenerating: boolean
  onRegenerate: (formatId: string) => void
}) {
  const [variationIndex, setVariationIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')

  const activeContent = generatedContent.find(c => c.id === activeTab)

  useEffect(() => {
    if (activeContent) {
      setEditContent(activeContent.content)
      setVariationIndex(0)
    }
  }, [activeTab, activeContent])

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
          Generating Content...
        </p>
        <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
          AI is transforming your content into new formats.
        </p>
      </div>
    )
  }

  if (generatedContent.length === 0) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No content generated yet.</p>
      </div>
    )
  }

  const handleSave = () => {
    if (activeContent) {
      onContentChange({
        ...activeContent,
        content: editContent,
        approvalStatus: 'approved',
      })
    }
    setIsEditing(false)
  }

  return (
    <div className="space-y-4">
      {/* Format tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b">
        {generatedContent.map((content) => (
          <button
            key={content.id}
            onClick={() => onTabChange(content.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === content.id
                ? 'bg-white border border-b-white -mb-px text-[#407B9D]'
                : 'text-muted-foreground hover:text-[#463939]'
            }`}
          >
            <FormatIcon format={content.format} className="w-4 h-4" />
            {contentTypeLabels[content.format]}
            {content.approvalStatus === 'approved' && (
              <CheckCircle className="w-4 h-4 text-green-600" />
            )}
          </button>
        ))}
      </div>

      {/* Active content */}
      {activeContent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={contentTypeColors[activeContent.format]}>
              {contentTypeLabels[activeContent.format]}
            </Badge>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRegenerate(activeContent.id)}
                className="text-[#407B9D] border-[#407B9D]"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Regenerate
              </Button>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Variations carousel for LinkedIn */}
          {activeContent.variations && activeContent.variations.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Variation {variationIndex + 1} of {activeContent.variations.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVariationIndex(Math.max(0, variationIndex - 1))}
                    disabled={variationIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVariationIndex(Math.min(activeContent.variations!.length - 1, variationIndex + 1))}
                    disabled={variationIndex === activeContent.variations.length - 1}
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-slate-50 whitespace-pre-wrap text-sm">
                {activeContent.variations[variationIndex]}
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              {isEditing ? (
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[200px] border-0 rounded-none"
                />
              ) : (
                <div className="p-4 whitespace-pre-wrap text-sm">
                  {activeContent.content}
                </div>
              )}
            </div>
          )}

          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-[#407B9D] hover:bg-[#407B9D]/90">
                Save Changes
              </Button>
            </div>
          )}

          {/* YouTube Chapters */}
          {activeContent.chapters && activeContent.chapters.length > 0 && (
            <div className="border rounded-lg p-4">
              <h5 className="text-sm font-medium text-[#463939] mb-3">Chapters</h5>
              <div className="space-y-2">
                {activeContent.chapters.map((chapter) => (
                  <div key={chapter.id} className="flex items-start gap-3 text-sm">
                    <Badge className="bg-slate-100 text-slate-700 font-mono">
                      {chapter.timestamp}
                    </Badge>
                    <div>
                      <p className="font-medium text-[#463939]">{chapter.title}</p>
                      {chapter.description && (
                        <p className="text-xs text-muted-foreground">{chapter.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs for Blog/Case Study */}
          {activeContent.faqs && activeContent.faqs.length > 0 && (
            <div className="border rounded-lg p-4">
              <h5 className="text-sm font-medium text-[#463939] mb-3">FAQs</h5>
              <div className="space-y-3">
                {activeContent.faqs.map((faq) => (
                  <div key={faq.id} className="text-sm">
                    <p className="font-medium text-[#463939]">{faq.question}</p>
                    <p className="text-muted-foreground mt-1">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approve button */}
          {activeContent.approvalStatus !== 'approved' && (
            <Button
              onClick={() => onContentChange({ ...activeContent, approvalStatus: 'approved' })}
              className="w-full bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve {contentTypeLabels[activeContent.format]}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Publish step
function PublishStep({
  generatedContent,
  onPublish,
}: {
  generatedContent: GeneratedFormatContent[]
  onPublish: () => void
}) {
  const approvedContent = generatedContent.filter(c => c.approvalStatus === 'approved')
  const allApproved = approvedContent.length === generatedContent.length

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-[#C8E4BB]/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-[#407B9D]" />
        </div>
        <h3 className="text-lg font-medium text-[#463939] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Ready to Publish
        </h3>
        <p className="text-muted-foreground text-sm">
          {approvedContent.length} of {generatedContent.length} formats approved
        </p>
      </div>

      <div className="space-y-3">
        {generatedContent.map((content) => (
          <div
            key={content.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              content.approvalStatus === 'approved'
                ? 'bg-green-50 border-green-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <FormatIcon format={content.format} className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[#463939] text-sm">
                {contentTypeLabels[content.format]}
              </p>
              <p className="text-xs text-muted-foreground">
                {content.variations ? `${content.variations.length} variations` : 'Ready'}
              </p>
            </div>
            {content.approvalStatus === 'approved' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
            )}
          </div>
        ))}
      </div>

      <Button
        onClick={onPublish}
        disabled={!allApproved}
        className="w-full bg-[#407B9D] hover:bg-[#407B9D]/90"
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Publish to Library
      </Button>

      {!allApproved && (
        <p className="text-xs text-center text-muted-foreground">
          Please approve all formats before publishing
        </p>
      )}
    </div>
  )
}

export function RepurposeModal({
  open,
  onOpenChange,
  items,
  libraryContent = [],
  readyToRepurpose = [],
  onRepurpose,
  onPublishToLibrary,
  initialView = 'list',
}: RepurposeModalProps) {
  // View state
  const [view, setView] = useState<'list' | 'workflow'>(initialView)

  // Workflow state
  const [currentStep, setCurrentStep] = useState<RepurposeStep>('source_selection')
  const [sourceType, setSourceType] = useState<RepurposeSourceType>('ready_content')
  const [selectedSource, setSelectedSource] = useState<ContentItem | FinalDraft | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [externalContent, setExternalContent] = useState('')

  // Format selection
  const [targetFormats, setTargetFormats] = useState<TargetFormatConfig[]>(
    repurposeTargetFormats.map((format, index) => ({
      id: `format-${index}`,
      format,
      selected: false,
      variationCount: formatFeatures[format].defaultVariationCount,
      includesFaqs: formatFeatures[format].supportsFaqs,
      includesLinks: formatFeatures[format].supportsLinks,
      includesChapters: formatFeatures[format].supportsChapters,
    }))
  )

  // Generated content
  const [generatedContent, setGeneratedContent] = useState<GeneratedFormatContent[]>([])
  const [activeTab, setActiveTab] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Step completion tracking
  const [sourceSelected, setSourceSelected] = useState(false)
  const [formatsSelected, setFormatsSelected] = useState(false)
  const [contentApproved, setContentApproved] = useState(false)

  // Track created outputs per source item (localStorage in real app)
  const [createdOutputsMap, setCreatedOutputsMap] = useState<Record<string, RepurposedOutput[]>>(() => {
    // Initialize with test data based on repurposedCount from items
    const initialMap: Record<string, RepurposedOutput[]> = {}
    items.forEach(item => {
      if (item.repurposedCount > 0) {
        // Create mock outputs based on repurposedCount
        const outputs: RepurposedOutput[] = []
        const availableFormats = ['linkedin', 'youtube', 'blog', 'case_study'] as ContentType[]
        for (let i = 0; i < item.repurposedCount && i < availableFormats.length; i++) {
          outputs.push({
            id: `output-${item.id}-${i}`,
            format: availableFormats[i],
            title: `${item.sourceTitle} - ${contentTypeLabels[availableFormats[i]]}`,
            createdAt: item.lastRepurposed || new Date().toISOString(),
          })
        }
        initialMap[item.id] = outputs
      }
    })
    return initialMap
  })

  // Handle initial view mode when modal opens
  useEffect(() => {
    if (open) {
      setView(initialView)
    } else {
      // Reset to list view when modal closes
      setView('list')
      resetWorkflow()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialView])

  // Reset workflow
  const resetWorkflow = () => {
    setCurrentStep('source_selection')
    setSourceType('ready_content')
    setSelectedSource(null)
    setSearchQuery('')
    setExternalUrl('')
    setExternalContent('')
    setTargetFormats(
      repurposeTargetFormats.map((format, index) => ({
        id: `format-${index}`,
        format,
        selected: false,
        variationCount: formatFeatures[format].defaultVariationCount,
        includesFaqs: formatFeatures[format].supportsFaqs,
        includesLinks: formatFeatures[format].supportsLinks,
        includesChapters: formatFeatures[format].supportsChapters,
      }))
    )
    setGeneratedContent([])
    setActiveTab('')
    setSourceSelected(false)
    setFormatsSelected(false)
    setContentApproved(false)
  }

  // Handle source selection
  const handleSelectSource = (source: ContentItem | FinalDraft) => {
    setSelectedSource(source)
    setSourceSelected(true)
  }

  // Handle format toggle
  const handleToggleFormat = (formatId: string) => {
    setTargetFormats(formats =>
      formats.map(f => f.id === formatId ? { ...f, selected: !f.selected } : f)
    )
  }

  // Generate content for selected formats
  const handleGenerateContent = () => {
    setIsGenerating(true)
    const selectedFormats = targetFormats.filter(f => f.selected)

    setTimeout(() => {
      const generated: GeneratedFormatContent[] = selectedFormats.map((config, index) => {
        const baseContent: GeneratedFormatContent = {
          id: `content-${index}`,
          formatId: config.id,
          format: config.format,
          content: '',
          approvalStatus: 'pending',
        }

        // Generate format-specific content
        if (config.format === 'linkedin') {
          baseContent.variations = [
            `🚀 Just published a new piece on financial planning for growing businesses!\n\nKey takeaway: Cash flow management isn&apos;t just about tracking money - it&apos;s about strategic planning.\n\n3 things every founder should know:\n1. Forecast 13 weeks ahead\n2. Build a cash reserve buffer\n3. Know your burn rate by heart\n\nWhat&apos;s your biggest cash flow challenge? 👇\n\n#Finance #Startup #CFO`,
            `The #1 mistake I see founders make with their finances?\n\nWaiting too long to get professional help.\n\nBy the time most reach out, they&apos;ve already:\n- Missed tax deadlines\n- Lost track of expenses\n- Made costly accounting errors\n\nDon&apos;t wait until it&apos;s a crisis.\n\n#StartupFinance #GrowthTips`,
            `Hot take: Every startup over $1M ARR needs fractional CFO support.\n\nNot because you can&apos;t manage finances yourself.\n\nBut because your time is better spent on:\n• Product development\n• Customer relationships\n• Team building\n\nWhat do you think - agree or disagree?`,
            `Financial planning tip that changed everything for our clients:\n\nStop looking at monthly P&L.\nStart looking at weekly cash flow.\n\nMonthly is too slow for startups.\nWeekly keeps you agile.\n\nSimple shift, massive impact. 📈`,
            `"We&apos;ll figure out finances later."\n\nSaid every founder before their Series A due diligence.\n\nThen it&apos;s 3am organizing receipts.\n\nLesson: Finance is a feature, not a bug.\nBuild it into your startup from day one.`,
          ]
        } else if (config.format === 'youtube') {
          baseContent.content = `Welcome back to the channel! Today we&apos;re diving deep into financial planning strategies for growing businesses.\n\n[INTRO - 0:00]\nIf you&apos;re running a startup or scaling company, this video is for you. I&apos;m going to share the exact framework we use with our clients to manage cash flow and plan for growth.\n\n[MAIN CONTENT]\nLet&apos;s start with the fundamentals...`
          baseContent.chapters = [
            { id: 'ch-1', timestamp: '0:00', title: 'Introduction', description: 'Overview of what we will cover' },
            { id: 'ch-2', timestamp: '1:30', title: 'Cash Flow Basics', description: 'Understanding the fundamentals' },
            { id: 'ch-3', timestamp: '5:00', title: 'Forecasting Framework', description: '13-week cash flow model' },
            { id: 'ch-4', timestamp: '10:15', title: 'Common Mistakes', description: 'What to avoid' },
            { id: 'ch-5', timestamp: '15:00', title: 'Action Steps', description: 'What to do this week' },
          ]
        } else if (config.format === 'blog') {
          baseContent.content = `# The Complete Guide to Financial Planning for Growing Businesses\n\nAs your business scales, financial management becomes increasingly complex. This comprehensive guide will walk you through the essential strategies and frameworks you need to maintain financial health while growing.\n\n## Understanding Your Cash Flow\n\nCash flow is the lifeblood of any business. Without proper management, even profitable companies can fail...`
          baseContent.faqs = [
            { id: 'faq-1', question: 'When should I hire a fractional CFO?', answer: 'Most businesses benefit from fractional CFO support once they reach $1M-$2M in annual revenue or after raising a seed round.' },
            { id: 'faq-2', question: 'How often should I review my financials?', answer: 'We recommend weekly cash flow reviews and monthly P&L analysis for growing companies.' },
            { id: 'faq-3', question: 'What is the 13-week cash flow model?', answer: 'A rolling forecast that projects your cash position week by week for the next quarter, helping you anticipate and plan for cash needs.' },
          ]
          baseContent.internalLinks = [
            { id: 'link-1', title: 'Cash Flow Management Guide', url: '/blog/cash-flow-management', type: 'internal' },
            { id: 'link-2', title: 'Fractional CFO Services', url: '/services/fractional-cfo', type: 'internal' },
          ]
        } else if (config.format === 'case_study') {
          baseContent.content = `# How [Client Name] Achieved 40% Growth with Strategic Financial Planning\n\n## The Challenge\n[Client Name], a Series A SaaS company, was experiencing rapid growth but struggled with cash flow visibility and financial forecasting...\n\n## Our Approach\nWe implemented a comprehensive financial framework including...\n\n## The Results\n- 40% revenue growth in 12 months\n- Improved cash runway from 6 to 18 months\n- Successful Series B preparation`
          baseContent.faqs = [
            { id: 'faq-1', question: 'How long did the engagement last?', answer: 'The initial engagement was 6 months, with ongoing fractional CFO support continuing.' },
            { id: 'faq-2', question: 'What tools were implemented?', answer: 'We implemented a custom financial dashboard using their existing tech stack.' },
          ]
        }

        return baseContent
      })

      setGeneratedContent(generated)
      setActiveTab(generated[0]?.id || '')
      setFormatsSelected(true)
      setIsGenerating(false)
    }, 3000)
  }

  // Handle content change
  const handleContentChange = (content: GeneratedFormatContent) => {
    setGeneratedContent(prev =>
      prev.map(c => c.id === content.id ? content : c)
    )
    // Check if all content is approved
    const updatedContent = generatedContent.map(c => c.id === content.id ? content : c)
    setContentApproved(updatedContent.every(c => c.approvalStatus === 'approved'))

    // Auto-advance to next unapproved tab when approving content
    if (content.approvalStatus === 'approved') {
      const currentIndex = updatedContent.findIndex(c => c.id === content.id)
      // Find the next unapproved item after the current one
      const nextUnapproved = updatedContent.find((c, index) =>
        index > currentIndex && c.approvalStatus !== 'approved'
      )
      if (nextUnapproved) {
        setActiveTab(nextUnapproved.id)
      } else {
        // If no unapproved items after current, check for any unapproved items before
        const anyUnapproved = updatedContent.find(c => c.approvalStatus !== 'approved')
        if (anyUnapproved) {
          setActiveTab(anyUnapproved.id)
        }
        // If all approved, stay on current tab (user can proceed to publish)
      }
    }
  }

  // Handle regenerate
  const handleRegenerate = (formatId: string) => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
    }, 2000)
  }

  // Handle publish
  const handlePublish = () => {
    // Here you would publish to library
    setView('list')
    resetWorkflow()
  }

  // Navigate steps
  const handleNextStep = () => {
    const stepOrder: RepurposeStep[] = ['source_selection', 'format_selection', 'content_review', 'publish']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1]
      setCurrentStep(nextStep)

      // Generate content when entering review step
      if (nextStep === 'content_review' && generatedContent.length === 0) {
        handleGenerateContent()
      }
    }
  }

  const handlePrevStep = () => {
    const stepOrder: RepurposeStep[] = ['source_selection', 'format_selection', 'content_review', 'publish']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  // Get steps
  const getSteps = () => [
    { key: 'source_selection' as RepurposeStep, label: repurposeStepLabels.source_selection, completed: sourceSelected },
    { key: 'format_selection' as RepurposeStep, label: repurposeStepLabels.format_selection, completed: formatsSelected },
    { key: 'content_review' as RepurposeStep, label: repurposeStepLabels.content_review, completed: contentApproved },
    { key: 'publish' as RepurposeStep, label: repurposeStepLabels.publish, completed: false },
  ]

  // Get source format for filtering
  const getSourceFormat = (): ContentType | undefined => {
    if (!selectedSource) return undefined
    if ('targetFormat' in selectedSource) return selectedSource.targetFormat  // FinalDraft
    if ('type' in selectedSource) return selectedSource.type  // ContentItem
    return undefined
  }

  // Check if can proceed
  const canProceedFromSource = sourceType === 'external_input'
    ? (externalUrl.trim() !== '' || externalContent.trim() !== '')
    : selectedSource !== null

  const canProceedFromFormats = targetFormats.some(f => f.selected)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C8E4BB]/30 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-[#407B9D]" />
            </div>
            <div>
              <DialogTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Repurpose Factory
              </DialogTitle>
              <DialogDescription style={{ fontFamily: 'var(--font-body)' }}>
                {view === 'list'
                  ? 'Transform your existing content into new formats'
                  : 'Create new content from your source material'
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {view === 'list' ? (
          // List view - show existing content with expandable cards
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <SourceContentCard
                    key={item.id}
                    item={item}
                    createdOutputs={createdOutputsMap[item.id] || []}
                    onCreateNew={(itemId) => {
                      // Select the item and start workflow
                      const sourceItem = items.find(i => i.id === itemId)
                      if (sourceItem) {
                        setSelectedSource(sourceItem)
                        setSourceSelected(true)
                        setSourceType('library_search')
                        setView('workflow')
                        setCurrentStep('format_selection')
                      }
                    }}
                    onRepurpose={onRepurpose}
                  />
                ))}

                {items.length === 0 && (
                  <div className="text-center py-12">
                    <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                      No content ready for repurposing. Add content to your library first.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {items.length} piece{items.length !== 1 ? 's' : ''} of content available
              </p>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </>
        ) : (
          // Workflow view
          <>
            <RepurposeStepIndicator
              steps={getSteps()}
              currentStep={currentStep}
              onStepClick={(step) => {
                const steps = getSteps()
                const targetStep = steps.find(s => s.key === step)
                if (targetStep && (targetStep.completed || step === currentStep)) {
                  setCurrentStep(step)
                }
              }}
            />

            <div className="flex-1 overflow-y-auto py-4">
              {currentStep === 'source_selection' && (
                <SourceSelectionStep
                  readyToRepurpose={readyToRepurpose}
                  libraryContent={libraryContent}
                  onSelectSource={handleSelectSource}
                  selectedSource={selectedSource}
                  sourceType={sourceType}
                  onSourceTypeChange={setSourceType}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  externalUrl={externalUrl}
                  onExternalUrlChange={setExternalUrl}
                  externalContent={externalContent}
                  onExternalContentChange={setExternalContent}
                />
              )}

              {currentStep === 'format_selection' && (
                <FormatSelectionStep
                  targetFormats={targetFormats}
                  onToggleFormat={handleToggleFormat}
                  sourceFormat={getSourceFormat()}
                />
              )}

              {currentStep === 'content_review' && (
                <ContentReviewStep
                  generatedContent={generatedContent}
                  onContentChange={handleContentChange}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  isGenerating={isGenerating}
                  onRegenerate={handleRegenerate}
                />
              )}

              {currentStep === 'publish' && (
                <PublishStep
                  generatedContent={generatedContent}
                  onPublish={handlePublish}
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep === 'source_selection') {
                    setView('list')
                    resetWorkflow()
                  } else {
                    handlePrevStep()
                  }
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {currentStep === 'source_selection' ? 'Back to List' : 'Back'}
              </Button>

              <div className="flex gap-2">
                {currentStep === 'source_selection' && (
                  <Button
                    onClick={() => {
                      if (sourceType === 'external_input') {
                        setSourceSelected(true)
                      }
                      handleNextStep()
                    }}
                    className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                    disabled={!canProceedFromSource}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}

                {currentStep === 'format_selection' && (
                  <Button
                    onClick={handleNextStep}
                    className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                    disabled={!canProceedFromFormats}
                  >
                    Generate Content
                    <Sparkles className="w-4 h-4 ml-1" />
                  </Button>
                )}

                {currentStep === 'content_review' && (
                  <Button
                    onClick={handleNextStep}
                    className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                    disabled={!generatedContent.every(c => c.approvalStatus === 'approved')}
                  >
                    Review & Publish
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
