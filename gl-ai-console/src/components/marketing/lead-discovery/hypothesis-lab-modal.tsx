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
  Lightbulb,
  Target,
  CheckCircle,
  ArrowLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  Mail,
  Linkedin,
  Filter,
  Database,
  Upload,
  Sparkles,
  Edit3,
  X,
  FileSpreadsheet,
  Users,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import {
  LeadHypothesis,
  LeadHypothesisWorkflow,
  HypothesisStep,
  HypothesisEntryMode,
  LeadSourcePlatform,
  FilterCriteria,
  EnrichmentField,
  HypothesisEmailCopy,
  HypothesisLinkedInCopy,
  hypothesisStepLabels,
  leadSourcePlatformLabels,
  defaultEnrichmentFields,
} from "@/lib/lead-discovery-types"

interface HypothesisLabModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hypotheses: LeadHypothesis[]
  onApprove: (hypothesisId: string) => void
  onReject: (hypothesisId: string) => void
  onMoveToPending: (hypothesisId: string) => void
  onStartWorkflow?: (entryMode: HypothesisEntryMode) => void
  onSaveWorkflow?: (workflow: LeadHypothesisWorkflow) => void
  initialEntryMode?: HypothesisEntryMode | null // If provided, starts directly in workflow mode
}

// Step indicator component for hypothesis workflow
function HypothesisStepIndicator({
  steps,
  currentStep,
  onStepClick
}: {
  steps: { key: HypothesisStep; label: string; completed: boolean }[]
  currentStep: HypothesisStep
  onStepClick?: (step: HypothesisStep) => void
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

// Entry mode selector (General vs Specific)
function EntryModeSelector({
  selectedMode,
  onModeChange
}: {
  selectedMode: HypothesisEntryMode
  onModeChange: (mode: HypothesisEntryMode) => void
}) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onModeChange('general')}
        className={`flex-1 p-4 rounded-lg border-2 text-left transition-all ${
          selectedMode === 'general'
            ? 'border-[#407B9D] bg-[#407B9D]/5'
            : 'border-slate-200 hover:border-[#407B9D]/50'
        }`}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
          selectedMode === 'general' ? 'bg-[#407B9D] text-white' : 'bg-slate-100 text-slate-600'
        }`}>
          <Sparkles className="w-5 h-5" />
        </div>
        <h4
          className="font-medium text-[#463939] mb-1"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          General
        </h4>
        <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
          AI generates hypothesis ideas based on your ICP
        </p>
      </button>
      <button
        onClick={() => onModeChange('specific')}
        className={`flex-1 p-4 rounded-lg border-2 text-left transition-all ${
          selectedMode === 'specific'
            ? 'border-[#407B9D] bg-[#407B9D]/5'
            : 'border-slate-200 hover:border-[#407B9D]/50'
        }`}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
          selectedMode === 'specific' ? 'bg-[#407B9D] text-white' : 'bg-slate-100 text-slate-600'
        }`}>
          <Target className="w-5 h-5" />
        </div>
        <h4
          className="font-medium text-[#463939] mb-1"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Specific
        </h4>
        <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
          You provide the target audience details
        </p>
      </button>
    </div>
  )
}

// Lead source selector
function LeadSourceSelector({
  selected,
  onSelect
}: {
  selected: LeadSourcePlatform
  onSelect: (source: LeadSourcePlatform) => void
}) {
  const sources: { value: LeadSourcePlatform; icon: React.ReactNode; description: string }[] = [
    { value: 'clay', icon: <Database className="w-5 h-5" />, description: 'Build list in Clay' },
    { value: 'trigify', icon: <Users className="w-5 h-5" />, description: 'Track from Trigify' },
    { value: 'csv_upload', icon: <FileSpreadsheet className="w-5 h-5" />, description: 'Upload CSV file' },
    { value: 'other', icon: <MapPin className="w-5 h-5" />, description: 'Other lead source' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {sources.map((source) => (
        <button
          key={source.value}
          onClick={() => onSelect(source.value)}
          className={`p-3 rounded-lg border-2 text-left transition-all ${
            selected === source.value
              ? 'border-[#407B9D] bg-[#407B9D]/5'
              : 'border-slate-200 hover:border-[#407B9D]/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              selected === source.value ? 'bg-[#407B9D] text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {source.icon}
            </div>
            <div>
              <h4
                className="font-medium text-[#463939] text-sm"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {leadSourcePlatformLabels[source.value]}
              </h4>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                {source.description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

// Operator options for filter criteria
const operatorOptions: { value: FilterCriteria['operator']; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'in_range', label: 'In range' },
]

// Helper to get operator label for display
const getOperatorLabel = (operator: FilterCriteria['operator']): string => {
  const option = operatorOptions.find(op => op.value === operator)
  return option?.label.toLowerCase() || operator
}

// Filter criteria editor - simplified for add/remove only
function FilterCriteriaEditor({
  criteria,
  onCriteriaChange,
}: {
  criteria: FilterCriteria[]
  onCriteriaChange: (criteria: FilterCriteria[]) => void
}) {
  const handleValueChange = (id: string, value: string) => {
    onCriteriaChange(
      criteria.map(c => c.id === id ? { ...c, value } : c)
    )
  }

  const handleOperatorChange = (id: string, operator: FilterCriteria['operator']) => {
    onCriteriaChange(
      criteria.map(c => c.id === id ? { ...c, operator } : c)
    )
  }

  const handleDelete = (id: string) => {
    onCriteriaChange(criteria.filter(c => c.id !== id))
  }

  const handleAdd = () => {
    const newCriteria: FilterCriteria = {
      id: `filter-${Date.now()}`,
      field: '',
      operator: 'equals',
      value: '',
      enabled: true,
    }
    onCriteriaChange([...criteria, newCriteria])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[#463939]" style={{ fontFamily: 'var(--font-heading)' }}>
          Filtering Criteria
        </h4>
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="w-3 h-3 mr-1" />
          Add Filter
        </Button>
      </div>
      <div className="space-y-2">
        {criteria.filter(f => f.enabled).map((filter) => (
          <div
            key={filter.id}
            className="flex items-center gap-2 p-3 rounded-lg border bg-white border-slate-200"
          >
            <Input
              value={filter.field}
              onChange={(e) => onCriteriaChange(
                criteria.map(c => c.id === filter.id ? { ...c, field: e.target.value } : c)
              )}
              placeholder="Field name..."
              className="w-32 text-sm"
            />
            <select
              value={filter.operator}
              onChange={(e) => handleOperatorChange(filter.id, e.target.value as FilterCriteria['operator'])}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#407B9D] focus:ring-offset-1"
            >
              {operatorOptions.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
            <Input
              value={filter.value}
              onChange={(e) => handleValueChange(filter.id, e.target.value)}
              placeholder="Value..."
              className="flex-1 text-sm"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(filter.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {criteria.filter(f => f.enabled).length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No filters added yet. Click &quot;Add Filter&quot; to start.
          </div>
        )}
      </div>
    </div>
  )
}

// Enrichment fields editor - simplified for add/remove only
function EnrichmentFieldsEditor({
  fields,
  onFieldsChange,
}: {
  fields: EnrichmentField[]
  onFieldsChange: (fields: EnrichmentField[]) => void
}) {
  const [showAddField, setShowAddField] = useState(false)
  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldDescription, setNewFieldDescription] = useState('')

  const handleDelete = (id: string) => {
    onFieldsChange(fields.filter(f => f.id !== id))
  }

  const handleAddField = () => {
    if (newFieldName.trim()) {
      const newField: EnrichmentField = {
        id: `field-${Date.now()}`,
        field: newFieldName.trim(),
        description: newFieldDescription.trim() || undefined,
        enabled: true,
      }
      onFieldsChange([...fields, newField])
      setNewFieldName('')
      setNewFieldDescription('')
      setShowAddField(false)
    }
  }

  const handleCancelAdd = () => {
    setShowAddField(false)
    setNewFieldName('')
    setNewFieldDescription('')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[#463939]" style={{ fontFamily: 'var(--font-heading)' }}>
          Enrichment Fields
        </h4>
        <Button variant="outline" size="sm" onClick={() => setShowAddField(true)}>
          <Plus className="w-3 h-3 mr-1" />
          Add Field
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Data points to enrich in Clay before outreach
      </p>

      {showAddField && (
        <div className="p-3 rounded-lg border border-[#407B9D] bg-[#407B9D]/5 space-y-2">
          <Input
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            placeholder="Field name (e.g., Company Revenue)"
            className="text-sm"
            autoFocus
          />
          <Input
            value={newFieldDescription}
            onChange={(e) => setNewFieldDescription(e.target.value)}
            placeholder="Description (optional)"
            className="text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddField()
              if (e.key === 'Escape') handleCancelAdd()
            }}
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={handleCancelAdd}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddField} className="bg-[#407B9D] hover:bg-[#407B9D]/90">
              Add
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {fields.filter(f => f.enabled).map((field) => (
          <div
            key={field.id}
            className="flex items-center gap-3 p-3 rounded-lg border bg-white border-slate-200"
          >
            <div className="flex-1">
              <p className="font-medium text-sm text-[#463939]">{field.field}</p>
              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(field.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {fields.filter(f => f.enabled).length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No enrichment fields added yet. Click &quot;Add Field&quot; to start.
          </div>
        )}
      </div>
    </div>
  )
}

// Email copy editor
function EmailCopyEditor({
  emailCopy,
  onEmailCopyChange,
  onRegenerate,
  isGenerating,
}: {
  emailCopy: HypothesisEmailCopy | null
  onEmailCopyChange: (copy: HypothesisEmailCopy) => void
  onRegenerate: () => void
  isGenerating: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editSubject, setEditSubject] = useState(emailCopy?.subject || '')
  const [editBody, setEditBody] = useState(emailCopy?.body || '')

  useEffect(() => {
    if (emailCopy) {
      setEditSubject(emailCopy.subject)
      setEditBody(emailCopy.body)
    }
  }, [emailCopy])

  const handleSave = () => {
    if (emailCopy) {
      onEmailCopyChange({
        ...emailCopy,
        subject: editSubject,
        body: editBody,
        approvalStatus: 'edited',
      })
    }
    setIsEditing(false)
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
          Generating Email Copy...
        </p>
        <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
          AI is crafting personalized email copy for your campaign.
        </p>
      </div>
    )
  }

  if (!emailCopy) {
    return (
      <div className="text-center py-12">
        <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No email copy generated yet.</p>
        <Button onClick={onRegenerate} className="mt-4 bg-[#407B9D] hover:bg-[#407B9D]/90">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Email Copy
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#407B9D]" />
          <h4 className="text-sm font-medium text-[#463939]" style={{ fontFamily: 'var(--font-heading)' }}>
            Email Copy for Instantly
          </h4>
        </div>
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

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-4 py-2 border-b">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Subject Line</p>
        </div>
        {isEditing ? (
          <Input
            value={editSubject}
            onChange={(e) => setEditSubject(e.target.value)}
            className="border-0 border-b rounded-none focus:ring-0"
            placeholder="Email subject..."
          />
        ) : (
          <p className="px-4 py-3 font-medium text-[#463939]">{emailCopy.subject}</p>
        )}

        <div className="bg-slate-50 px-4 py-2 border-b">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Email Body</p>
        </div>
        {isEditing ? (
          <Textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            className="border-0 rounded-none min-h-[200px] focus:ring-0"
            placeholder="Email body..."
          />
        ) : (
          <div className="px-4 py-3 whitespace-pre-wrap text-sm text-[#463939]">
            {emailCopy.body}
          </div>
        )}
      </div>

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

      {emailCopy.approvalStatus === 'edited' && (
        <Badge className="bg-amber-100 text-amber-800">
          <Edit3 className="w-3 h-3 mr-1" />
          Edited
        </Badge>
      )}
    </div>
  )
}

// LinkedIn copy editor
function LinkedInCopyEditor({
  linkedInCopy,
  onLinkedInCopyChange,
  onRegenerate,
  isGenerating,
}: {
  linkedInCopy: HypothesisLinkedInCopy | null
  onLinkedInCopyChange: (copy: HypothesisLinkedInCopy) => void
  onRegenerate: () => void
  isGenerating: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editMessage, setEditMessage] = useState(linkedInCopy?.message || '')

  useEffect(() => {
    if (linkedInCopy) {
      setEditMessage(linkedInCopy.message)
    }
  }, [linkedInCopy])

  const handleSave = () => {
    if (linkedInCopy) {
      onLinkedInCopyChange({
        ...linkedInCopy,
        message: editMessage,
        approvalStatus: 'edited',
      })
    }
    setIsEditing(false)
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
          Generating LinkedIn Copy...
        </p>
        <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
          AI is crafting a personalized LinkedIn message.
        </p>
      </div>
    )
  }

  if (!linkedInCopy) {
    return (
      <div className="text-center py-12">
        <Linkedin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No LinkedIn copy generated yet.</p>
        <Button onClick={onRegenerate} className="mt-4 bg-[#407B9D] hover:bg-[#407B9D]/90">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate LinkedIn Copy
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Linkedin className="w-5 h-5 text-[#0A66C2]" />
          <h4 className="text-sm font-medium text-[#463939]" style={{ fontFamily: 'var(--font-heading)' }}>
            LinkedIn Message for Heyreach
          </h4>
        </div>
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

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-4 py-2 border-b">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">LinkedIn Message</p>
        </div>
        {isEditing ? (
          <Textarea
            value={editMessage}
            onChange={(e) => setEditMessage(e.target.value)}
            className="border-0 rounded-none min-h-[150px] focus:ring-0"
            placeholder="LinkedIn message..."
          />
        ) : (
          <div className="px-4 py-3 whitespace-pre-wrap text-sm text-[#463939]">
            {linkedInCopy.message}
          </div>
        )}
      </div>

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

      {linkedInCopy.approvalStatus === 'edited' && (
        <Badge className="bg-amber-100 text-amber-800">
          <Edit3 className="w-3 h-3 mr-1" />
          Edited
        </Badge>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Keep LinkedIn messages short and personal. The AI generates copy that you can use directly in Heyreach campaigns.
        </p>
      </div>
    </div>
  )
}

// Workflow status type for card
type WorkflowCardStatus = 'approved' | 'completed'

// Workflow card for list view (handles both approved and completed states)
function WorkflowCard({
  workflow,
  onMarkAsCompleted,
  onMoveBackToApproved,
}: {
  workflow: {
    id: string
    targetDescription: string
    leadSource: LeadSourcePlatform
    filterCriteria: FilterCriteria[]
    enrichmentFields: EnrichmentField[]
    emailCopy: HypothesisEmailCopy | null
    linkedInCopy: HypothesisLinkedInCopy | null
    status: WorkflowCardStatus
    approvedAt: string
    completedAt?: string
  }
  onMarkAsCompleted?: (id: string) => void
  onMoveBackToApproved?: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedLinkedIn, setCopiedLinkedIn] = useState(false)

  const handleCopyEmail = () => {
    if (workflow.emailCopy) {
      const text = `Subject: ${workflow.emailCopy.subject}\n\n${workflow.emailCopy.body}`
      navigator.clipboard.writeText(text)
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    }
  }

  const handleCopyLinkedIn = () => {
    if (workflow.linkedInCopy) {
      navigator.clipboard.writeText(workflow.linkedInCopy.message)
      setCopiedLinkedIn(true)
      setTimeout(() => setCopiedLinkedIn(false), 2000)
    }
  }

  const isApproved = workflow.status === 'approved'
  const isCompleted = workflow.status === 'completed'

  return (
    <div className={`border rounded-lg bg-white overflow-hidden ${isApproved ? 'border-[#407B9D]/30' : ''}`}>
      {/* Header - always visible */}
      <div
        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isApproved ? (
                <Badge className="bg-[#407B9D] text-white">
                  <Target className="w-3 h-3 mr-1" />
                  Ready to Action
                </Badge>
              ) : (
                <Badge className="bg-[#C8E4BB] text-[#463939]">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
              <Badge className="bg-slate-100 text-slate-700">
                {leadSourcePlatformLabels[workflow.leadSource]}
              </Badge>
            </div>
            <p
              className="text-sm text-[#463939] line-clamp-2"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {workflow.targetDescription}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {isCompleted && workflow.completedAt
                ? `Completed ${new Date(workflow.completedAt).toLocaleDateString()}`
                : `Approved ${new Date(workflow.approvedAt).toLocaleDateString()}`
              }
            </p>
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
          {/* Status action button */}
          {isApproved ? (
            <div className="bg-[#407B9D]/5 border border-[#407B9D]/20 rounded-lg p-3">
              <p className="text-sm text-[#463939] mb-3">
                Once you&apos;ve created the Instantly and Heyreach campaigns, mark this as completed.
              </p>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkAsCompleted?.(workflow.id)
                }}
                className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Completed
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onMoveBackToApproved?.(workflow.id)
              }}
              className="text-[#407B9D] border-[#407B9D]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Move Back to Approved
            </Button>
          )}

          {/* Quick copy buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                handleCopyEmail()
              }}
              disabled={!workflow.emailCopy}
              className="flex-1"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Copy Email
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                handleCopyLinkedIn()
              }}
              disabled={!workflow.linkedInCopy}
              className="flex-1"
            >
              {copiedLinkedIn ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Linkedin className="w-4 h-4 mr-2" />
                  Copy LinkedIn
                </>
              )}
            </Button>
          </div>

          {/* Filter criteria summary */}
          {workflow.filterCriteria.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Filter Criteria
              </p>
              <div className="flex flex-wrap gap-2">
                {workflow.filterCriteria.map((filter) => (
                  <Badge key={filter.id} className="bg-[#407B9D]/10 text-[#407B9D] text-xs">
                    {filter.field} {getOperatorLabel(filter.operator)} {filter.value}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Enrichment fields summary */}
          {workflow.enrichmentFields.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Enrichment Fields
              </p>
              <div className="flex flex-wrap gap-2">
                {workflow.enrichmentFields.map((field) => (
                  <Badge key={field.id} className="bg-[#C8E4BB]/50 text-[#463939] text-xs">
                    {field.field}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Email preview */}
          {workflow.emailCopy && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Email Copy (Instantly)
              </p>
              <div className="bg-white border rounded-lg p-3">
                <p className="text-sm font-medium text-[#463939] mb-1">
                  {workflow.emailCopy.subject}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                  {workflow.emailCopy.body}
                </p>
              </div>
            </div>
          )}

          {/* LinkedIn preview */}
          {workflow.linkedInCopy && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                LinkedIn Message (Heyreach)
              </p>
              <div className="bg-white border rounded-lg p-3">
                <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                  {workflow.linkedInCopy.message}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function HypothesisLabModal({
  open,
  onOpenChange,
  hypotheses,
  onApprove,
  onReject,
  onMoveToPending,
  onStartWorkflow,
  onSaveWorkflow,
  initialEntryMode,
}: HypothesisLabModalProps) {
  // View state: 'list' or 'workflow'
  const [view, setView] = useState<'list' | 'workflow'>('list')

  // Workflow state
  const [entryMode, setEntryMode] = useState<HypothesisEntryMode>('general')
  const [currentStep, setCurrentStep] = useState<HypothesisStep>('who_where')
  const [targetDescription, setTargetDescription] = useState('')
  const [leadSource, setLeadSource] = useState<LeadSourcePlatform>('clay')
  const [leadSourceDetails, setLeadSourceDetails] = useState('')
  const [whoWhereApproved, setWhoWhereApproved] = useState(false)

  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria[]>([
    { id: 'filter-1', field: 'Industry', operator: 'equals', value: '', enabled: true },
    { id: 'filter-2', field: '$ Raised', operator: 'greater_than', value: '', enabled: true },
    { id: 'filter-3', field: 'Year Raised', operator: 'equals', value: '', enabled: true },
  ])
  const [enrichmentFields, setEnrichmentFields] = useState<EnrichmentField[]>(
    defaultEnrichmentFields.map(f => ({ ...f, enabled: false }))
  )
  const [howWhatApproved, setHowWhatApproved] = useState(false)

  const [emailCopy, setEmailCopy] = useState<HypothesisEmailCopy | null>(null)
  const [emailCopyApproved, setEmailCopyApproved] = useState(false)
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false)

  const [linkedInCopy, setLinkedInCopy] = useState<HypothesisLinkedInCopy | null>(null)
  const [linkedInCopyApproved, setLinkedInCopyApproved] = useState(false)
  const [isGeneratingLinkedIn, setIsGeneratingLinkedIn] = useState(false)

  // Loading state for AI generation
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false)
  const [isGeneratingHowWhat, setIsGeneratingHowWhat] = useState(false)
  const [howWhatGenerated, setHowWhatGenerated] = useState(false)
  const [isEditingHowWhat, setIsEditingHowWhat] = useState(false)

  // Workflow status type
  type WorkflowStatus = 'approved' | 'completed'

  // Workflows stored locally (both approved and completed)
  const [workflows, setWorkflows] = useState<{
    id: string
    targetDescription: string
    leadSource: LeadSourcePlatform
    filterCriteria: FilterCriteria[]
    enrichmentFields: EnrichmentField[]
    emailCopy: HypothesisEmailCopy | null
    linkedInCopy: HypothesisLinkedInCopy | null
    status: WorkflowStatus
    approvedAt: string
    completedAt?: string
  }[]>([])

  // Handle initial entry mode when modal opens
  useEffect(() => {
    if (open && initialEntryMode) {
      handleStartWorkflow(initialEntryMode)
    } else if (!open) {
      // Reset view when modal closes
      setView('list')
      resetWorkflow()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialEntryMode])

  // Reset workflow state
  const resetWorkflow = () => {
    setCurrentStep('who_where')
    setTargetDescription('')
    setLeadSource('clay')
    setLeadSourceDetails('')
    setWhoWhereApproved(false)
    setFilterCriteria([
      { id: 'filter-1', field: 'Industry', operator: 'equals', value: '', enabled: true },
      { id: 'filter-2', field: '$ Raised', operator: 'greater_than', value: '', enabled: true },
      { id: 'filter-3', field: 'Year Raised', operator: 'equals', value: '', enabled: true },
    ])
    setEnrichmentFields(defaultEnrichmentFields.map(f => ({ ...f, enabled: false })))
    setHowWhatApproved(false)
    setHowWhatGenerated(false)
    setIsEditingHowWhat(false)
    setEmailCopy(null)
    setEmailCopyApproved(false)
    setLinkedInCopy(null)
    setLinkedInCopyApproved(false)
  }

  // Start new workflow
  const handleStartWorkflow = (mode: HypothesisEntryMode) => {
    setEntryMode(mode)
    resetWorkflow()
    setView('workflow')
    onStartWorkflow?.(mode)

    // If general mode, simulate AI generating an idea
    if (mode === 'general') {
      setIsGeneratingIdea(true)
      setTimeout(() => {
        setTargetDescription('Companies that recently raised Series A funding in the CPG industry, looking for fractional CFO services to scale their financial operations.')
        setIsGeneratingIdea(false)
      }, 2000)
    }
  }

  // Regenerate Who & Where idea (for general mode)
  const handleRegenerateIdea = () => {
    setIsGeneratingIdea(true)
    setTargetDescription('')
    setTimeout(() => {
      // Simulate different AI-generated ideas
      const ideas = [
        'SaaS companies in the healthcare space that recently raised Seed funding, looking for financial advisory services.',
        'E-commerce brands with $5M+ revenue looking to optimize their supply chain financing.',
        'Fintech startups that raised Series B in the last 6 months, needing fractional CFO support for their next funding round.',
        'Manufacturing companies transitioning to D2C models, seeking financial planning expertise.',
      ]
      const randomIdea = ideas[Math.floor(Math.random() * ideas.length)]
      setTargetDescription(randomIdea)
      setIsGeneratingIdea(false)
    }, 2000)
  }

  // Generate How & What (filtering criteria and enrichment suggestions)
  const handleGenerateHowWhat = () => {
    setIsGeneratingHowWhat(true)
    setHowWhatGenerated(false)
    setIsEditingHowWhat(false)

    setTimeout(() => {
      // AI generates filter criteria based on the target description
      setFilterCriteria([
        { id: 'filter-1', field: 'Industry', operator: 'equals', value: 'CPG / Consumer Goods', enabled: true },
        { id: 'filter-2', field: '$ Raised', operator: 'equals', value: '$1M - $10M', enabled: true },
        { id: 'filter-3', field: 'Year Raised', operator: 'equals', value: '2024 or later', enabled: true },
        { id: 'filter-4', field: 'Company Size', operator: 'equals', value: '10-50 employees', enabled: true },
      ])

      // AI suggests which fields need enrichment
      setEnrichmentFields([
        { id: 'ceo_name', field: 'CEO Name', description: 'Name of the CEO or founder', enabled: true },
        { id: 'email', field: 'Email', description: 'Business email address', enabled: true },
        { id: 'linkedin', field: 'LinkedIn URL', description: 'Personal LinkedIn profile', enabled: true },
        { id: 'year_raised', field: 'Year Raised', description: 'Year of last funding round', enabled: true },
        { id: 'phone', field: 'Phone Number', description: 'Direct phone number', enabled: false },
        { id: 'company_linkedin', field: 'Company LinkedIn', description: 'Company LinkedIn page', enabled: false },
      ])

      setIsGeneratingHowWhat(false)
      setHowWhatGenerated(true)
    }, 2500)
  }

  // Generate email copy
  const handleGenerateEmail = () => {
    setIsGeneratingEmail(true)
    setTimeout(() => {
      setEmailCopy({
        id: `email-${Date.now()}`,
        subject: 'Quick question about {{company_name}}\'s financial scaling',
        body: `Hi {{first_name}},

Congrats on the recent Series A raise! That's an exciting milestone for {{company_name}}.

As you scale, I've noticed many CPG founders hit a wall when it comes to financial infrastructure - especially around forecasting and cash flow management.

We help growing CPG brands like yours get fractional CFO support without the full-time cost. Would love to share how we've helped similar companies.

Open to a quick 15-min call this week?

Best,
{{sender_name}}`,
        approvalStatus: 'pending',
      })
      setIsGeneratingEmail(false)
    }, 2500)
  }

  // Generate LinkedIn copy
  const handleGenerateLinkedIn = () => {
    setIsGeneratingLinkedIn(true)
    setTimeout(() => {
      setLinkedInCopy({
        id: `linkedin-${Date.now()}`,
        message: `Hi {{first_name}}, saw the news about {{company_name}}'s Series A - congrats! 🎉

As you scale, financial planning can get tricky. We help CPG founders like you get strategic CFO support without the full-time commitment.

Would love to connect and share some insights if helpful!`,
        approvalStatus: 'pending',
      })
      setIsGeneratingLinkedIn(false)
    }, 2000)
  }

  // Navigate steps
  const handleNextStep = () => {
    const stepOrder: HypothesisStep[] = ['who_where', 'how_what', 'email_copy', 'linkedin_copy']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1]
      setCurrentStep(nextStep)

      // Auto-generate content when entering each step
      if (nextStep === 'how_what' && !howWhatGenerated) {
        handleGenerateHowWhat()
      } else if (nextStep === 'email_copy' && !emailCopy) {
        handleGenerateEmail()
      } else if (nextStep === 'linkedin_copy' && !linkedInCopy) {
        handleGenerateLinkedIn()
      }
    }
  }

  const handlePrevStep = () => {
    const stepOrder: HypothesisStep[] = ['who_where', 'how_what', 'email_copy', 'linkedin_copy']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  // Finish workflow - adds to approved list
  const handleFinish = () => {
    // Save the workflow as approved (ready to action)
    const newWorkflow = {
      id: `workflow-${Date.now()}`,
      targetDescription,
      leadSource,
      filterCriteria: filterCriteria.filter(f => f.enabled),
      enrichmentFields: enrichmentFields.filter(f => f.enabled),
      emailCopy,
      linkedInCopy,
      status: 'approved' as WorkflowStatus,
      approvedAt: new Date().toISOString(),
    }
    setWorkflows(prev => [newWorkflow, ...prev])
    setView('list')
    resetWorkflow()
  }

  // Mark workflow as completed (user finished manual campaign creation)
  const handleMarkAsCompleted = (workflowId: string) => {
    setWorkflows(prev => prev.map(w =>
      w.id === workflowId
        ? { ...w, status: 'completed' as WorkflowStatus, completedAt: new Date().toISOString() }
        : w
    ))
  }

  // Move workflow back to approved (undo completion)
  const handleMoveBackToApproved = (workflowId: string) => {
    setWorkflows(prev => prev.map(w =>
      w.id === workflowId
        ? { ...w, status: 'approved' as WorkflowStatus, completedAt: undefined }
        : w
    ))
  }

  // Get step completion status
  const getSteps = () => [
    { key: 'who_where' as HypothesisStep, label: hypothesisStepLabels.who_where, completed: whoWhereApproved },
    { key: 'how_what' as HypothesisStep, label: hypothesisStepLabels.how_what, completed: howWhatApproved },
    { key: 'email_copy' as HypothesisStep, label: hypothesisStepLabels.email_copy, completed: emailCopyApproved },
    { key: 'linkedin_copy' as HypothesisStep, label: hypothesisStepLabels.linkedin_copy, completed: linkedInCopyApproved },
  ]

  // Render workflow content based on current step
  const renderWorkflowStep = () => {
    switch (currentStep) {
      case 'who_where':
        return (
          <div className="space-y-6">
            <EntryModeSelector selectedMode={entryMode} onModeChange={setEntryMode} />

            {isGeneratingIdea ? (
              <div className="text-center py-12">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-[#407B9D]/20 animate-ping" />
                  <div className="relative w-16 h-16 rounded-full bg-[#407B9D]/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#407B9D] animate-spin" />
                  </div>
                </div>
                <p className="text-lg font-medium text-[#463939] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  Generating Hypothesis...
                </p>
                <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  AI is analyzing your ICP to suggest a lead hypothesis.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-[#463939]">
                      Who are we targeting?
                    </label>
                    {entryMode === 'general' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRegenerateIdea}
                        className="text-[#407B9D] border-[#407B9D]"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Regenerate
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={targetDescription}
                    onChange={(e) => setTargetDescription(e.target.value)}
                    placeholder={entryMode === 'general'
                      ? "AI will generate a target audience description..."
                      : "Describe your target audience in detail (e.g., 'Companies that recently raised Series A in fintech, looking for CFO services')"
                    }
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#463939] mb-3">
                    Where are we finding them?
                  </label>
                  <LeadSourceSelector selected={leadSource} onSelect={setLeadSource} />

                  {leadSource === 'csv_upload' && (
                    <div className="mt-3 p-4 border-2 border-dashed rounded-lg text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Drop your CSV file here or click to upload
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Choose File
                      </Button>
                    </div>
                  )}

                  {leadSource === 'other' && (
                    <Input
                      value={leadSourceDetails}
                      onChange={(e) => setLeadSourceDetails(e.target.value)}
                      placeholder="Describe the lead source..."
                      className="mt-3"
                    />
                  )}
                </div>
              </>
            )}
          </div>
        )

      case 'how_what':
        // Loading state while AI generates suggestions
        if (isGeneratingHowWhat) {
          return (
            <div className="text-center py-12">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-[#407B9D]/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-[#407B9D]/10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#407B9D] animate-spin" />
                </div>
              </div>
              <p className="text-lg font-medium text-[#463939] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Analyzing Target Criteria...
              </p>
              <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                AI is determining how to filter your leads and what data to enrich.
              </p>
            </div>
          )
        }

        // Edit mode - show full editors
        if (isEditingHowWhat) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-[#463939]" style={{ fontFamily: 'var(--font-heading)' }}>
                  Edit Criteria & Enrichment
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingHowWhat(false)}
                >
                  Done Editing
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FilterCriteriaEditor
                  criteria={filterCriteria}
                  onCriteriaChange={setFilterCriteria}
                />
                <EnrichmentFieldsEditor
                  fields={enrichmentFields}
                  onFieldsChange={setEnrichmentFields}
                />
              </div>
            </div>
          )
        }

        // Summary view - show AI-generated suggestions
        return (
          <div className="space-y-6">
            {/* Header with regenerate */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#407B9D]" />
                <h3 className="font-medium text-[#463939]" style={{ fontFamily: 'var(--font-heading)' }}>
                  AI Recommendations
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateHowWhat}
                className="text-[#407B9D] border-[#407B9D]"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Regenerate
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Filtering Criteria Summary */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#407B9D]" />
                  <h4 className="font-medium text-sm text-[#463939]">How to Filter</h4>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    These filters will help narrow down your lead list in Clay:
                  </p>
                  {filterCriteria.filter(f => f.enabled).map((filter) => (
                    <div
                      key={filter.id}
                      className="flex items-center gap-2 p-2 bg-[#407B9D]/5 rounded-lg"
                    >
                      <CheckCircle className="w-4 h-4 text-[#407B9D] flex-shrink-0" />
                      <span className="text-sm text-[#463939]">
                        <strong>{filter.field}</strong> {getOperatorLabel(filter.operator)} <strong>{filter.value}</strong>
                      </span>
                    </div>
                  ))}
                  {filterCriteria.filter(f => f.enabled).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No filters suggested
                    </p>
                  )}
                </div>
              </div>

              {/* Enrichment Fields Summary */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#407B9D]" />
                  <h4 className="font-medium text-sm text-[#463939]">What to Enrich</h4>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    These data points should be enriched in Clay before outreach:
                  </p>
                  {enrichmentFields.filter(f => f.enabled).map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 p-2 bg-[#C8E4BB]/30 rounded-lg"
                    >
                      <CheckCircle className="w-4 h-4 text-[#407B9D] flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-[#463939]">{field.field}</span>
                        {field.description && (
                          <span className="text-xs text-muted-foreground ml-2">- {field.description}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {enrichmentFields.filter(f => f.enabled).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No enrichment needed
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Edit button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setIsEditingHowWhat(true)}
                className="text-[#407B9D] border-[#407B9D]"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Recommendations
              </Button>
            </div>
          </div>
        )

      case 'email_copy':
        return (
          <EmailCopyEditor
            emailCopy={emailCopy}
            onEmailCopyChange={setEmailCopy}
            onRegenerate={handleGenerateEmail}
            isGenerating={isGeneratingEmail}
          />
        )

      case 'linkedin_copy':
        return (
          <LinkedInCopyEditor
            linkedInCopy={linkedInCopy}
            onLinkedInCopyChange={setLinkedInCopy}
            onRegenerate={handleGenerateLinkedIn}
            isGenerating={isGeneratingLinkedIn}
          />
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C8E4BB]/30 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-[#407B9D]" />
            </div>
            <div>
              <DialogTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Hypothesis Lab
              </DialogTitle>
              <DialogDescription style={{ fontFamily: 'var(--font-body)' }}>
                {view === 'list'
                  ? 'Review and approve lead hypotheses for targeted outreach'
                  : 'Build a new lead hypothesis with AI assistance'
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {view === 'list' ? (
          // List View with Approved and Completed sections
          <>
            <div className="flex-1 overflow-y-auto py-4">
              {workflows.length > 0 ? (
                <div className="space-y-6">
                  {/* Approved Section - Ready to Action */}
                  {workflows.filter(w => w.status === 'approved').length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-[#407B9D]" />
                        <h3
                          className="font-medium text-[#463939]"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          Ready to Action
                        </h3>
                        <Badge className="bg-[#407B9D] text-white text-xs">
                          {workflows.filter(w => w.status === 'approved').length}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Create campaigns in Instantly and Heyreach, then mark as completed.
                      </p>
                      <div className="space-y-3">
                        {workflows
                          .filter(w => w.status === 'approved')
                          .map((workflow) => (
                            <WorkflowCard
                              key={workflow.id}
                              workflow={workflow}
                              onMarkAsCompleted={handleMarkAsCompleted}
                              onMoveBackToApproved={handleMoveBackToApproved}
                            />
                          ))
                        }
                      </div>
                    </div>
                  )}

                  {/* Completed Section */}
                  {workflows.filter(w => w.status === 'completed').length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-4 h-4 text-[#C8E4BB]" />
                        <h3
                          className="font-medium text-[#463939]"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          Completed
                        </h3>
                        <Badge className="bg-[#C8E4BB] text-[#463939] text-xs">
                          {workflows.filter(w => w.status === 'completed').length}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {workflows
                          .filter(w => w.status === 'completed')
                          .map((workflow) => (
                            <WorkflowCard
                              key={workflow.id}
                              workflow={workflow}
                              onMarkAsCompleted={handleMarkAsCompleted}
                              onMoveBackToApproved={handleMoveBackToApproved}
                            />
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                    No hypotheses yet. Use the &quot;New Hypothesis&quot; button on the card to get started.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {workflows.filter(w => w.status === 'approved').length} ready to action, {workflows.filter(w => w.status === 'completed').length} completed
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
          // Workflow View
          <>
            <HypothesisStepIndicator
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

            <div className="py-4">
              {renderWorkflowStep()}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep === 'who_where') {
                    setView('list')
                    resetWorkflow()
                  } else {
                    handlePrevStep()
                  }
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {currentStep === 'who_where' ? 'Back to List' : 'Back'}
              </Button>

              <div className="flex gap-2">
                {currentStep === 'who_where' && (
                  <Button
                    onClick={() => {
                      setWhoWhereApproved(true)
                      handleNextStep()
                    }}
                    className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80"
                    disabled={!targetDescription.trim() || isGeneratingIdea}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve & Continue
                  </Button>
                )}

                {currentStep === 'how_what' && (
                  <Button
                    onClick={() => {
                      setHowWhatApproved(true)
                      setIsEditingHowWhat(false)
                      handleNextStep()
                    }}
                    className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80"
                    disabled={isGeneratingHowWhat || isEditingHowWhat}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve & Continue
                  </Button>
                )}

                {currentStep === 'email_copy' && (
                  <Button
                    onClick={() => {
                      setEmailCopyApproved(true)
                      handleNextStep()
                    }}
                    className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80"
                    disabled={!emailCopy || isGeneratingEmail}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve & Continue
                  </Button>
                )}

                {currentStep === 'linkedin_copy' && (
                  <Button
                    onClick={() => {
                      setLinkedInCopyApproved(true)
                      handleFinish()
                    }}
                    className="bg-[#407B9D] text-white hover:bg-[#407B9D]/90"
                    disabled={!linkedInCopy || isGeneratingLinkedIn}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Finish
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
