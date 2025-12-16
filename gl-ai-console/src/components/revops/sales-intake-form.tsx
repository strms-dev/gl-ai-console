"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { SalesIntakeFormData, FieldConfidence, ConfidenceLevel } from "@/lib/sales-pipeline-timeline-types"
import { CheckCircle2, Eye, Pencil, RotateCw, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SalesIntakeFormProps {
  formData: SalesIntakeFormData | null
  isAutoFilled: boolean
  isConfirmed: boolean
  fieldConfidence: FieldConfidence | null
  onAutoFill: () => void
  onFormChange: (data: SalesIntakeFormData) => void
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

// Form field configuration for dropdowns
const ENTITY_TYPES = [
  { value: "non-profit", label: "Non Profit" },
  { value: "c-corp", label: "C-Corp" },
  { value: "s-corp", label: "S-Corp" },
  { value: "llc", label: "LLC" },
  { value: "other", label: "Other" },
]

const YES_NO_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
]

const ACCOUNTING_PLATFORM_OPTIONS = [
  { value: "qbo", label: "QuickBooks Online (QBO)" },
  { value: "xero", label: "Xero" },
  { value: "other", label: "Other" },
]

const ACCOUNTING_BASIS_OPTIONS = [
  { value: "cash", label: "Cash Basis Accounting" },
  { value: "accrual", label: "Accrual Accounting" },
  { value: "modified-cash", label: "Modified Cash Basis Accounting" },
]

const CADENCE_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "BiWeekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
]

const FINANCIALS_BEFORE_15TH_OPTIONS = [
  { value: "yes-board", label: "Yes - Need board reports" },
  { value: "yes-investors", label: "Yes - Need reports for investors/bankers" },
  { value: "yes-just-want", label: "Yes - Just want it" },
  { value: "no", label: "No" },
]

const REVIEW_FREQUENCY_OPTIONS = [
  { value: "none", label: "None" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "BiWeekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
]

const PAYROLL_PROVIDERS = [
  { value: "adp", label: "ADP" },
  { value: "gusto", label: "Gusto" },
  { value: "onpay", label: "OnPay" },
  { value: "paychex", label: "Paychex" },
  { value: "rippling", label: "Rippling" },
  { value: "justworks", label: "Justworks" },
  { value: "paycor", label: "Paycor" },
  { value: "zenefits", label: "Zenefits" },
  { value: "other", label: "Other" },
]

const DEPARTMENT_COUNTS = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
]

const EMPLOYEE_COUNTS = [
  { value: "0", label: "0" },
  { value: "1-5", label: "1-5" },
  { value: "6-20", label: "6-20" },
  { value: "21+", label: "21+" },
]

const EXPENSE_PLATFORMS = [
  { value: "divvy", label: "Divvy" },
  { value: "brex", label: "Brex" },
  { value: "ramp", label: "Ramp" },
  { value: "expensify", label: "Expensify" },
  { value: "hubdoc", label: "Hubdoc" },
  { value: "other", label: "Other" },
]

const EXPENSE_PLATFORM_EMPLOYEES = [
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
  { value: "10+", label: "10+" },
]

const BILLS_PER_MONTH_OPTIONS = [
  { value: "up-to-25", label: "Up to 25 / Month" },
  { value: "over-25", label: "Over 25 / Month" },
]

const INVOICING_CADENCE_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "BiWeekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
]

export function SalesIntakeForm({
  formData,
  isAutoFilled,
  isConfirmed,
  fieldConfidence,
  onAutoFill,
  onFormChange,
  onConfirm,
  onReset,
  isLoading = false,
}: SalesIntakeFormProps) {
  const [localData, setLocalData] = useState<SalesIntakeFormData | null>(formData)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Determine if we should show confidence indicators
  // Only show on first presentation of auto-filled data (not confirmed, not editing)
  const showConfidence = isAutoFilled && !isConfirmed && !isEditing && fieldConfidence !== null

  // Helper to render label with optional confidence indicator
  const renderLabel = (htmlFor: string, text: string, fieldName: keyof SalesIntakeFormData) => {
    const confidence = showConfidence ? fieldConfidence?.[fieldName] : null
    return (
      <Label htmlFor={htmlFor} className="flex items-center gap-2 flex-wrap">
        <span>{text}</span>
        {confidence && <ConfidenceIndicator level={confidence} />}
      </Label>
    )
  }

  // Sync local data with prop changes
  useEffect(() => {
    setLocalData(formData)
  }, [formData])

  // Reset editing state when confirmation status changes
  useEffect(() => {
    if (isConfirmed) {
      setIsEditing(false)
    }
  }, [isConfirmed])

  const handleFieldChange = (field: keyof SalesIntakeFormData, value: string) => {
    if (!localData) return

    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onFormChange(newData)
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
            Sales Intake Form
          </h4>
          <p
            className="text-sm text-muted-foreground mb-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            AI will analyze the demo call transcript and auto-fill the intake form.
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
                Sales Intake Confirmed
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
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>
                Sales Intake Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-3">
                <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Basic Information
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Company Name:</span>
                    <span className="ml-2 font-medium">{localData.companyName || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contact Name:</span>
                    <span className="ml-2 font-medium">{localData.contactName || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email Address:</span>
                    <span className="ml-2 font-medium">{localData.emailAddress || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Entity Type:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(ENTITY_TYPES, localData.entityType)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Restricted Grants:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(YES_NO_OPTIONS, localData.hasRestrictedGrants)}</span>
                  </div>
                </div>
              </div>

              {/* Accounting Platform */}
              <div className="space-y-3">
                <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Accounting Platform
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Uses QBO or Xero:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(YES_NO_OPTIONS, localData.usesQboOrXero)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accounting Platform:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(ACCOUNTING_PLATFORM_OPTIONS, localData.accountingPlatform)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accounting Basis:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(ACCOUNTING_BASIS_OPTIONS, localData.accountingBasis)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bookkeeping Cadence:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(CADENCE_OPTIONS, localData.bookkeepingCadence)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Financials Before 15th:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(FINANCIALS_BEFORE_15TH_OPTIONS, localData.needsFinancialsBefore15th)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Financial Review Frequency:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(REVIEW_FREQUENCY_OPTIONS, localData.financialReviewFrequency)}</span>
                  </div>
                </div>
              </div>

              {/* Payroll */}
              <div className="space-y-3">
                <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Payroll
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Payroll Provider:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(PAYROLL_PROVIDERS, localData.payrollProvider)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Has 401k:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(YES_NO_OPTIONS, localData.has401k)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Payroll Departments:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(DEPARTMENT_COUNTS, localData.payrollDepartments)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Employees on Payroll:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(EMPLOYEE_COUNTS, localData.employeeCount)}</span>
                  </div>
                </div>
              </div>

              {/* Expenses */}
              <div className="space-y-3">
                <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Expenses
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tracks Expenses by Employee:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(YES_NO_OPTIONS, localData.tracksExpensesByEmployee)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expense Platform:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(EXPENSE_PLATFORMS, localData.expensePlatform)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Employees on Expense Platform:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(EXPENSE_PLATFORM_EMPLOYEES, localData.expensePlatformEmployees)}</span>
                  </div>
                </div>
              </div>

              {/* Bill Pay */}
              <div className="space-y-3">
                <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Bill Pay
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Needs Bill Pay Support:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(YES_NO_OPTIONS, localData.needsBillPaySupport)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bill Pay Cadence:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(CADENCE_OPTIONS, localData.billPayCadence)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bills Per Month:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(BILLS_PER_MONTH_OPTIONS, localData.billsPerMonth)}</span>
                  </div>
                </div>
              </div>

              {/* Invoicing */}
              <div className="space-y-3">
                <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Invoicing
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Needs Invoicing Support:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(YES_NO_OPTIONS, localData.needsInvoicingSupport)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Invoicing Cadence:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(INVOICING_CADENCE_OPTIONS, localData.invoicingCadence)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Invoices Per Month:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(BILLS_PER_MONTH_OPTIONS, localData.invoicesPerMonth)}</span>
                  </div>
                </div>
              </div>

              {/* CFO Review */}
              <div className="space-y-3">
                <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  CFO Review
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Interested in Quarterly CFO Review:</span>
                    <span className="ml-2 font-medium">{getDisplayValue(YES_NO_OPTIONS, localData.interestedInCfoReview)}</span>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              {localData.additionalNotes && (
                <div className="space-y-3">
                  <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
                    Additional Notes
                  </h5>
                  <p className="text-sm text-[#463939] whitespace-pre-wrap">{localData.additionalNotes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Editable form
  return (
    <div className="mt-4 p-4 border border-[#407B9D]/30 rounded-lg bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isAutoFilled && !isEditing && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/30">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated
            </span>
          )}
          {isEditing && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/30">
              <Pencil className="w-3 h-3 mr-1" />
              Editing
            </span>
          )}
          <h4
            className="text-lg font-medium text-[#463939]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Sales Intake Form
          </h4>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "var(--font-body)" }}>
        {isEditing
          ? "Make your changes and click Save Changes to update the intake."
          : "Review the information below and make any necessary adjustments before confirming."
        }
      </p>

      {localData && (
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Basic Information
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {renderLabel("companyName", "Company Name", "companyName")}
                <Input
                  id="companyName"
                  value={localData.companyName}
                  onChange={(e) => handleFieldChange("companyName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                {renderLabel("contactName", "Contact Name", "contactName")}
                <Input
                  id="contactName"
                  value={localData.contactName}
                  onChange={(e) => handleFieldChange("contactName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                {renderLabel("emailAddress", "Email Address", "emailAddress")}
                <Input
                  id="emailAddress"
                  type="email"
                  value={localData.emailAddress}
                  onChange={(e) => handleFieldChange("emailAddress", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                {renderLabel("entityType", "What type of entity is your business?", "entityType")}
                <Select
                  value={localData.entityType}
                  onValueChange={(value) => handleFieldChange("entityType", value)}
                >
                  <option value="">Select entity type</option>
                  {ENTITY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                {renderLabel("hasRestrictedGrants", "Are there any restricted grants?", "hasRestrictedGrants")}
                <Select
                  value={localData.hasRestrictedGrants}
                  onValueChange={(value) => handleFieldChange("hasRestrictedGrants", value)}
                >
                  <option value="">Select</option>
                  {YES_NO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Accounting Platform */}
          <div className="space-y-4">
            <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Accounting Platform
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {renderLabel("usesQboOrXero", "Do you use QBO or Xero as your accounting platform?", "usesQboOrXero")}
                <Select
                  value={localData.usesQboOrXero}
                  onValueChange={(value) => handleFieldChange("usesQboOrXero", value)}
                >
                  <option value="">Select</option>
                  {YES_NO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                {renderLabel("accountingPlatform", "Which accounting platform do you use?", "accountingPlatform")}
                <Select
                  value={localData.accountingPlatform}
                  onValueChange={(value) => handleFieldChange("accountingPlatform", value)}
                >
                  <option value="">Select</option>
                  {ACCOUNTING_PLATFORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                {renderLabel("accountingBasis", "Is your accounting cash basis or accrual?", "accountingBasis")}
                <Select
                  value={localData.accountingBasis}
                  onValueChange={(value) => handleFieldChange("accountingBasis", value)}
                >
                  <option value="">Select</option>
                  {ACCOUNTING_BASIS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                {renderLabel("bookkeepingCadence", "What is your current bookkeeping cadence?", "bookkeepingCadence")}
                <Select
                  value={localData.bookkeepingCadence}
                  onValueChange={(value) => handleFieldChange("bookkeepingCadence", value)}
                >
                  <option value="">Select</option>
                  {CADENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                {renderLabel("needsFinancialsBefore15th", "Do you need your financials completed before the 15th?", "needsFinancialsBefore15th")}
                <Select
                  value={localData.needsFinancialsBefore15th}
                  onValueChange={(value) => handleFieldChange("needsFinancialsBefore15th", value)}
                >
                  <option value="">Select</option>
                  {FINANCIALS_BEFORE_15TH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                {renderLabel("financialReviewFrequency", "How often do you want to review your financials with your accounting team?", "financialReviewFrequency")}
                <Select
                  value={localData.financialReviewFrequency}
                  onValueChange={(value) => handleFieldChange("financialReviewFrequency", value)}
                >
                  <option value="">Select</option>
                  {REVIEW_FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Payroll */}
          <div className="space-y-4">
            <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Payroll
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {renderLabel("payrollProvider", "Who is your payroll provider?", "payrollProvider")}
                <Select
                  value={localData.payrollProvider}
                  onValueChange={(value) => handleFieldChange("payrollProvider", value)}
                >
                  <option value="">Select</option>
                  {PAYROLL_PROVIDERS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                {renderLabel("has401k", "Do employees have 401ks with the company?", "has401k")}
                <Select
                  value={localData.has401k}
                  onValueChange={(value) => handleFieldChange("has401k", value)}
                >
                  <option value="">Select</option>
                  {YES_NO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                {renderLabel("payrollDepartments", "How many departments is payroll allocated to?", "payrollDepartments")}
                <Select
                  value={localData.payrollDepartments}
                  onValueChange={(value) => handleFieldChange("payrollDepartments", value)}
                >
                  <option value="">Select</option>
                  {DEPARTMENT_COUNTS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                {renderLabel("employeeCount", "How many employees are paid through payroll?", "employeeCount")}
                <Select
                  value={localData.employeeCount}
                  onValueChange={(value) => handleFieldChange("employeeCount", value)}
                >
                  <option value="">Select</option>
                  {EMPLOYEE_COUNTS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="space-y-4">
            <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Expenses
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {renderLabel("tracksExpensesByEmployee", "Do you track and manage expenses by employee?", "tracksExpensesByEmployee")}
                <Select
                  value={localData.tracksExpensesByEmployee}
                  onValueChange={(value) => handleFieldChange("tracksExpensesByEmployee", value)}
                >
                  <option value="">Select</option>
                  {YES_NO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                {renderLabel("expensePlatform", "What expense platform do you use?", "expensePlatform")}
                <Select
                  value={localData.expensePlatform}
                  onValueChange={(value) => handleFieldChange("expensePlatform", value)}
                >
                  <option value="">Select</option>
                  {EXPENSE_PLATFORMS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                {renderLabel("expensePlatformEmployees", "How many employees are on your expense platform?", "expensePlatformEmployees")}
                <Select
                  value={localData.expensePlatformEmployees}
                  onValueChange={(value) => handleFieldChange("expensePlatformEmployees", value)}
                >
                  <option value="">Select</option>
                  {EXPENSE_PLATFORM_EMPLOYEES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Bill Pay */}
          <div className="space-y-4">
            <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Bill Pay
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {renderLabel("needsBillPaySupport", "Do you need bill pay support?", "needsBillPaySupport")}
                <Select
                  value={localData.needsBillPaySupport}
                  onValueChange={(value) => handleFieldChange("needsBillPaySupport", value)}
                >
                  <option value="">Select</option>
                  {YES_NO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                {renderLabel("billPayCadence", "What is your current bill pay cadence?", "billPayCadence")}
                <Select
                  value={localData.billPayCadence}
                  onValueChange={(value) => handleFieldChange("billPayCadence", value)}
                >
                  <option value="">Select</option>
                  {CADENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                {renderLabel("billsPerMonth", "How many bills per month do you pay?", "billsPerMonth")}
                <Select
                  value={localData.billsPerMonth}
                  onValueChange={(value) => handleFieldChange("billsPerMonth", value)}
                >
                  <option value="">Select</option>
                  {BILLS_PER_MONTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Invoicing */}
          <div className="space-y-4">
            <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Invoicing
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {renderLabel("needsInvoicingSupport", "Do you need invoicing support?", "needsInvoicingSupport")}
                <Select
                  value={localData.needsInvoicingSupport}
                  onValueChange={(value) => handleFieldChange("needsInvoicingSupport", value)}
                >
                  <option value="">Select</option>
                  {YES_NO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                {renderLabel("invoicingCadence", "What is your current invoicing cadence?", "invoicingCadence")}
                <Select
                  value={localData.invoicingCadence}
                  onValueChange={(value) => handleFieldChange("invoicingCadence", value)}
                >
                  <option value="">Select</option>
                  {INVOICING_CADENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                {renderLabel("invoicesPerMonth", "How many outbound invoices per month do you issue?", "invoicesPerMonth")}
                <Select
                  value={localData.invoicesPerMonth}
                  onValueChange={(value) => handleFieldChange("invoicesPerMonth", value)}
                >
                  <option value="">Select</option>
                  {BILLS_PER_MONTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* CFO Review */}
          <div className="space-y-4">
            <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
              CFO Review
            </h5>
            <div className="space-y-2">
              {renderLabel("interestedInCfoReview", "Are you interested in a Quarterly CFO Review?", "interestedInCfoReview")}
              <Select
                value={localData.interestedInCfoReview}
                onValueChange={(value) => handleFieldChange("interestedInCfoReview", value)}
                className="max-w-xs"
              >
                <option value="">Select</option>
                {YES_NO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h5 className="font-medium text-[#463939] border-b pb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Additional Information
            </h5>
            <div className="space-y-4">
              <div className="space-y-2">
                {renderLabel("additionalNotes", "Additional Notes", "additionalNotes")}
                <Textarea
                  id="additionalNotes"
                  value={localData.additionalNotes}
                  onChange={(e) => handleFieldChange("additionalNotes", e.target.value)}
                  rows={4}
                  placeholder="Any additional notes or context from the demo call..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setLocalData(formData)
                    setIsEditing(false)
                  }}
                  className="text-gray-600 border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    onConfirm()
                    setIsEditing(false)
                  }}
                  className="bg-[#407B9D] hover:bg-[#366a88] text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={onReset}
                  className="text-gray-600 border-gray-300"
                >
                  Reset
                </Button>
                <Button
                  onClick={onConfirm}
                  className="bg-[#407B9D] hover:bg-[#366a88] text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Intake
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
