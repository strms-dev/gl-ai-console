"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  GLReviewFormData,
  GLReviewComparisonStageData,
  GLReviewComparisonSelections,
  GLReviewCustomValues,
  ComparisonFieldSource,
  FinancialAccount,
  ECommerceData,
  TransactionCount
} from "@/lib/sales-pipeline-timeline-types"
import {
  CheckCircle2,
  Clock,
  RotateCw,
  GitCompare,
  Bot,
  User,
  AlertTriangle,
  ArrowRight,
  Eye,
  Pencil,
  X,
  Check,
  Plus,
  Trash2
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface GLReviewComparisonProps {
  comparisonData: GLReviewComparisonStageData
  onSimulateTeamSubmit: () => void
  onUpdateSelections: (selections: GLReviewComparisonSelections) => void
  onUpdateFinalData: (data: GLReviewFormData) => void
  onUpdateCustomValues: (customValues: GLReviewCustomValues) => void
  onSubmitAndMoveToQuote: () => void
  onReset: () => void
  isLoading?: boolean
}

// Helper to check if two values are different
function valuesAreDifferent(aiValue: unknown, teamValue: unknown): boolean {
  if (typeof aiValue === "string" && typeof teamValue === "string") {
    return aiValue.trim() !== teamValue.trim()
  }
  if (Array.isArray(aiValue) && Array.isArray(teamValue)) {
    return JSON.stringify(aiValue) !== JSON.stringify(teamValue)
  }
  if (typeof aiValue === "object" && typeof teamValue === "object") {
    return JSON.stringify(aiValue) !== JSON.stringify(teamValue)
  }
  return aiValue !== teamValue
}

// Field display names
const FIELD_LABELS: Record<keyof GLReviewFormData, string> = {
  email: "Email",
  companyName: "Company Name",
  leadName: "Lead Name",
  accounts: "Financial Accounts",
  ecommerce: "eCommerce Platforms",
  revenueCoaAllocations: "Revenue COA Allocations",
  coaRevenueCategories: "COA Revenue Categories",
  activeClasses: "Active Classes",
  catchupRequired: "Catchup Bookkeeping Required",
  catchupDateRange: "Catchup Date Range",
  additionalNotes: "Additional Notes"
}

// Fields that can be edited
const EDITABLE_FIELDS: (keyof GLReviewFormData)[] = [
  "email",
  "companyName",
  "leadName",
  "coaRevenueCategories",
  "activeClasses",
  "catchupDateRange",
  "additionalNotes",
  "revenueCoaAllocations",
  "catchupRequired",
  "accounts",
  "ecommerce"
]

// Transaction count display
const TRANSACTION_COUNT_LABELS: Record<TransactionCount, string> = {
  "<20": "<20 TRX",
  "20-100": "20-100 TRX",
  ">100": ">100 TRX",
  "": "Not set"
}

// eCommerce platform names
const ECOMMERCE_LABELS: Record<keyof ECommerceData, string> = {
  amazon: "Amazon",
  shopify: "Shopify",
  square: "Square",
  etsy: "Etsy",
  ebay: "Ebay",
  woocommerce: "WooCommerce",
  other: "Other"
}

// Format value for display
function formatValue(field: keyof GLReviewFormData, value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "Not set"
  }

  if (field === "accounts" && Array.isArray(value)) {
    const accounts = value as FinancialAccount[]
    const filledAccounts = accounts.filter(a => a.name)
    if (filledAccounts.length === 0) return "No accounts"
    return filledAccounts.map(a => `${a.name} (${TRANSACTION_COUNT_LABELS[a.transactionCount] || "Not set"})`).join(", ")
  }

  if (field === "ecommerce" && typeof value === "object") {
    const ecom = value as ECommerceData
    const platforms = Object.entries(ecom)
      .filter(([, count]) => count && count !== "")
      .map(([key, count]) => `${ECOMMERCE_LABELS[key as keyof ECommerceData]}: ${count} account${parseInt(count) > 1 ? "s" : ""}`)
    return platforms.length > 0 ? platforms.join(", ") : "None"
  }

  if (field === "catchupRequired") {
    return value === "yes" ? "Yes" : value === "no" ? "No" : "Not set"
  }

  if (field === "revenueCoaAllocations") {
    const labels: Record<string, string> = {
      "1-2": "1-2",
      "3-5": "3-5",
      ">5": ">5 (Custom pricing)"
    }
    return labels[value as string] || String(value)
  }

  return String(value)
}

// Check if field is editable
function isEditableField(field: keyof GLReviewFormData): boolean {
  return EDITABLE_FIELDS.includes(field)
}

// Comparison row component - shows AI and Team values side by side with edit capability
function ComparisonRow({
  field,
  aiValue,
  teamValue,
  selection,
  customValue,
  onSelect,
  onSaveCustomValue
}: {
  field: keyof GLReviewFormData
  aiValue: unknown
  teamValue: unknown
  selection: ComparisonFieldSource
  customValue: unknown
  onSelect: (source: ComparisonFieldSource) => void
  onSaveCustomValue: (value: unknown) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  // State for complex field editing
  const [editAccounts, setEditAccounts] = useState<FinancialAccount[]>([])
  const [editEcommerce, setEditEcommerce] = useState<ECommerceData>({
    amazon: "", shopify: "", square: "", etsy: "", ebay: "", woocommerce: "", other: ""
  })

  const isDifferent = valuesAreDifferent(aiValue, teamValue)
  const aiDisplay = formatValue(field, aiValue)
  const teamDisplay = formatValue(field, teamValue)
  const customDisplay = customValue !== undefined ? formatValue(field, customValue) : ""
  const canEdit = isEditableField(field)

  // Get the currently selected value for editing
  const getSelectedValue = (): unknown => {
    if (selection === "custom" && customValue !== undefined) {
      return customValue
    }
    if (selection === "team") {
      return teamValue
    }
    return aiValue
  }

  const handleStartEdit = () => {
    const selectedVal = getSelectedValue()
    if (field === "accounts" && Array.isArray(selectedVal)) {
      setEditAccounts([...(selectedVal as FinancialAccount[])])
    } else if (field === "ecommerce" && typeof selectedVal === "object") {
      setEditEcommerce({ ...(selectedVal as ECommerceData) })
    } else {
      setEditValue(String(selectedVal || ""))
    }
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditValue("")
    setEditAccounts([])
    setEditEcommerce({ amazon: "", shopify: "", square: "", etsy: "", ebay: "", woocommerce: "", other: "" })
  }

  const handleSaveEdit = () => {
    if (field === "accounts") {
      onSaveCustomValue(editAccounts.filter(a => a.name.trim() !== ""))
    } else if (field === "ecommerce") {
      onSaveCustomValue(editEcommerce)
    } else {
      onSaveCustomValue(editValue)
    }
    setIsEditing(false)
    setEditValue("")
    setEditAccounts([])
    setEditEcommerce({ amazon: "", shopify: "", square: "", etsy: "", ebay: "", woocommerce: "", other: "" })
  }

  // Account management helpers
  const handleAddAccount = () => {
    setEditAccounts([...editAccounts, { name: "", transactionCount: "" }])
  }

  const handleRemoveAccount = (index: number) => {
    setEditAccounts(editAccounts.filter((_, i) => i !== index))
  }

  const handleUpdateAccount = (index: number, updates: Partial<FinancialAccount>) => {
    const newAccounts = [...editAccounts]
    newAccounts[index] = { ...newAccounts[index], ...updates }
    setEditAccounts(newAccounts)
  }

  const handleUpdateEcommerce = (platform: keyof ECommerceData, value: string) => {
    setEditEcommerce({ ...editEcommerce, [platform]: value })
  }

  // Render edit mode
  if (isEditing && canEdit) {
    // Render appropriate input based on field type
    const renderEditInput = () => {
      // Financial Accounts editor
      if (field === "accounts") {
        return (
          <div className="space-y-3">
            {editAccounts.map((account, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-1">
                  <Input
                    value={account.name}
                    onChange={(e) => handleUpdateAccount(index, { name: e.target.value })}
                    className="mb-2 border-[#407B9D]/30 focus:border-[#407B9D]"
                    placeholder="Account name (e.g., Chase Business Checking)"
                  />
                  <select
                    value={account.transactionCount}
                    onChange={(e) => handleUpdateAccount(index, { transactionCount: e.target.value as TransactionCount })}
                    className="w-full h-9 px-3 rounded-md border border-[#407B9D]/30 bg-white text-sm focus:border-[#407B9D] focus:outline-none"
                  >
                    <option value="">Transaction count...</option>
                    <option value="<20">&lt;20 TRX</option>
                    <option value="20-100">20-100 TRX</option>
                    <option value=">100">&gt;100 TRX</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAccount(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddAccount}
              className="w-full py-2 px-3 border-2 border-dashed border-[#407B9D]/30 rounded-lg text-[#407B9D] text-sm font-medium hover:bg-[#407B9D]/5 hover:border-[#407B9D]/50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Account
            </button>
          </div>
        )
      }

      // eCommerce Platforms editor
      if (field === "ecommerce") {
        const platforms: (keyof ECommerceData)[] = ["amazon", "shopify", "square", "etsy", "ebay", "woocommerce", "other"]
        return (
          <div className="grid grid-cols-2 gap-3">
            {platforms.map((platform) => (
              <div key={platform} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                <Label className="flex-1 text-sm capitalize">{ECOMMERCE_LABELS[platform]}</Label>
                <select
                  value={editEcommerce[platform]}
                  onChange={(e) => handleUpdateEcommerce(platform, e.target.value)}
                  className="w-24 h-8 px-2 rounded-md border border-[#407B9D]/30 bg-white text-sm focus:border-[#407B9D] focus:outline-none"
                >
                  <option value="">None</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
            ))}
          </div>
        )
      }

      if (field === "additionalNotes" || field === "coaRevenueCategories") {
        return (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full min-h-[100px] border-[#407B9D]/30 focus:border-[#407B9D] focus:ring-[#407B9D]"
            placeholder={`Enter ${FIELD_LABELS[field].toLowerCase()}...`}
          />
        )
      }
      if (field === "revenueCoaAllocations") {
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-[#407B9D]/30 bg-white text-sm focus:border-[#407B9D] focus:ring-1 focus:ring-[#407B9D] focus:outline-none"
          >
            <option value="">Select...</option>
            <option value="1-2">1-2</option>
            <option value="3-5">3-5</option>
            <option value=">5">&gt;5 (Custom pricing)</option>
          </select>
        )
      }
      if (field === "catchupRequired") {
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-[#407B9D]/30 bg-white text-sm focus:border-[#407B9D] focus:ring-1 focus:ring-[#407B9D] focus:outline-none"
          >
            <option value="">Select...</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        )
      }
      return (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full border-[#407B9D]/30 focus:border-[#407B9D] focus:ring-[#407B9D]"
          placeholder={`Enter ${FIELD_LABELS[field].toLowerCase()}...`}
        />
      )
    }

    return (
      <div className="py-4 border-b border-gray-100 last:border-b-0 bg-[#407B9D]/5 -mx-4 px-4">
        <div className="flex items-center gap-2 mb-3">
          <Pencil className="w-4 h-4 text-[#407B9D]" />
          <Label className="text-sm font-medium text-[#463939]">
            {FIELD_LABELS[field]}
          </Label>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/20">
            Editing
          </span>
        </div>

        <div className="space-y-3">
          {renderEditInput()}

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSaveEdit}
              className="bg-[#407B9D] hover:bg-[#366a88] text-white"
            >
              <Check className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelEdit}
              className="text-gray-600 border-gray-300"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show custom value if selected
  if (selection === "custom" && customValue !== undefined) {
    return (
      <div className="py-4 border-b border-gray-100 last:border-b-0 bg-[#95CBD7]/10 -mx-4 px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-[#407B9D]" />
            <Label className="text-sm font-medium text-[#463939]">
              {FIELD_LABELS[field]}
            </Label>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#95CBD7]/30 text-[#407B9D] border border-[#95CBD7]">
              Custom
            </span>
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#407B9D] bg-[#407B9D]/10 hover:bg-[#407B9D]/20 rounded-md transition-colors border border-[#407B9D]/20"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* AI Value - clickable to select */}
          <button
            type="button"
            onClick={() => onSelect("ai")}
            className="p-3 rounded-lg border-2 text-left transition-all border-gray-200 hover:border-[#407B9D]/50 hover:bg-gray-50 opacity-70 hover:opacity-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-[#407B9D]" />
              <span className="text-xs font-medium text-[#407B9D]">AI</span>
            </div>
            <p className="text-sm text-[#463939] line-clamp-2">{aiDisplay}</p>
          </button>

          {/* Team Value - clickable to select */}
          <button
            type="button"
            onClick={() => onSelect("team")}
            className="p-3 rounded-lg border-2 text-left transition-all border-gray-200 hover:border-[#5A8A4A]/50 hover:bg-gray-50 opacity-70 hover:opacity-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-[#5A8A4A]" />
              <span className="text-xs font-medium text-[#5A8A4A]">Team</span>
            </div>
            <p className="text-sm text-[#463939] line-clamp-2">{teamDisplay}</p>
          </button>

          {/* Custom Value - selected */}
          <div className="p-3 rounded-lg border-2 text-left transition-all border-[#407B9D] bg-[#407B9D]/10 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Pencil className="w-4 h-4 text-[#407B9D]" />
              <span className="text-xs font-medium text-[#407B9D]">Custom</span>
              <CheckCircle2 className="w-4 h-4 text-[#407B9D] ml-auto" />
            </div>
            <p className="text-sm text-[#463939]">{customDisplay}</p>
          </div>
        </div>
      </div>
    )
  }

  // Determine if we have a selection (either explicit or default for matching values)
  const hasSelection = selection !== null || !isDifferent

  // For matching values, default to "ai" if no explicit selection
  const effectiveSelection = selection || (isDifferent ? null : "ai")

  return (
    <div className={`py-4 border-b border-gray-100 last:border-b-0 ${isDifferent ? "bg-amber-50/30 -mx-4 px-4" : ""}`}>
      {/* Header row with field name, status badge, and edit button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isDifferent ? (
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          )}
          <Label className="text-sm font-medium text-[#463939]">
            {FIELD_LABELS[field]}
          </Label>
          {isDifferent ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
              Different
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              Match
            </span>
          )}
        </div>
        {/* Edit button - shown when there is a selection and field is editable */}
        {hasSelection && canEdit && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#407B9D] bg-[#407B9D]/10 hover:bg-[#407B9D]/20 rounded-md transition-colors border border-[#407B9D]/20"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* AI Value - always clickable */}
        <button
          type="button"
          onClick={() => onSelect("ai")}
          className={`p-3 rounded-lg border-2 text-left transition-all ${
            effectiveSelection === "ai"
              ? "border-[#407B9D] bg-[#407B9D]/10 shadow-sm"
              : "border-gray-200 hover:border-[#407B9D]/50 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-[#407B9D]" />
            <span className="text-xs font-medium text-[#407B9D]">AI Review</span>
            {effectiveSelection === "ai" && (
              <CheckCircle2 className="w-4 h-4 text-[#407B9D] ml-auto" />
            )}
          </div>
          <p className="text-sm text-[#463939]">{aiDisplay}</p>
        </button>

        {/* Team Value - always clickable */}
        <button
          type="button"
          onClick={() => onSelect("team")}
          className={`p-3 rounded-lg border-2 text-left transition-all ${
            effectiveSelection === "team"
              ? "border-[#5A8A4A] bg-[#5A8A4A]/10 shadow-sm"
              : "border-gray-200 hover:border-[#5A8A4A]/50 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-[#5A8A4A]" />
            <span className="text-xs font-medium text-[#5A8A4A]">Team Review</span>
            {effectiveSelection === "team" && (
              <CheckCircle2 className="w-4 h-4 text-[#5A8A4A] ml-auto" />
            )}
          </div>
          <p className="text-sm text-[#463939]">{teamDisplay}</p>
        </button>
      </div>
    </div>
  )
}

export function GLReviewComparison({
  comparisonData,
  onSimulateTeamSubmit,
  onUpdateSelections,
  onUpdateFinalData,
  onUpdateCustomValues,
  onSubmitAndMoveToQuote,
  onReset,
  isLoading = false
}: GLReviewComparisonProps) {
  const [localSelections, setLocalSelections] = useState<GLReviewComparisonSelections>({})
  const [localCustomValues, setLocalCustomValues] = useState<GLReviewCustomValues>({})
  const [showFinalReviewModal, setShowFinalReviewModal] = useState(false)

  const { aiReviewData, teamReviewData, teamReviewSubmittedAt, teamReviewSubmittedBy, comparisonCompletedAt, customValues } = comparisonData

  // Initialize selections and custom values when team review comes in
  useEffect(() => {
    if (teamReviewData && aiReviewData && Object.keys(localSelections).length === 0) {
      const initialSelections: GLReviewComparisonSelections = {}
      const fields = Object.keys(aiReviewData) as (keyof GLReviewFormData)[]

      fields.forEach(field => {
        if (valuesAreDifferent(aiReviewData[field], teamReviewData[field])) {
          // Default to team selection for different values
          initialSelections[field] = "team"
        }
      })

      setLocalSelections(initialSelections)
    }

    // Load custom values from persisted data
    if (customValues && Object.keys(localCustomValues).length === 0) {
      setLocalCustomValues(customValues)
    }
  }, [teamReviewData, aiReviewData, localSelections, customValues, localCustomValues])

  // Handle selection change
  const handleSelectionChange = useCallback((field: keyof GLReviewFormData, source: ComparisonFieldSource) => {
    const newSelections = { ...localSelections, [field]: source }
    setLocalSelections(newSelections)
    onUpdateSelections(newSelections)

    // Build final data based on selections
    if (aiReviewData && teamReviewData) {
      const finalData: GLReviewFormData = { ...aiReviewData }
      const fields = Object.keys(aiReviewData) as (keyof GLReviewFormData)[]
      fields.forEach(f => {
        const sel = f === field ? source : newSelections[f]
        if (sel === "team") {
          (finalData as unknown as Record<string, unknown>)[f] = teamReviewData[f]
        } else if (sel === "custom" && localCustomValues[f] !== undefined) {
          (finalData as unknown as Record<string, unknown>)[f] = localCustomValues[f]
        }
      })
      onUpdateFinalData(finalData)
    }
  }, [localSelections, localCustomValues, aiReviewData, teamReviewData, onUpdateSelections, onUpdateFinalData])

  // Handle saving custom value
  const handleSaveCustomValue = useCallback((field: keyof GLReviewFormData, value: unknown) => {
    const newCustomValues = { ...localCustomValues, [field]: value }
    setLocalCustomValues(newCustomValues)
    onUpdateCustomValues(newCustomValues)

    // Set selection to custom
    const newSelections = { ...localSelections, [field]: "custom" as ComparisonFieldSource }
    setLocalSelections(newSelections)
    onUpdateSelections(newSelections)

    // Update final data
    if (aiReviewData && teamReviewData) {
      const finalData: GLReviewFormData = { ...aiReviewData }
      const fields = Object.keys(aiReviewData) as (keyof GLReviewFormData)[]
      fields.forEach(f => {
        const sel = f === field ? "custom" : newSelections[f]
        if (sel === "team") {
          (finalData as unknown as Record<string, unknown>)[f] = teamReviewData[f]
        } else if (sel === "custom") {
          const customVal = f === field ? value : newCustomValues[f]
          if (customVal !== undefined) {
            (finalData as unknown as Record<string, unknown>)[f] = customVal
          }
        }
      })
      onUpdateFinalData(finalData)
    }
  }, [localSelections, localCustomValues, aiReviewData, teamReviewData, onUpdateSelections, onUpdateCustomValues, onUpdateFinalData])

  // Count differences
  const countDifferences = useCallback(() => {
    if (!aiReviewData || !teamReviewData) return 0
    const fields = Object.keys(aiReviewData) as (keyof GLReviewFormData)[]
    return fields.filter(field => valuesAreDifferent(aiReviewData[field], teamReviewData[field])).length
  }, [aiReviewData, teamReviewData])

  // Check if all differences have selections
  const allDifferencesResolved = useCallback(() => {
    if (!aiReviewData || !teamReviewData) return false
    const fields = Object.keys(aiReviewData) as (keyof GLReviewFormData)[]
    const differentFields = fields.filter(field => valuesAreDifferent(aiReviewData[field], teamReviewData[field]))
    return differentFields.every(field => localSelections[field] !== undefined && localSelections[field] !== null)
  }, [aiReviewData, teamReviewData, localSelections])

  // If completed, show simple completed state
  if (comparisonCompletedAt) {
    return (
      <div className="mt-4 p-4 border border-[#C8E4BB] rounded-lg bg-[#C8E4BB]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#5A8A4A]" />
            <h4
              className="text-lg font-medium text-[#463939]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              GL Review Comparison Completed
            </h4>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFinalReviewModal(true)}
            className="text-[#407B9D] border-[#407B9D] hover:bg-[#407B9D]/10"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Final Review
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          The deal has been moved to Create Quote stage.
        </p>

        {/* Final Review Modal */}
        <Dialog open={showFinalReviewModal} onOpenChange={setShowFinalReviewModal}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>
                Final GL Review Data
              </DialogTitle>
            </DialogHeader>
            {comparisonData.finalReviewData && (
              <div className="space-y-4 py-4">
                {(Object.keys(comparisonData.finalReviewData) as (keyof GLReviewFormData)[]).map(field => (
                  <div key={field} className="py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-[#463939]">
                        {FIELD_LABELS[field]}
                      </Label>
                      {comparisonData.fieldSelections?.[field] === "custom" && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Custom</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatValue(field, comparisonData.finalReviewData![field])}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowFinalReviewModal(false)}
                className="text-[#407B9D] border-[#407B9D] hover:bg-[#407B9D]/10"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Waiting for team member review
  if (!teamReviewData) {
    return (
      <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto text-[#407B9D] mb-3" />
          <h4
            className="text-lg font-medium text-[#463939] mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Waiting for Team Member Review
          </h4>
          <p
            className="text-sm text-muted-foreground mb-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            The assigned team member has not yet submitted their GL review.
            Once submitted, you&apos;ll be able to compare it with the AI review.
          </p>

          {/* For testing - simulate team submit */}
          <Button
            onClick={onSimulateTeamSubmit}
            disabled={isLoading}
            className="bg-[#407B9D] hover:bg-[#366a88] text-white"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                Simulate Team Submit (Testing)
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Show comparison view
  const differenceCount = countDifferences()

  return (
    <div className="mt-4 p-4 border border-[#407B9D]/30 rounded-lg bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-[#407B9D]" />
          <h4
            className="text-lg font-medium text-[#463939]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            GL Review Comparison
          </h4>
        </div>
        <div className="flex items-center gap-3">
          {differenceCount > 0 ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {differenceCount} difference{differenceCount > 1 ? "s" : ""} found
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              All values match
            </span>
          )}
        </div>
      </div>

      {/* Team reviewer info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
        <p className="text-sm text-muted-foreground">
          Team review submitted by <strong>{teamReviewSubmittedBy}</strong> on{" "}
          {teamReviewSubmittedAt && new Date(teamReviewSubmittedAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
          })}
        </p>
      </div>

      {/* Instructions */}
      <div className="mb-4 p-3 bg-[#407B9D]/10 rounded-lg border border-[#407B9D]/20">
        <p className="text-sm text-[#463939]">
          <strong>How to use:</strong> Select AI or Team value for each field. Click the <span className="inline-flex items-center gap-1 font-medium text-[#407B9D]"><Pencil className="w-3 h-3" />Edit</span> button to customize any selected value.
        </p>
      </div>

      {/* Comparison rows */}
      {aiReviewData && teamReviewData && (
        <div className="space-y-0">
          {(Object.keys(aiReviewData) as (keyof GLReviewFormData)[]).map(field => (
            <ComparisonRow
              key={field}
              field={field}
              aiValue={aiReviewData[field]}
              teamValue={teamReviewData[field]}
              selection={localSelections[field] || null}
              customValue={localCustomValues[field]}
              onSelect={(source) => handleSelectionChange(field, source)}
              onSaveCustomValue={(value) => handleSaveCustomValue(field, value)}
            />
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t">
        <Button
          variant="outline"
          onClick={onReset}
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          Reset
        </Button>
        <Button
          onClick={onSubmitAndMoveToQuote}
          disabled={differenceCount > 0 && !allDifferencesResolved()}
          className="bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Submit & Move Deal to Create Quote
        </Button>
      </div>

      {differenceCount > 0 && !allDifferencesResolved() && (
        <p className="text-sm text-amber-600 mt-2 text-right">
          Please select a value for all differences before submitting.
        </p>
      )}
    </div>
  )
}
