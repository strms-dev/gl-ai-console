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
  ChevronDown,
  ChevronUp,
  Info,
  Search,
  Copy,
  ExternalLink,
} from "lucide-react"
import {
  LeadHypothesis,
  LeadHypothesisWorkflow,
  HypothesisStep,
  HypothesisEntryMode,
  LeadSourcePlatform,
  SearchCriteria,
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
  selected: LeadSourcePlatform | null
  onSelect: (source: LeadSourcePlatform) => void
}) {
  const sources: { value: LeadSourcePlatform; icon: React.ReactNode; description: string }[] = [
    { value: 'clay', icon: <Database className="w-5 h-5" />, description: 'Build list in Clay' },
    { value: 'trigify', icon: <Users className="w-5 h-5" />, description: 'Track from Trigify' },
    { value: 'csv_upload', icon: <FileSpreadsheet className="w-5 h-5" />, description: 'Upload CSV file' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
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

// Search criteria editor for Clay (building initial list)
function SearchCriteriaEditor({
  criteria,
  onCriteriaChange,
}: {
  criteria: SearchCriteria[]
  onCriteriaChange: (criteria: SearchCriteria[]) => void
}) {
  const handleValueChange = (id: string, value: string) => {
    onCriteriaChange(
      criteria.map(c => c.id === id ? { ...c, value } : c)
    )
  }

  const handleDelete = (id: string) => {
    onCriteriaChange(criteria.filter(c => c.id !== id))
  }

  const handleAdd = () => {
    const newCriteria: SearchCriteria = {
      id: `search-${Date.now()}`,
      field: '',
      value: '',
      enabled: true,
    }
    onCriteriaChange([...criteria, newCriteria])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[#463939]" style={{ fontFamily: 'var(--font-heading)' }}>
          Search Criteria
        </h4>
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="w-3 h-3 mr-1" />
          Add Criteria
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Use these criteria to build your initial lead list in Clay
      </p>
      <div className="space-y-2">
        {criteria.filter(c => c.enabled).map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 p-3 rounded-lg border bg-white border-slate-200"
          >
            <Input
              value={item.field}
              onChange={(e) => onCriteriaChange(
                criteria.map(c => c.id === item.id ? { ...c, field: e.target.value } : c)
              )}
              placeholder="Field (e.g., Industry)..."
              className="w-40 text-sm"
            />
            <Input
              value={item.value}
              onChange={(e) => handleValueChange(item.id, e.target.value)}
              placeholder="Value (e.g., SaaS, Healthcare)..."
              className="flex-1 text-sm"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(item.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {criteria.filter(c => c.enabled).length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No search criteria added yet. Click &quot;Add Criteria&quot; to start.
          </div>
        )}
      </div>
    </div>
  )
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
          Filter Criteria (After Enrichment)
        </h4>
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="w-3 h-3 mr-1" />
          Add Filter
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Apply these filters after enriching to narrow down your list
      </p>
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

// Email copy editor - handles multiple emails in a sequence
function EmailCopyEditor({
  emailCopies,
  onEmailCopiesChange,
  onRegenerate,
  isGenerating,
}: {
  emailCopies: HypothesisEmailCopy[]
  onEmailCopiesChange: (copies: HypothesisEmailCopy[]) => void
  onRegenerate: () => void
  isGenerating: boolean
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSubject, setEditSubject] = useState('')
  const [editBody, setEditBody] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleStartEdit = (email: HypothesisEmailCopy) => {
    setEditingId(email.id)
    setEditSubject(email.subject)
    setEditBody(email.body)
  }

  const handleSave = (emailId: string) => {
    onEmailCopiesChange(
      emailCopies.map(e =>
        e.id === emailId
          ? { ...e, subject: editSubject, body: editBody, approvalStatus: 'edited' as const }
          : e
      )
    )
    setEditingId(null)
  }

  const handleCopy = (email: HypothesisEmailCopy) => {
    const text = `Subject: ${email.subject}\n\n${email.body}`
    navigator.clipboard.writeText(text)
    setCopiedId(email.id)
    setTimeout(() => setCopiedId(null), 2000)
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
          Generating Email Sequence...
        </p>
        <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
          AI is crafting a 4-email sequence for your campaign.
        </p>
      </div>
    )
  }

  if (emailCopies.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No email sequence generated yet.</p>
        <Button onClick={onRegenerate} className="mt-4 bg-[#407B9D] hover:bg-[#407B9D]/90">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Email Sequence
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
            Email Sequence for Instantly ({emailCopies.length} emails)
          </h4>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          className="text-[#407B9D] border-[#407B9D]"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Regenerate All
        </Button>
      </div>

      <div className="space-y-4">
        {emailCopies.sort((a, b) => a.sequenceNumber - b.sequenceNumber).map((email) => (
          <div key={email.id} className="border rounded-lg overflow-hidden">
            <div className="bg-[#407B9D]/10 px-4 py-2 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#407B9D] text-white flex items-center justify-center text-xs font-medium">
                  {email.sequenceNumber}
                </div>
                <p className="text-sm font-medium text-[#463939]">Email {email.sequenceNumber}</p>
                {email.approvalStatus === 'edited' && (
                  <Badge className="bg-amber-100 text-amber-800 text-xs">
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edited
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(email)}
                  className="h-7 px-2"
                >
                  {copiedId === email.id ? (
                    <><Check className="w-3 h-3 mr-1 text-green-600" />Copied</>
                  ) : (
                    <><Copy className="w-3 h-3 mr-1" />Copy</>
                  )}
                </Button>
                {editingId !== email.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartEdit(email)}
                    className="h-7 px-2"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>

            {editingId === email.id ? (
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Subject</label>
                  <Input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="mt-1"
                    placeholder="Email subject..."
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Body</label>
                  <Textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="mt-1 min-h-[150px]"
                    placeholder="Email body..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => handleSave(email.id)} className="bg-[#407B9D] hover:bg-[#407B9D]/90">
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-slate-50 px-4 py-2 border-b">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Subject</p>
                </div>
                <p className="px-4 py-2 font-medium text-sm text-[#463939] border-b">{email.subject}</p>
                <div className="px-4 py-3 whitespace-pre-wrap text-sm text-[#463939] max-h-[200px] overflow-y-auto">
                  {email.body}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// LinkedIn copy editor - handles multiple messages
function LinkedInCopyEditor({
  linkedInCopies,
  onLinkedInCopiesChange,
  onRegenerate,
  isGenerating,
}: {
  linkedInCopies: HypothesisLinkedInCopy[]
  onLinkedInCopiesChange: (copies: HypothesisLinkedInCopy[]) => void
  onRegenerate: () => void
  isGenerating: boolean
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editMessage, setEditMessage] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleStartEdit = (message: HypothesisLinkedInCopy) => {
    setEditingId(message.id)
    setEditMessage(message.message)
  }

  const handleSave = (messageId: string) => {
    onLinkedInCopiesChange(
      linkedInCopies.map(m =>
        m.id === messageId
          ? { ...m, message: editMessage, approvalStatus: 'edited' as const }
          : m
      )
    )
    setEditingId(null)
  }

  const handleCopy = (message: HypothesisLinkedInCopy) => {
    navigator.clipboard.writeText(message.message)
    setCopiedId(message.id)
    setTimeout(() => setCopiedId(null), 2000)
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
          Generating LinkedIn Messages...
        </p>
        <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
          AI is crafting 2 LinkedIn messages for your campaign.
        </p>
      </div>
    )
  }

  if (linkedInCopies.length === 0) {
    return (
      <div className="text-center py-12">
        <Linkedin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No LinkedIn messages generated yet.</p>
        <Button onClick={onRegenerate} className="mt-4 bg-[#407B9D] hover:bg-[#407B9D]/90">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate LinkedIn Messages
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
            LinkedIn Messages for Heyreach ({linkedInCopies.length} messages)
          </h4>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          className="text-[#407B9D] border-[#407B9D]"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Regenerate All
        </Button>
      </div>

      <div className="space-y-4">
        {linkedInCopies.sort((a, b) => a.sequenceNumber - b.sequenceNumber).map((message) => (
          <div key={message.id} className="border rounded-lg overflow-hidden">
            <div className="bg-[#0A66C2]/10 px-4 py-2 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#0A66C2] text-white flex items-center justify-center text-xs font-medium">
                  {message.sequenceNumber}
                </div>
                <p className="text-sm font-medium text-[#463939]">Message {message.sequenceNumber}</p>
                {message.approvalStatus === 'edited' && (
                  <Badge className="bg-amber-100 text-amber-800 text-xs">
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edited
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(message)}
                  className="h-7 px-2"
                >
                  {copiedId === message.id ? (
                    <><Check className="w-3 h-3 mr-1 text-green-600" />Copied</>
                  ) : (
                    <><Copy className="w-3 h-3 mr-1" />Copy</>
                  )}
                </Button>
                {editingId !== message.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartEdit(message)}
                    className="h-7 px-2"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>

            {editingId === message.id ? (
              <div className="p-4 space-y-3">
                <Textarea
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  className="min-h-[120px]"
                  placeholder="LinkedIn message..."
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => handleSave(message.id)} className="bg-[#407B9D] hover:bg-[#407B9D]/90">
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 whitespace-pre-wrap text-sm text-[#463939]">
                {message.message}
              </div>
            )}
          </div>
        ))}
      </div>

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
    searchCriteria: SearchCriteria[]
    filterCriteria: FilterCriteria[]
    enrichmentFields: EnrichmentField[]
    emailCopies: HypothesisEmailCopy[]
    linkedInCopies: HypothesisLinkedInCopy[]
    status: WorkflowCardStatus
    approvedAt: string
    completedAt?: string
  }
  onMarkAsCompleted?: (id: string) => void
  onMoveBackToApproved?: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null)
  const [copiedLinkedInId, setCopiedLinkedInId] = useState<string | null>(null)

  const handleCopyEmail = (email: HypothesisEmailCopy) => {
    const text = `Subject: ${email.subject}\n\n${email.body}`
    navigator.clipboard.writeText(text)
    setCopiedEmailId(email.id)
    setTimeout(() => setCopiedEmailId(null), 2000)
  }

  const handleCopyLinkedIn = (message: HypothesisLinkedInCopy) => {
    navigator.clipboard.writeText(message.message)
    setCopiedLinkedInId(message.id)
    setTimeout(() => setCopiedLinkedInId(null), 2000)
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

          {/* Email and LinkedIn count summary */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {workflow.emailCopies.length} emails
            </span>
            <span className="flex items-center gap-1">
              <Linkedin className="w-4 h-4" />
              {workflow.linkedInCopies.length} messages
            </span>
          </div>

          {/* Search criteria summary (Clay only) */}
          {workflow.searchCriteria.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Search Criteria (Clay)
              </p>
              <div className="flex flex-wrap gap-2">
                {workflow.searchCriteria.map((item) => (
                  <Badge key={item.id} className="bg-[#407B9D]/10 text-[#407B9D] text-xs">
                    {item.field}: {item.value}
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

          {/* Filter criteria summary (after enrichment) */}
          {workflow.filterCriteria.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Filter Criteria (After Enrichment)
              </p>
              <div className="flex flex-wrap gap-2">
                {workflow.filterCriteria.map((filter) => (
                  <Badge key={filter.id} className="bg-slate-100 text-slate-700 text-xs">
                    {filter.field} {getOperatorLabel(filter.operator)} {filter.value}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Email sequence preview */}
          {workflow.emailCopies.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Email Sequence (Instantly) - {workflow.emailCopies.length} emails
              </p>
              <div className="space-y-2">
                {workflow.emailCopies.sort((a, b) => a.sequenceNumber - b.sequenceNumber).map((email) => (
                  <div key={email.id} className="bg-white border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-[#407B9D]/10 text-[#407B9D] text-xs">
                            Email {email.sequenceNumber}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-[#463939] mb-1 truncate">
                          {email.subject}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                          {email.body}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyEmail(email)
                        }}
                        className="h-7 px-2 flex-shrink-0"
                      >
                        {copiedEmailId === email.id ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LinkedIn messages preview */}
          {workflow.linkedInCopies.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                LinkedIn Messages (Heyreach) - {workflow.linkedInCopies.length} messages
              </p>
              <div className="space-y-2">
                {workflow.linkedInCopies.sort((a, b) => a.sequenceNumber - b.sequenceNumber).map((message) => (
                  <div key={message.id} className="bg-white border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-[#0A66C2]/10 text-[#0A66C2] text-xs">
                            Message {message.sequenceNumber}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                          {message.message}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyLinkedIn(message)
                        }}
                        className="h-7 px-2 flex-shrink-0"
                      >
                        {copiedLinkedInId === message.id ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
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
  const [leadSource, setLeadSource] = useState<LeadSourcePlatform | null>('clay')
  const [leadSourceDetails, setLeadSourceDetails] = useState('')
  const [whoWhereApproved, setWhoWhereApproved] = useState(false)

  // Search criteria for Clay (building initial list)
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria[]>([
    { id: 'search-1', field: 'Industry', value: '', enabled: true },
    { id: 'search-2', field: 'Funding Raised', value: '', enabled: true },
    { id: 'search-3', field: 'Company Size', value: '', enabled: true },
  ])

  // Filter criteria (applied after enrichment)
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria[]>([
    { id: 'filter-1', field: 'Year Raised', operator: 'greater_than', value: '', enabled: true },
    { id: 'filter-2', field: 'CEO Found', operator: 'equals', value: 'Yes', enabled: true },
  ])
  const [enrichmentFields, setEnrichmentFields] = useState<EnrichmentField[]>(
    defaultEnrichmentFields.map(f => ({ ...f, enabled: false }))
  )
  const [howWhatApproved, setHowWhatApproved] = useState(false)

  const [emailCopies, setEmailCopies] = useState<HypothesisEmailCopy[]>([])
  const [emailCopyApproved, setEmailCopyApproved] = useState(false)
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false)

  const [linkedInCopies, setLinkedInCopies] = useState<HypothesisLinkedInCopy[]>([])
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
    searchCriteria: SearchCriteria[]
    filterCriteria: FilterCriteria[]
    enrichmentFields: EnrichmentField[]
    emailCopies: HypothesisEmailCopy[]
    linkedInCopies: HypothesisLinkedInCopy[]
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
    setLeadSource(null)
    setLeadSourceDetails('')
    setWhoWhereApproved(false)
    setSearchCriteria([
      { id: 'search-1', field: 'Industry', value: '', enabled: true },
      { id: 'search-2', field: 'Funding Raised', value: '', enabled: true },
      { id: 'search-3', field: 'Company Size', value: '', enabled: true },
    ])
    setFilterCriteria([
      { id: 'filter-1', field: 'Year Raised', operator: 'greater_than', value: '', enabled: true },
      { id: 'filter-2', field: 'CEO Found', operator: 'equals', value: 'Yes', enabled: true },
    ])
    setEnrichmentFields(defaultEnrichmentFields.map(f => ({ ...f, enabled: false })))
    setHowWhatApproved(false)
    setHowWhatGenerated(false)
    setIsEditingHowWhat(false)
    setEmailCopies([])
    setEmailCopyApproved(false)
    setLinkedInCopies([])
    setLinkedInCopyApproved(false)
  }

  // Start new workflow
  const handleStartWorkflow = (mode: HypothesisEntryMode) => {
    setEntryMode(mode)
    resetWorkflow()
    setView('workflow')
    onStartWorkflow?.(mode)

    // If general mode, simulate AI generating an idea and set default lead source
    if (mode === 'general') {
      setLeadSource('clay')
      setIsGeneratingIdea(true)
      setTimeout(() => {
        setTargetDescription('Companies that recently raised Series A funding in the CPG industry, looking for fractional CFO services to scale their financial operations.')
        setIsGeneratingIdea(false)
      }, 2000)
    } else {
      // Specific mode: don't pre-select lead source
      setLeadSource(null)
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

  // Generate How & What (search criteria, enrichment suggestions, and filter criteria)
  const handleGenerateHowWhat = () => {
    setIsGeneratingHowWhat(true)
    setHowWhatGenerated(false)
    setIsEditingHowWhat(false)

    setTimeout(() => {
      // AI generates search criteria for Clay (only for Clay lead source)
      if (leadSource === 'clay') {
        setSearchCriteria([
          { id: 'search-1', field: 'Industry', value: 'CPG / Consumer Goods', enabled: true },
          { id: 'search-2', field: 'Funding Raised', value: '$1M - $10M (Series A)', enabled: true },
          { id: 'search-3', field: 'Company Size', value: '10-50 employees', enabled: true },
          { id: 'search-4', field: 'Location', value: 'United States', enabled: true },
        ])
      }

      // AI suggests which fields need enrichment
      setEnrichmentFields([
        { id: 'ceo_name', field: 'CEO Name', description: 'Name of the CEO or founder', enabled: true },
        { id: 'email', field: 'Email', description: 'Business email address', enabled: true },
        { id: 'linkedin', field: 'LinkedIn URL', description: 'Personal LinkedIn profile', enabled: true },
        { id: 'year_raised', field: 'Year Raised', description: 'Year of last funding round', enabled: true },
        { id: 'phone', field: 'Phone Number', description: 'Direct phone number', enabled: false },
        { id: 'company_linkedin', field: 'Company LinkedIn', description: 'Company LinkedIn page', enabled: false },
      ])

      // AI generates filter criteria to apply AFTER enrichment
      setFilterCriteria([
        { id: 'filter-1', field: 'Year Raised', operator: 'greater_than', value: '2024', enabled: true },
        { id: 'filter-2', field: 'CEO Found', operator: 'equals', value: 'Yes', enabled: true },
        { id: 'filter-3', field: 'Email Found', operator: 'equals', value: 'Yes', enabled: true },
      ])

      setIsGeneratingHowWhat(false)
      setHowWhatGenerated(true)
    }, 2500)
  }

  // Generate email copy
  const handleGenerateEmail = () => {
    setIsGeneratingEmail(true)
    setTimeout(() => {
      const emails: HypothesisEmailCopy[] = [
        {
          id: `email-1-${Date.now()}`,
          sequenceNumber: 1,
          subject: 'Quick question about {{company_name}}\'s financial scaling',
          body: `Hi {{first_name}},

Congrats on the recent Series A raise! That's an exciting milestone for {{company_name}}.

As you scale, I've noticed many CPG founders hit a wall when it comes to financial infrastructure - especially around forecasting and cash flow management.

We help growing CPG brands like yours get fractional CFO support without the full-time cost. Would love to share how we've helped similar companies.

Open to a quick 15-min call this week?

Best,
{{sender_name}}`,
          approvalStatus: 'pending',
        },
        {
          id: `email-2-${Date.now()}`,
          sequenceNumber: 2,
          subject: 'Following up - {{company_name}} financial planning',
          body: `Hi {{first_name}},

Just wanted to follow up on my previous note. I know things get busy after a funding round!

I came across a case study that might be relevant - we helped a similar CPG brand reduce their close time by 40% while preparing for their Series B.

Would you be open to a quick call to explore if we could help {{company_name}} in a similar way?

Best,
{{sender_name}}`,
          approvalStatus: 'pending',
        },
        {
          id: `email-3-${Date.now()}`,
          sequenceNumber: 3,
          subject: 'One more thought for {{company_name}}',
          body: `Hi {{first_name}},

I don't want to be a pest, so this will be my last note for now.

One thing I've seen work well for CPG founders post-Series A: getting a fractional CFO involved early to set up proper financial infrastructure before the chaos of scaling hits.

If you're ever curious about what that looks like, I'm happy to share some insights - no strings attached.

Best,
{{sender_name}}`,
          approvalStatus: 'pending',
        },
        {
          id: `email-4-${Date.now()}`,
          sequenceNumber: 4,
          subject: 'Quick resource for {{company_name}}',
          body: `Hi {{first_name}},

Final follow-up! I put together a quick guide on "5 Financial Pitfalls CPG Brands Face Post-Series A" - thought it might be useful for {{company_name}}.

Happy to send it over if you're interested. Just reply "send it" and I'll get it to you.

Best,
{{sender_name}}`,
          approvalStatus: 'pending',
        },
      ]
      setEmailCopies(emails)
      setIsGeneratingEmail(false)
    }, 2500)
  }

  // Generate LinkedIn copy (2 messages)
  const handleGenerateLinkedIn = () => {
    setIsGeneratingLinkedIn(true)
    setTimeout(() => {
      const linkedIns: HypothesisLinkedInCopy[] = [
        {
          id: `linkedin-1-${Date.now()}`,
          sequenceNumber: 1,
          message: `Hi {{first_name}}, saw the news about {{company_name}}'s Series A - congrats!

As you scale, financial planning can get tricky. We help CPG founders like you get strategic CFO support without the full-time commitment.

Would love to connect and share some insights if helpful!`,
          approvalStatus: 'pending',
        },
        {
          id: `linkedin-2-${Date.now()}`,
          sequenceNumber: 2,
          message: `Hi {{first_name}}, hope you're doing well!

Following up on my earlier message - I work with a lot of CPG founders who've recently raised and I'd love to share what's working for them financially.

No pitch, just happy to connect with fellow CPG folks. Open to a quick chat?`,
          approvalStatus: 'pending',
        },
      ]
      setLinkedInCopies(linkedIns)
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
      } else if (nextStep === 'email_copy' && emailCopies.length === 0) {
        handleGenerateEmail()
      } else if (nextStep === 'linkedin_copy' && linkedInCopies.length === 0) {
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
    if (!leadSource) return // Safety check

    // Save the workflow as approved (ready to action)
    const newWorkflow = {
      id: `workflow-${Date.now()}`,
      targetDescription,
      leadSource,
      searchCriteria: leadSource === 'clay' ? searchCriteria.filter(c => c.enabled) : [],
      filterCriteria: filterCriteria.filter(f => f.enabled),
      enrichmentFields: enrichmentFields.filter(f => f.enabled),
      emailCopies,
      linkedInCopies,
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
                    <div className="mt-3 p-4 bg-slate-50 border rounded-lg">
                      <p className="text-sm text-[#463939]">
                        You&apos;ll upload your CSV directly into Clay. The workflow will guide you through enrichment and filtering after import.
                      </p>
                    </div>
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

              {/* Trigify info note */}
              {leadSource === 'trigify' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      Trigify leads come from tracking influencer engagement
                    </p>
                    <p className="text-xs text-blue-700">
                      Use the Influencer Finder workflow first to identify influencers to track. Once you have influencers in Trigify, their engaged followers will flow into Clay for enrichment.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Search Criteria (Clay only) */}
                {leadSource === 'clay' && (
                  <SearchCriteriaEditor
                    criteria={searchCriteria}
                    onCriteriaChange={setSearchCriteria}
                  />
                )}

                <EnrichmentFieldsEditor
                  fields={enrichmentFields}
                  onFieldsChange={setEnrichmentFields}
                />

                <FilterCriteriaEditor
                  criteria={filterCriteria}
                  onCriteriaChange={setFilterCriteria}
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

            {/* Trigify info note */}
            {leadSource === 'trigify' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    Trigify leads come from tracking influencer engagement
                  </p>
                  <p className="text-xs text-blue-700">
                    Use the Influencer Finder workflow first to identify influencers to track. Once you have influencers in Trigify, their engaged followers will flow into Clay for enrichment.
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Search Criteria (Clay only) */}
            {leadSource === 'clay' && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-[#407B9D]/10 px-4 py-3 border-b flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#407B9D] text-white flex items-center justify-center text-xs font-medium">1</div>
                  <Search className="w-4 h-4 text-[#407B9D]" />
                  <h4 className="font-medium text-sm text-[#463939]">Search Criteria (Build Initial List in Clay)</h4>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    Use these criteria to find companies/people in Clay:
                  </p>
                  {searchCriteria.filter(c => c.enabled).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 bg-[#407B9D]/5 rounded-lg"
                    >
                      <CheckCircle className="w-4 h-4 text-[#407B9D] flex-shrink-0" />
                      <span className="text-sm text-[#463939]">
                        <strong>{item.field}:</strong> {item.value}
                      </span>
                    </div>
                  ))}
                  {searchCriteria.filter(c => c.enabled).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No search criteria suggested
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Enrichment Fields */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-[#C8E4BB]/30 px-4 py-3 border-b flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#407B9D] text-white flex items-center justify-center text-xs font-medium">
                  {leadSource === 'clay' ? '2' : '1'}
                </div>
                <Database className="w-4 h-4 text-[#407B9D]" />
                <h4 className="font-medium text-sm text-[#463939]">What to Enrich</h4>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground mb-3">
                  Enrich these data points in Clay before filtering:
                </p>
                {enrichmentFields.filter(f => f.enabled).map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 p-2 bg-[#C8E4BB]/20 rounded-lg"
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

            {/* Step 3: Filter Criteria (after enrichment) */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-4 py-3 border-b flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#407B9D] text-white flex items-center justify-center text-xs font-medium">
                  {leadSource === 'clay' ? '3' : '2'}
                </div>
                <Filter className="w-4 h-4 text-[#407B9D]" />
                <h4 className="font-medium text-sm text-[#463939]">How to Filter (After Enrichment)</h4>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground mb-3">
                  Apply these filters after enriching to narrow down your list:
                </p>
                {filterCriteria.filter(f => f.enabled).map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"
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
            emailCopies={emailCopies}
            onEmailCopiesChange={setEmailCopies}
            onRegenerate={handleGenerateEmail}
            isGenerating={isGeneratingEmail}
          />
        )

      case 'linkedin_copy':
        return (
          <LinkedInCopyEditor
            linkedInCopies={linkedInCopies}
            onLinkedInCopiesChange={setLinkedInCopies}
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
                    disabled={!targetDescription.trim() || !leadSource || isGeneratingIdea}
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
                    disabled={emailCopies.length === 0 || isGeneratingEmail}
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
                    disabled={linkedInCopies.length === 0 || isGeneratingLinkedIn}
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
