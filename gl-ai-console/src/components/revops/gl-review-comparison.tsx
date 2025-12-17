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
  Check
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

// Fields that can be edited with simple text input
const SIMPLE_EDITABLE_FIELDS: (keyof GLReviewFormData)[] = [
  "email",
  "companyName",
  "leadName",
  "coaRevenueCategories",
  "activeClasses",
  "catchupDateRange",
  "additionalNotes"
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

// Check if field is simple editable (text/number input)
function isSimpleEditableField(field: keyof GLReviewFormData): boolean {
  return SIMPLE_EDITABLE_FIELDS.includes(field)
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

  const isDifferent = valuesAreDifferent(aiValue, teamValue)
  const aiDisplay = formatValue(field, aiValue)
  const teamDisplay = formatValue(field, teamValue)
  const customDisplay = customValue !== undefined ? formatValue(field, customValue) : ""
  const canEdit = isSimpleEditableField(field)

  // Get the currently selected value for editing
  const getSelectedValue = (): string => {
    if (selection === "custom" && customValue !== undefined) {
      return String(customValue || "")
    }
    if (selection === "team") {
      return String(teamValue || "")
    }
    return String(aiValue || "")
  }

  const handleStartEdit = () => {
    setEditValue(getSelectedValue())
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditValue("")
  }

  const handleSaveEdit = () => {
    onSaveCustomValue(editValue)
    setIsEditing(false)
    setEditValue("")
  }

  // Render edit mode
  if (isEditing && canEdit) {
    return (
      <div className="py-4 border-b border-gray-100 last:border-b-0 bg-purple-50/30 -mx-4 px-4">
        <div className="flex items-center gap-2 mb-3">
          <Pencil className="w-4 h-4 text-purple-600" />
          <Label className="text-sm font-medium text-[#463939]">
            {FIELD_LABELS[field]}
          </Label>
          <span className="text-xs text-purple-600 font-medium">Editing custom value</span>
        </div>

        <div className="space-y-3">
          {field === "additionalNotes" || field === "coaRevenueCategories" ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full min-h-[100px]"
              placeholder={`Enter custom ${FIELD_LABELS[field].toLowerCase()}...`}
            />
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full"
              placeholder={`Enter custom ${FIELD_LABELS[field].toLowerCase()}...`}
            />
          )}

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSaveEdit}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Check className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelEdit}
              className="text-gray-600"
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
      <div className="py-4 border-b border-gray-100 last:border-b-0 bg-purple-50/30 -mx-4 px-4">
        <div className="flex items-center gap-2 mb-3">
          <Pencil className="w-4 h-4 text-purple-600" />
          <Label className="text-sm font-medium text-[#463939]">
            {FIELD_LABELS[field]}
          </Label>
          <span className="text-xs text-purple-600 font-medium">Custom value</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* AI Value - clickable to select */}
          <button
            type="button"
            onClick={() => onSelect("ai")}
            className="p-3 rounded-lg border-2 text-left transition-all border-gray-200 hover:border-gray-300 opacity-60"
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
            className="p-3 rounded-lg border-2 text-left transition-all border-gray-200 hover:border-gray-300 opacity-60"
          >
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-[#5A8A4A]" />
              <span className="text-xs font-medium text-[#5A8A4A]">Team</span>
            </div>
            <p className="text-sm text-[#463939] line-clamp-2">{teamDisplay}</p>
          </button>

          {/* Custom Value - selected */}
          <div className="p-3 rounded-lg border-2 text-left transition-all border-purple-500 bg-purple-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Pencil className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-600">Custom</span>
              <CheckCircle2 className="w-4 h-4 text-purple-600 ml-auto" />
            </div>
            <p className="text-sm text-[#463939]">{customDisplay}</p>
            {canEdit && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="mt-2 text-xs text-purple-600 hover:text-purple-700 underline"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`py-4 border-b border-gray-100 last:border-b-0 ${isDifferent ? "bg-amber-50/30 -mx-4 px-4" : ""}`}>
      <div className="flex items-center gap-2 mb-3">
        {isDifferent ? (
          <>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <Label className="text-sm font-medium text-[#463939]">
              {FIELD_LABELS[field]}
            </Label>
            <span className="text-xs text-amber-600 font-medium">Different values - select one</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <Label className="text-sm font-medium text-[#463939]">
              {FIELD_LABELS[field]}
            </Label>
            <span className="text-xs text-green-600 font-medium">Values match</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* AI Value */}
        {isDifferent ? (
          <button
            type="button"
            onClick={() => onSelect("ai")}
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              selection === "ai"
                ? "border-[#407B9D] bg-[#407B9D]/10"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-[#407B9D]" />
              <span className="text-xs font-medium text-[#407B9D]">AI Review</span>
              {selection === "ai" && (
                <CheckCircle2 className="w-4 h-4 text-[#407B9D] ml-auto" />
              )}
            </div>
            <p className="text-sm text-[#463939]">{aiDisplay}</p>
            {selection === "ai" && canEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartEdit()
                }}
                className="mt-2 text-xs text-[#407B9D] hover:text-[#366a88] underline flex items-center gap-1"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
            )}
          </button>
        ) : (
          <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-[#407B9D]" />
              <span className="text-xs font-medium text-[#407B9D]">AI Review</span>
            </div>
            <p className="text-sm text-[#463939]">{aiDisplay}</p>
          </div>
        )}

        {/* Team Value */}
        {isDifferent ? (
          <button
            type="button"
            onClick={() => onSelect("team")}
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              selection === "team"
                ? "border-[#5A8A4A] bg-[#5A8A4A]/10"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-[#5A8A4A]" />
              <span className="text-xs font-medium text-[#5A8A4A]">Team Review</span>
              {selection === "team" && (
                <CheckCircle2 className="w-4 h-4 text-[#5A8A4A] ml-auto" />
              )}
            </div>
            <p className="text-sm text-[#463939]">{teamDisplay}</p>
            {selection === "team" && canEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartEdit()
                }}
                className="mt-2 text-xs text-[#5A8A4A] hover:text-[#4a7a3a] underline flex items-center gap-1"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
            )}
          </button>
        ) : (
          <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-[#5A8A4A]" />
              <span className="text-xs font-medium text-[#5A8A4A]">Team Review</span>
            </div>
            <p className="text-sm text-[#463939]">{teamDisplay}</p>
          </div>
        )}
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
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Select AI or Team value for each difference. After selecting, click &quot;Edit&quot; to customize the value if needed.
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
