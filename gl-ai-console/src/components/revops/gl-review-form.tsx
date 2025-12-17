"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import {
  GLReviewFormData,
  GLReviewFieldConfidence,
  ConfidenceLevel,
  TransactionCount,
  ECommerceAccountCount,
  FinancialAccount
} from "@/lib/sales-pipeline-timeline-types"
import { CheckCircle2, Eye, Pencil, RotateCw, Sparkles, Plus, Trash2 } from "lucide-react"
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
  fieldConfidence: GLReviewFieldConfidence | null
  onAutoFill: () => void
  onFormChange: (data: GLReviewFormData) => void
  onConfirm: () => void
  onReset: () => void
  isLoading?: boolean
}

// Confidence indicator component
function ConfidenceIndicator({ level }: { level: ConfidenceLevel }) {
  const config = {
    high: {
      color: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      label: "High"
    },
    medium: {
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      label: "Medium"
    },
    low: {
      color: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      label: "Low"
    }
  }

  const { color, textColor, bgColor, borderColor, label } = config[level]

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${bgColor} ${textColor} border ${borderColor}`}
      title={`AI Confidence: ${label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      {label}
    </span>
  )
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
  fieldConfidence,
  onAutoFill,
  onFormChange,
  onConfirm,
  onReset,
  isLoading = false,
}: GLReviewFormProps) {
  const [localData, setLocalData] = useState<GLReviewFormData | null>(formData)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [visibleAccounts, setVisibleAccounts] = useState(5)

  // Determine if we should show confidence indicators
  const showConfidence = isAutoFilled && !isConfirmed && !isEditing && fieldConfidence !== null

  // Helper to render label with optional confidence indicator
  const renderLabel = (htmlFor: string, text: string, fieldName: keyof GLReviewFormData, required = false) => {
    const confidence = showConfidence ? fieldConfidence?.[fieldName] : null
    return (
      <Label htmlFor={htmlFor} className="flex items-center gap-2 flex-wrap">
        <span>{text}{required && <span className="text-red-500">*</span>}</span>
        {confidence && <ConfidenceIndicator level={confidence} />}
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

  // If no form data and not confirmed, show auto-fill button
  if (!formData && !isConfirmed) {
    return (
      <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto text-[#407B9D] mb-3" />
          <h4
            className="text-lg font-medium text-[#463939] mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            General Ledger Review Form
          </h4>
          <p
            className="text-sm text-muted-foreground mb-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            AI will analyze the client&apos;s general ledger and auto-fill the GL Review form.
            You can review and adjust before confirming.
          </p>
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
                Auto-Fill with AI
              </>
            )}
          </Button>
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
              {/* Basic Information */}
              <div className="space-y-3">
                <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Basic Information
                </h5>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2 font-medium">{localData.email || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Company Name:</span>
                    <span className="ml-2 font-medium">{localData.companyName || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lead Name:</span>
                    <span className="ml-2 font-medium">{localData.leadName || "-"}</span>
                  </div>
                </div>
              </div>

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
        <div className="flex items-center gap-2">
          <h4
            className="text-lg font-medium text-[#463939]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            GrowthLab General Ledger Review
          </h4>
          {isAutoFilled && !isConfirmed && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/30">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Populated
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Basic Information
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              {renderLabel("email", "Email", "email", true)}
              <Input
                id="email"
                type="email"
                value={localData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                className="border-gray-300 focus:border-[#407B9D] focus:ring-[#407B9D]"
              />
            </div>
            <div className="space-y-2">
              {renderLabel("companyName", "Company Name", "companyName", true)}
              <Input
                id="companyName"
                value={localData.companyName}
                onChange={(e) => handleFieldChange("companyName", e.target.value)}
                className="border-gray-300 focus:border-[#407B9D] focus:ring-[#407B9D]"
              />
            </div>
            <div className="space-y-2">
              {renderLabel("leadName", "Lead Name", "leadName", true)}
              <Input
                id="leadName"
                value={localData.leadName}
                onChange={(e) => handleFieldChange("leadName", e.target.value)}
                className="border-gray-300 focus:border-[#407B9D] focus:ring-[#407B9D]"
              />
            </div>
          </div>
        </div>

        {/* Financial Accounts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h5 className="font-medium text-[#463939]" style={{ fontFamily: "var(--font-heading)" }}>
              Financial Accounts (Bank Accounts, Credit Cards, Loans)
            </h5>
            {showConfidence && fieldConfidence?.accounts && (
              <ConfidenceIndicator level={fieldConfidence.accounts} />
            )}
          </div>

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
                  {account.name && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAccountChange(index, "name", "")}
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
          <div className="flex items-center justify-between border-b pb-2">
            <h5 className="font-medium text-[#463939]" style={{ fontFamily: "var(--font-heading)" }}>
              eCommerce (Check all that apply)
            </h5>
            {showConfidence && fieldConfidence?.ecommerce && (
              <ConfidenceIndicator level={fieldConfidence.ecommerce} />
            )}
          </div>

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
              {renderLabel("revenueCoaAllocations", "Revenue COA Allocations (2 Included)", "revenueCoaAllocations", true)}
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
              {renderLabel("activeClasses", "# of Active Classes", "activeClasses", true)}
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
            {renderLabel("coaRevenueCategories", "List the customer's COA Revenue Categories", "coaRevenueCategories", true)}
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
              {renderLabel("catchupRequired", "Is Catchup Bookkeeping required?", "catchupRequired", true)}
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
                {renderLabel("catchupDateRange", "What is the Catchup Bookkeeping date range?", "catchupDateRange")}
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
            {renderLabel("additionalNotes", "Additional Notes", "additionalNotes")}
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
