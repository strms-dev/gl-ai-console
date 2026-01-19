"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import {
  GLReviewFormData,
  TransactionCount,
  ECommerceAccountCount,
  FinancialAccount
} from "@/lib/sales-pipeline-timeline-types"
import { CheckCircle2, Eye, Pencil, RotateCw, Sparkles, Plus, Trash2, ExternalLink, Square, CheckSquare } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface GLReviewFormProps {
  formData: GLReviewFormData | null
  isAutoFilled: boolean
  isConfirmed: boolean
  onAutoFill: () => void
  onTriggerAI?: (qboClientName: string) => Promise<{ success: boolean; error?: string }>
  onFormChange: (data: GLReviewFormData) => void
  onConfirm: () => void
  onReset: () => void
  isLoading?: boolean
}

// Form field options
const TRANSACTION_COUNT_OPTIONS = [
  { value: "<20", label: "<20 TRX" },
  { value: "20-100", label: "20–100 TRX" },
  { value: ">100", label: ">100 TRX" },
]

const ECOMMERCE_ACCOUNT_OPTIONS = [
  { value: "", label: "None" },
  { value: "1", label: "1 account" },
  { value: "2", label: "2 accounts" },
  { value: "3", label: "3 accounts" },
  { value: "4", label: "4 accounts" },
  { value: "5", label: "5 accounts" },
]

const REVENUE_COA_OPTIONS = [
  { value: "1-2", label: "1–2" },
  { value: "3-5", label: "3–5" },
  { value: ">5", label: ">5 (= custom pricing)" },
]

const ACTIVE_CLASSES_OPTIONS = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
  { value: "8", label: "8" },
  { value: "9", label: "9" },
  { value: "10", label: "10" },
]

const YES_NO_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
]

const ECOMMERCE_PLATFORMS = [
  { key: "amazon", label: "Amazon" },
  { key: "shopify", label: "Shopify" },
  { key: "square", label: "Square" },
  { key: "etsy", label: "Etsy" },
  { key: "ebay", label: "Ebay" },
  { key: "woocommerce", label: "WooCommerce" },
  { key: "other", label: "Other" },
] as const

export function GLReviewForm({
  formData,
  isAutoFilled,
  isConfirmed,
  onAutoFill,
  onTriggerAI,
  onFormChange,
  onConfirm,
  onReset,
  isLoading = false,
}: GLReviewFormProps) {
  const [localData, setLocalData] = useState<GLReviewFormData | null>(formData)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [visibleAccounts, setVisibleAccounts] = useState(5)

  // QBO MCP Authorization state
  const [qboMcpAuthorized, setQboMcpAuthorized] = useState(false)
  const [qboClientName, setQboClientName] = useState("")
  const [isTriggering, setIsTriggering] = useState(false)
  const [triggerError, setTriggerError] = useState<string | null>(null)

  // Helper to render label
  const renderLabel = (htmlFor: string, text: string, required = false) => {
    return (
      <Label htmlFor={htmlFor} className="flex items-center gap-2 flex-wrap">
        <span>{text}{required && <span className="text-red-500">*</span>}</span>
      </Label>
    )
  }

  // Sync local data with prop changes
  useEffect(() => {
    setLocalData(formData)
    // Calculate how many accounts have data to show appropriate number of rows
    if (formData?.accounts) {
      const filledAccounts = formData.accounts.filter(a => a.name || a.transactionCount).length
      setVisibleAccounts(Math.max(5, filledAccounts + 1))
    }
  }, [formData])

  // Reset editing state when confirmation status changes
  useEffect(() => {
    if (isConfirmed) {
      setIsEditing(false)
    }
  }, [isConfirmed])

  const handleFieldChange = (field: keyof GLReviewFormData, value: string | FinancialAccount[] | GLReviewFormData["ecommerce"]) => {
    if (!localData) return

    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onFormChange(newData)
  }

  const handleAccountChange = (index: number, field: "name" | "transactionCount", value: string) => {
    if (!localData) return

    const newAccounts = [...localData.accounts]
    newAccounts[index] = {
      ...newAccounts[index],
      [field]: value
    }
    handleFieldChange("accounts", newAccounts)
  }

  const clearAccount = (index: number) => {
    if (!localData) return

    const newAccounts = [...localData.accounts]
    newAccounts[index] = {
      name: "",
      transactionCount: ""
    }
    handleFieldChange("accounts", newAccounts)
  }

  const handleEcommerceChange = (platform: keyof GLReviewFormData["ecommerce"], value: ECommerceAccountCount) => {
    if (!localData) return

    const newEcommerce = {
      ...localData.ecommerce,
      [platform]: value
    }
    handleFieldChange("ecommerce", newEcommerce)
  }

  const addMoreAccounts = () => {
    setVisibleAccounts(prev => Math.min(prev + 5, 20))
  }

  // Helper to get display label from value
  const getDisplayValue = (options: { value: string; label: string }[], value: string) => {
    return options.find(o => o.value === value)?.label || value || "-"
  }

  // Handle triggering AI GL Review via n8n
  const handleTriggerAI = async () => {
    if (!onTriggerAI || !qboClientName.trim()) return

    setIsTriggering(true)
    setTriggerError(null)

    const result = await onTriggerAI(qboClientName.trim())

    setIsTriggering(false)

    if (!result.success) {
      setTriggerError(result.error || "Failed to trigger AI GL Review")
    }
  }

  // If no form data and not confirmed, show QBO authorization and auto-fill UI
  if (!formData && !isConfirmed) {
    return (
      <div className="mt-4 space-y-4">
        {/* QBO MCP Authorization Section */}
        <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
          <h5 className="font-medium text-amber-800 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Step 1: Authorize QBO Access in MCP Dashboard
          </h5>
          <p className="text-sm text-amber-700 mb-3" style={{ fontFamily: "var(--font-body)" }}>
            The client has shared QBO access with us. Now authorize their account
            in our QBO MCP dashboard so we can fetch their data.
          </p>
          <a
            href="https://qbo-mcp.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#407B9D] hover:underline mb-4"
          >
            <ExternalLink className="w-4 h-4" />
            Open QBO MCP Dashboard
          </a>

          <div className="mt-4 space-y-3">
            <div
              className="flex items-start gap-3 cursor-pointer"
              onClick={() => setQboMcpAuthorized(!qboMcpAuthorized)}
            >
              {qboMcpAuthorized ? (
                <CheckSquare className="w-5 h-5 text-[#407B9D] mt-0.5 flex-shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              )}
              <label className="text-sm cursor-pointer select-none">
                I have authorized this client&apos;s QBO account in the MCP dashboard
              </label>
            </div>

            {qboMcpAuthorized && (
              <div className="ml-8 space-y-2">
                <Label htmlFor="qboClientName" className="text-sm">
                  Exact QBO Client Name (as shown in MCP dashboard)
                </Label>
                <Input
                  id="qboClientName"
                  value={qboClientName}
                  onChange={(e) => setQboClientName(e.target.value)}
                  placeholder="e.g., Acme Technologies Inc"
                  className="border-gray-300 focus:border-[#407B9D] focus:ring-[#407B9D]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Auto-Fill Section */}
        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="text-center">
            <Sparkles className="w-12 h-12 mx-auto text-[#407B9D] mb-3" />
            <h4
              className="text-lg font-medium text-[#463939] mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Step 2: Generate GL Review
            </h4>
            <p
              className="text-sm text-muted-foreground mb-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Analyze the client&apos;s QuickBooks data and auto-fill the GL Review form.
              You can review and adjust before confirming.
            </p>

            {triggerError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {triggerError}
              </div>
            )}

            {/* Show real trigger button if onTriggerAI is provided, otherwise fall back to test data */}
            {onTriggerAI ? (
              <Button
                onClick={handleTriggerAI}
                disabled={!qboMcpAuthorized || !qboClientName.trim() || isTriggering || isLoading}
                className="bg-[#407B9D] hover:bg-[#366a88] text-white disabled:opacity-50"
              >
                {isTriggering || isLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing QBO Data...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Auto-Fill from QBO
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={onAutoFill}
                disabled={isLoading}
                className="bg-[#407B9D] hover:bg-[#366a88] text-white"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Auto-Fill (Test Data)
                  </>
                )}
              </Button>
            )}

            {!qboMcpAuthorized && onTriggerAI && (
              <p className="text-xs text-muted-foreground mt-2">
                Complete Step 1 above to enable auto-fill
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // If confirmed and not editing, show simple confirmed message
  if (isConfirmed && localData && !isEditing) {
    return (
      <>
        <div className="mt-4 p-4 border border-[#C8E4BB] rounded-lg bg-[#C8E4BB]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#5A8A4A]" />
              <h4
                className="text-lg font-medium text-[#463939]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                GL Review Confirmed
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailsModal(true)}
                className="text-[#407B9D] border-[#407B9D] hover:bg-[#407B9D]/10"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-[#407B9D] border-[#407B9D] hover:bg-[#407B9D]/10"
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </div>

        {/* Full Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>
                GL Review Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Financial Accounts */}
              <div className="space-y-3">
                <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Financial Accounts
                </h5>
                <div className="space-y-2 text-sm">
                  {localData.accounts.filter(a => a.name).map((account, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-muted-foreground">Account #{idx + 1}:</span>
                      <span className="font-medium">{account.name} - {getDisplayValue(TRANSACTION_COUNT_OPTIONS, account.transactionCount)}</span>
                    </div>
                  ))}
                  {localData.accounts.filter(a => a.name).length === 0 && (
                    <span className="text-muted-foreground">No financial accounts listed</span>
                  )}
                </div>
              </div>

              {/* eCommerce */}
              <div className="space-y-3">
                <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  eCommerce
                </h5>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  {ECOMMERCE_PLATFORMS.map(platform => {
                    const value = localData.ecommerce[platform.key]
                    if (!value) return null
                    return (
                      <div key={platform.key}>
                        <span className="text-muted-foreground">{platform.label}:</span>
                        <span className="ml-2 font-medium">{value} account{parseInt(value) > 1 ? "s" : ""}</span>
                      </div>
                    )
                  })}
                  {Object.values(localData.ecommerce).every(v => !v) && (
                    <span className="text-muted-foreground">No eCommerce platforms</span>
                  )}
                </div>
              </div>

              {/* Revenue & Classes */}
              <div className="space-y-3">
                <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Revenue & Classes
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Revenue COA Allocations:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(REVENUE_COA_OPTIONS, localData.revenueCoaAllocations)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Active Classes:</span>
                    <span className="ml-2 font-medium">{localData.activeClasses || "-"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">COA Revenue Categories:</span>
                    <span className="ml-2 font-medium">{localData.coaRevenueCategories || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Catchup Bookkeeping */}
              <div className="space-y-3">
                <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Catchup Bookkeeping
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Required:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(YES_NO_OPTIONS, localData.catchupRequired)}</span>
                  </div>
                  {localData.catchupRequired === "yes" && (
                    <div>
                      <span className="text-muted-foreground">Date Range:</span>
                      <span className="ml-2 font-medium">{localData.catchupDateRange || "-"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              {localData.additionalNotes && (
                <div className="space-y-3">
                  <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
                    Additional Notes
                  </h5>
                  <p className="text-sm">{localData.additionalNotes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Form view (editing or first-time review after auto-fill)
  if (!localData) return null

  return (
    <div className="mt-4 p-4 border border-[#407B9D]/30 rounded-lg bg-white">
      <div className="flex items-center justify-between mb-4">
        <h4
          className="text-lg font-medium text-[#463939]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          GrowthLab General Ledger Review
        </h4>
      </div>

      <div className="space-y-6">
        {/* Financial Accounts */}
        <div className="space-y-4">
          <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Financial Accounts (Bank Accounts, Credit Cards, Loans)
          </h5>

          <div className="space-y-3">
            {localData.accounts.slice(0, visibleAccounts).map((account, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-1 flex items-center justify-center">
                  <span className="text-sm text-muted-foreground font-medium">#{index + 1}</span>
                </div>
                <div className="md:col-span-7 space-y-1">
                  <Label htmlFor={`account-name-${index}`} className="text-xs text-muted-foreground">
                    Name of Institution & Type of Account{index === 0 && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id={`account-name-${index}`}
                    value={account.name}
                    onChange={(e) => handleAccountChange(index, "name", e.target.value)}
                    placeholder="e.g., Chase Business Checking"
                    className="border-gray-300 focus:border-[#407B9D] focus:ring-[#407B9D]"
                  />
                </div>
                <div className="md:col-span-3 space-y-1">
                  <Label htmlFor={`account-trx-${index}`} className="text-xs text-muted-foreground">
                    Transaction Count
                  </Label>
                  <Select
                    id={`account-trx-${index}`}
                    value={account.transactionCount}
                    onValueChange={(v) => handleAccountChange(index, "transactionCount", v)}
                    className="border-gray-300 focus:border-[#407B9D] focus:ring-[#407B9D]"
                  >
                    <option value="">Select...</option>
                    {TRANSACTION_COUNT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </div>
                <div className="md:col-span-1 flex items-center justify-center">
                  {(account.name || account.transactionCount) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearAccount(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {visibleAccounts < 20 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMoreAccounts}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add More Accounts
            </Button>
          )}
        </div>

        {/* eCommerce */}
        <div className="space-y-4">
          <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
            eCommerce (Check all that apply)
          </h5>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ECOMMERCE_PLATFORMS.map(platform => (
              <div key={platform.key} className="space-y-1">
                <Label htmlFor={`ecommerce-${platform.key}`} className="text-sm">
                  {platform.label}
                </Label>
                <Select
                  id={`ecommerce-${platform.key}`}
                  value={localData.ecommerce[platform.key]}
                  onValueChange={(v) => handleEcommerceChange(platform.key, v as ECommerceAccountCount)}
                  className="border-gray-300 focus:border-[#407B9D] focus:ring-[#407B9D]"
                >
                  {ECOMMERCE_ACCOUNT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue & Classes */}
        <div className="space-y-4">
          <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Revenue & Classes
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {renderLabel("revenueCoaAllocations", "Revenue COA Allocations (2 Included)", true)}
              <Select
                id="revenueCoaAllocations"
                value={localData.revenueCoaAllocations}
                onValueChange={(v) => handleFieldChange("revenueCoaAllocations", v)}
                className="border-gray-300 focus:border-[#407B9D] focus:ring-[#407B9D]"
              >
                <option value="">Select...</option>
                {REVENUE_COA_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              {renderLabel("activeClasses", "# of Active Classes", true)}
              <Select
                id="activeClasses"
                value={localData.activeClasses}
                onValueChange={(v) => handleFieldChange("activeClasses", v)}
                className="border-gray-300 focus:border-[#407B9D] focus:ring-[#407B9D]"
              >
                <option value="">Select...</option>
                {ACTIVE_CLASSES_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            {renderLabel("coaRevenueCategories", "List the customer's COA Revenue Categories", true)}
            <Textarea
              id="coaRevenueCategories"
              value={localData.coaRevenueCategories}
              onChange={(e) => handleFieldChange("coaRevenueCategories", e.target.value)}
              placeholder="e.g., Product Sales, Service Revenue, Subscription Revenue"
              rows={2}
              className="border-gray-300 focus:border-[#407B9D] focus:ring-[#407B9D]"
            />
          </div>
        </div>

        {/* Catchup Bookkeeping */}
        <div className="space-y-4">
          <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Catchup Bookkeeping
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {renderLabel("catchupRequired", "Is Catchup Bookkeeping required?", true)}
              <Select
                id="catchupRequired"
                value={localData.catchupRequired}
                onValueChange={(v) => handleFieldChange("catchupRequired", v)}
                className="border-gray-300 focus:border-[#407B9D] focus:ring-[#407B9D]"
              >
                <option value="">Select...</option>
                {YES_NO_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </div>

            {localData.catchupRequired === "yes" && (
              <div className="space-y-2">
                {renderLabel("catchupDateRange", "What is the Catchup Bookkeeping date range?")}
                <Input
                  id="catchupDateRange"
                  value={localData.catchupDateRange}
                  onChange={(e) => handleFieldChange("catchupDateRange", e.target.value)}
                  placeholder="e.g., January 2024 - Present"
                  className="border-gray-300 focus:border-[#407B9D] focus:ring-[#407B9D]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-4">
          <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Additional Notes
          </h5>
          <div className="space-y-2">
            {renderLabel("additionalNotes", "Additional Notes")}
            <Textarea
              id="additionalNotes"
              value={localData.additionalNotes}
              onChange={(e) => handleFieldChange("additionalNotes", e.target.value)}
              placeholder="Any additional notes or observations from the GL review..."
              rows={3}
              className="border-gray-300 focus:border-[#407B9D] focus:ring-[#407B9D]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={onReset}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Reset Form
          </Button>
          <div className="flex items-center gap-3">
            {isConfirmed && isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="text-gray-600 border-gray-300"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false)
                }
                onConfirm()
              }}
              className="bg-[#407B9D] hover:bg-[#366a88] text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isConfirmed ? "Save Changes" : "Confirm & Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
