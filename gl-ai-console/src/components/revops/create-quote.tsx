"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  CreateQuoteStageData,
  QuoteLineItem,
  GLReviewFormData,
  PricingBreakdownItem
} from "@/lib/sales-pipeline-timeline-types"
import {
  CheckCircle2,
  Calculator,
  Plus,
  Trash2,
  Pencil,
  X,
  DollarSign,
  ExternalLink,
  RotateCw,
  ArrowRight,
  TrendingUp,
  Clock,
  AlertCircle
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CreateQuoteProps {
  quoteData: CreateQuoteStageData
  glReviewData: GLReviewFormData | null
  companyName: string
  onInitializeQuote: () => void
  onAddLineItem: (service: string, description: string, monthlyPrice: number) => void
  onUpdateLineItem: (itemId: string, updates: Partial<Omit<QuoteLineItem, 'id'>>) => void
  onRemoveLineItem: (itemId: string) => void
  onPushToHubspot: () => void
  onConfirmQuote: () => void
}

export function CreateQuote({
  quoteData,
  glReviewData,
  companyName,
  onInitializeQuote,
  onAddLineItem,
  onUpdateLineItem,
  onRemoveLineItem,
  onPushToHubspot,
  onConfirmQuote
}: CreateQuoteProps) {
  const [isAddingService, setIsAddingService] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [showBreakdownModal, setShowBreakdownModal] = useState(false)
  const [isPushingToHubspot, setIsPushingToHubspot] = useState(false)

  // New service form
  const [newServiceName, setNewServiceName] = useState("")
  const [newServiceDescription, setNewServiceDescription] = useState("")
  const [newServicePrice, setNewServicePrice] = useState("")

  // Edit form
  const [editServiceName, setEditServiceName] = useState("")
  const [editServiceDescription, setEditServiceDescription] = useState("")
  const [editServicePrice, setEditServicePrice] = useState("")

  // Track initialization
  const hasInitialized = useRef(false)

  // Initialize quote when component mounts
  useEffect(() => {
    if (!quoteData.accountingMonthlyPrice && glReviewData && !hasInitialized.current) {
      hasInitialized.current = true
      onInitializeQuote()
    }
  }, [quoteData.accountingMonthlyPrice, glReviewData, onInitializeQuote])

  const handleAddService = () => {
    const price = parseFloat(newServicePrice)
    if (!newServiceName.trim() || isNaN(price) || price <= 0) {
      return
    }

    onAddLineItem(
      newServiceName.trim(),
      newServiceDescription.trim(),
      price
    )

    setNewServiceName("")
    setNewServiceDescription("")
    setNewServicePrice("")
    setIsAddingService(false)
  }

  const handleStartEdit = (item: QuoteLineItem) => {
    setEditingItemId(item.id)
    setEditServiceName(item.service || "")
    setEditServiceDescription(item.description || "")
    setEditServicePrice((item.monthlyPrice || 0).toString())
  }

  const handleSaveEdit = () => {
    if (!editingItemId) return

    const price = parseFloat(editServicePrice)
    if (!editServiceName.trim() || isNaN(price) || price <= 0) {
      return
    }

    onUpdateLineItem(editingItemId, {
      service: editServiceName.trim(),
      description: editServiceDescription.trim(),
      monthlyPrice: price
    })

    setEditingItemId(null)
  }

  const handleCancelEdit = () => {
    setEditingItemId(null)
    setEditServiceName("")
    setEditServiceDescription("")
    setEditServicePrice("")
  }

  const handlePushToHubspot = () => {
    setIsPushingToHubspot(true)
    onPushToHubspot()
    // Loading state will be cleared when quoteData.hubspotSynced becomes true
  }

  // Clear loading state when HubSpot sync completes
  useEffect(() => {
    if (quoteData.hubspotSynced && isPushingToHubspot) {
      setIsPushingToHubspot(false)
    }
  }, [quoteData.hubspotSynced, isPushingToHubspot])

  const isConfirmed = !!quoteData.quoteConfirmedAt
  const isHubspotSynced = !!quoteData.hubspotSynced

  // Separate monthly and one-time items
  const monthlyItems = quoteData.lineItems.filter(item => !item.isOneTime)
  const oneTimeItems = quoteData.lineItems.filter(item => item.isOneTime)

  // Calculate totals
  const totalMonthly = monthlyItems.reduce((sum, item) => sum + (item.monthlyPrice || 0), 0)
  const totalOneTime = oneTimeItems.reduce((sum, item) => sum + (item.monthlyPrice || 0), 0)

  // If quote is confirmed, show completed state
  if (isConfirmed) {
    return (
      <div className="mt-4 p-4 border border-[#C8E4BB] rounded-lg bg-[#C8E4BB]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#5A8A4A]" />
            <h4
              className="text-lg font-medium text-[#463939]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Quote Confirmed
            </h4>
          </div>
          <div className="text-lg font-bold text-[#5A8A4A]">
            ${totalMonthly.toLocaleString()}/mo
          </div>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          <p>
            Confirmed on {quoteData.quoteConfirmedAt ? new Date(quoteData.quoteConfirmedAt).toLocaleDateString() : ""}
          </p>
          <p className="mt-2">
            {quoteData.lineItems.length} service{quoteData.lineItems.length !== 1 ? "s" : ""} included
          </p>
          {quoteData.hubspotSynced && quoteData.hubspotSyncedAt && (
            <p className="mt-1 text-[#5A8A4A]">
              Synced to HubSpot on {new Date(quoteData.hubspotSyncedAt).toLocaleDateString()}
            </p>
          )}
          {quoteData.hubspotQuoteLink && (
            <a
              href={quoteData.hubspotQuoteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-2 text-sm text-[#407B9D] hover:text-[#366a88] hover:underline"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Quote in HubSpot
            </a>
          )}
        </div>

        {/* Summary Table */}
        <div className="mt-4 border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Service</th>
                <th className="px-4 py-2 text-right font-medium text-gray-600">Price</th>
              </tr>
            </thead>
            <tbody>
              {/* Monthly recurring items */}
              {monthlyItems.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">
                    <p className="font-medium">{item.service}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    ${(item.monthlyPrice || 0).toLocaleString()}/mo
                  </td>
                </tr>
              ))}
              {monthlyItems.length > 0 && (
                <tr className="border-t bg-gray-50 font-bold">
                  <td className="px-4 py-2">Total Monthly</td>
                  <td className="px-4 py-2 text-right">${(totalMonthly || 0).toLocaleString()}/mo</td>
                </tr>
              )}
              {/* One-time items */}
              {oneTimeItems.length > 0 && (
                <>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={2} className="px-4 py-1 text-xs font-medium text-amber-700 bg-amber-50">
                      One-Time Fees
                    </td>
                  </tr>
                  {oneTimeItems.map((item) => (
                    <tr key={item.id} className="border-t bg-amber-50/50">
                      <td className="px-4 py-2">
                        <p className="font-medium">{item.service}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-amber-700">
                        ${(item.monthlyPrice || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // If no price calculated yet, show loading
  if (!quoteData.accountingMonthlyPrice) {
    return (
      <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-center">
          <RotateCw className="w-12 h-12 mx-auto text-[#407B9D] mb-3 animate-spin" />
          <h4
            className="text-lg font-medium text-[#463939] mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Calculating Quote...
          </h4>
          <p className="text-sm text-muted-foreground">
            Analyzing GL Review data to generate pricing recommendation.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 border border-[#407B9D]/30 rounded-lg bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#407B9D]" />
          <h4
            className="text-lg font-medium text-[#463939]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Create Quote for {companyName}
          </h4>
          {quoteData.isEdited && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/30">
              <Pencil className="w-3 h-3 mr-1" />
              Edited
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "var(--font-body)" }}>
        Review the auto-calculated accounting price, add any additional services, then confirm the quote.
      </p>

      {/* Auto-calculated Accounting Price Card */}
      <div className="mb-4 p-4 bg-[#407B9D]/5 border border-[#407B9D]/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#407B9D]">Base Accounting Services</p>
            <p className="text-xs text-muted-foreground mt-1">
              Auto-calculated based on Sales Intake &amp; GL Review data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#407B9D]">
              ${quoteData.accountingMonthlyPrice.toLocaleString()}/mo
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBreakdownModal(true)}
              className="text-[#407B9D] hover:bg-[#407B9D]/10 h-8"
            >
              View Breakdown
            </Button>
          </div>
        </div>

        {/* Pricing Metadata Pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {quoteData.accountingMethod && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-white border border-[#407B9D]/30 text-[#407B9D]">
              <Calculator className="w-3 h-3 mr-1" />
              {quoteData.accountingMethod} Basis
            </span>
          )}
          {quoteData.recommendedCadence && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-white border border-[#407B9D]/30 text-[#407B9D]">
              <Clock className="w-3 h-3 mr-1" />
              {quoteData.recommendedCadence.charAt(0).toUpperCase() + quoteData.recommendedCadence.slice(1)} Cadence
            </span>
          )}
          {quoteData.priorityMultiplier && quoteData.priorityMultiplier > 1 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-amber-100 border border-amber-300 text-amber-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              Priority ({quoteData.priorityMultiplier}x)
            </span>
          )}
          {quoteData.appliedMultiplier && quoteData.appliedMultiplier > 1 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-100 border border-purple-300 text-purple-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              Accrual Multiplier ({quoteData.appliedMultiplier}x)
            </span>
          )}
        </div>
      </div>

      {/* Quote Line Items Table */}
      <div className="mb-4 border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Service</th>
              <th className="px-4 py-2 text-right font-medium text-gray-600">Price</th>
              <th className="px-4 py-2 text-center font-medium text-gray-600 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Monthly recurring items */}
            {monthlyItems.map((item) => (
              <tr key={item.id} className="border-t">
                {editingItemId === item.id ? (
                  // Edit mode
                  <>
                    <td className="px-4 py-2">
                      <div className="space-y-2">
                        <Input
                          value={editServiceName || ""}
                          onChange={(e) => setEditServiceName(e.target.value)}
                          placeholder="Service name"
                          className="h-8"
                        />
                        <Input
                          value={editServiceDescription || ""}
                          onChange={(e) => setEditServiceDescription(e.target.value)}
                          placeholder="Description (optional)"
                          className="h-8 text-xs"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">$</span>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={editServicePrice || ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "")
                            setEditServicePrice(val)
                          }}
                          className="h-8 w-24 text-right [appearance:textfield]"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSaveEdit}
                          className="h-7 w-7 p-0 text-[#5A8A4A] hover:text-[#5A8A4A] hover:bg-[#C8E4BB]/30"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </>
                ) : (
                  // Display mode
                  <>
                    <td className="px-4 py-2">
                      <p className="font-medium">{item.service}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                      {item.isCustom && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600 mt-1">
                          Custom
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      ${(item.monthlyPrice || 0).toLocaleString()}/mo
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(item)}
                          className="h-7 w-7 p-0 text-[#407B9D] hover:text-[#366a88] hover:bg-[#407B9D]/10"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {item.isCustom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveLineItem(item.id)}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {quoteData.lineItems.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No services added yet
                </td>
              </tr>
            )}
            {/* Total Monthly Row */}
            {monthlyItems.length > 0 && (
              <tr className="border-t bg-gray-50 font-bold">
                <td className="px-4 py-2">Total Monthly</td>
                <td className="px-4 py-2 text-right text-[#407B9D]">
                  ${totalMonthly.toLocaleString()}/mo
                </td>
                <td></td>
              </tr>
            )}
            {/* One-time items section */}
            {oneTimeItems.length > 0 && (
              <>
                <tr className="border-t-2 border-gray-300">
                  <td colSpan={3} className="px-4 py-1 text-xs font-medium text-amber-700 bg-amber-50">
                    One-Time Fees
                  </td>
                </tr>
                {oneTimeItems.map((item) => (
                  <tr key={item.id} className="border-t bg-amber-50/50">
                    {editingItemId === item.id ? (
                      // Edit mode for one-time items
                      <>
                        <td className="px-4 py-2">
                          <div className="space-y-2">
                            <Input
                              value={editServiceName || ""}
                              onChange={(e) => setEditServiceName(e.target.value)}
                              placeholder="Service name"
                              className="h-8"
                            />
                            <Input
                              value={editServiceDescription || ""}
                              onChange={(e) => setEditServiceDescription(e.target.value)}
                              placeholder="Description (optional)"
                              className="h-8 text-xs"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">$</span>
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={editServicePrice || ""}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, "")
                                setEditServicePrice(val)
                              }}
                              className="h-8 w-24 text-right [appearance:textfield]"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleSaveEdit}
                              className="h-7 w-7 p-0 text-[#5A8A4A] hover:text-[#5A8A4A] hover:bg-[#C8E4BB]/30"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // Display mode for one-time items
                      <>
                        <td className="px-4 py-2">
                          <p className="font-medium">{item.service}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right font-medium text-amber-700">
                          ${(item.monthlyPrice || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartEdit(item)}
                              className="h-7 w-7 p-0 text-[#407B9D] hover:text-[#366a88] hover:bg-[#407B9D]/10"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Custom Service */}
      {isAddingService ? (
        <div className="mb-4 p-4 border-2 border-dashed border-[#407B9D] rounded-lg bg-[#407B9D]/5">
          <h5 className="text-sm font-medium mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            Add Custom Service
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="serviceName" className="text-xs">Service Name</Label>
              <Input
                id="serviceName"
                value={newServiceName || ""}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="e.g., FP&A Support"
                className="h-8 mt-1"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="serviceDesc" className="text-xs">Description (Optional)</Label>
              <Input
                id="serviceDesc"
                value={newServiceDescription || ""}
                onChange={(e) => setNewServiceDescription(e.target.value)}
                placeholder="Brief description"
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="servicePrice" className="text-xs">Monthly Price</Label>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-gray-500">$</span>
                <Input
                  id="servicePrice"
                  type="text"
                  inputMode="numeric"
                  value={newServicePrice || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "")
                    setNewServicePrice(val)
                  }}
                  placeholder="0"
                  className="h-8 [appearance:textfield]"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAddingService(false)
                setNewServiceName("")
                setNewServiceDescription("")
                setNewServicePrice("")
              }}
              className="h-7"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddService}
              disabled={!newServiceName.trim() || !newServicePrice || parseFloat(newServicePrice) <= 0}
              className="h-7 bg-[#407B9D] hover:bg-[#366a88] text-white"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Service
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setIsAddingService(true)}
          className="w-full mb-4 border-dashed border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D]/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Service
        </Button>
      )}

      {/* HubSpot Integration & Confirm Section */}
      <div className="pt-4 border-t">
        {!isHubspotSynced ? (
          // Push to HubSpot button
          <Button
            onClick={handlePushToHubspot}
            disabled={quoteData.lineItems.length === 0 || isPushingToHubspot}
            className="w-full bg-[#407B9D] hover:bg-[#366a88] text-white"
          >
            {isPushingToHubspot ? (
              <>
                <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                Creating Quote in HubSpot...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Push Line Items &amp; Create Quote in HubSpot
              </>
            )}
          </Button>
        ) : (
          // Step 2: HubSpot synced - show link and confirm button
          <div className="space-y-4">
            {/* HubSpot Quote Details */}
            <div className="p-4 bg-[#C8E4BB]/20 rounded-lg border border-[#C8E4BB]">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-[#5A8A4A]" />
                <h5 className="text-sm font-medium text-[#5A8A4A]" style={{ fontFamily: "var(--font-heading)" }}>
                  Quote Created in HubSpot
                </h5>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={quoteData.hubspotQuoteLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-white border border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D]/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Quote in HubSpot
                </a>
              </div>
              {quoteData.hubspotSyncedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Created on {new Date(quoteData.hubspotSyncedAt).toLocaleDateString()} at {new Date(quoteData.hubspotSyncedAt).toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Confirm Button */}
            <Button
              onClick={onConfirmQuote}
              className="w-full bg-[#5A8A4A] hover:bg-[#4a7a3a] text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm Quote &amp; Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      {/* Price Breakdown Modal */}
      <Dialog open={showBreakdownModal} onOpenChange={setShowBreakdownModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>
              Price Calculation Breakdown
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {/* Pricing Metadata Header */}
            <div className="mb-4 p-3 bg-[#407B9D]/10 rounded-lg border border-[#407B9D]/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Accounting Method</p>
                  <p className="font-medium text-[#463939]">{quoteData.accountingMethod || "Cash"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cadence</p>
                  <p className="font-medium text-[#463939]">
                    {quoteData.recommendedCadence ?
                      quoteData.recommendedCadence.charAt(0).toUpperCase() + quoteData.recommendedCadence.slice(1) :
                      "Monthly"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Priority Multiplier</p>
                  <p className="font-medium text-[#463939]">{quoteData.priorityMultiplier || 1.0}x</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Method Multiplier</p>
                  <p className="font-medium text-[#463939]">{quoteData.appliedMultiplier || 1.0}x</p>
                </div>
              </div>
            </div>

            {/* Structured Breakdown Table */}
            {quoteData.accountingPriceBreakdownData && quoteData.accountingPriceBreakdownData.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Category</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Details</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quoteData.accountingPriceBreakdownData.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2 font-medium text-[#463939]">{item.category}</td>
                        <td className="px-4 py-2 text-muted-foreground">
                          <p>{item.description}</p>
                          {item.formula && (
                            <p className="text-xs text-[#407B9D] mt-0.5">{item.formula}</p>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right font-medium text-[#463939]">
                          ${item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t bg-[#407B9D]/10 font-bold">
                      <td className="px-4 py-3" colSpan={2}>Monthly Total</td>
                      <td className="px-4 py-3 text-right text-[#407B9D] text-lg">
                        ${quoteData.accountingMonthlyPrice?.toLocaleString() || 0}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              /* Fallback to text breakdown */
              <div className="p-4 bg-gray-50 rounded-lg border">
                <pre className="whitespace-pre-wrap font-sans text-sm text-[#463939]">
                  {quoteData.accountingPriceBreakdown || "No breakdown available"}
                </pre>
              </div>
            )}

            {/* Cleanup Estimate */}
            {quoteData.cleanupEstimate && quoteData.cleanupEstimate > 0 && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Cleanup/Catchup Estimate</p>
                      <p className="text-xs text-amber-600">One-time fee for historical cleanup</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-amber-700">
                    ${quoteData.cleanupEstimate.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-4">
              Pricing calculated based on the Sales Pricing Calculator formulas using Sales Intake and GL Review data.
            </p>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowBreakdownModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
