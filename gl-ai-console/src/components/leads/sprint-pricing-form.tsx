"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"

interface SprintPricingFormProps {
  onConfirm: (data: { sprintLength: string; price: number; explanation: string }) => void
  onCancel?: () => void
  initialData?: { sprintLength: string; price: number; explanation: string }
  isAdjustmentMode?: boolean
}

const SPRINT_OPTIONS = [
  { value: "0.5", label: "1/2 Sprint (2.5 Days)", price: 2000 },
  { value: "1", label: "1x Sprint (5 Days)", price: 4000 },
  { value: "1.5", label: "1.5x Sprint (7.5 Days)", price: 6000 },
  { value: "2", label: "2x Sprint (10 Days)", price: 8000 }
]

const generateRandomExplanation = (sprintLength: string) => {
  const explanations = {
    "0.5": "Based on the project requirements, a half sprint is recommended as this appears to be a straightforward automation with minimal complexity. The scope involves basic workflow integration that can be efficiently completed within 2.5 days.",
    "1": "A full sprint is recommended for this project due to moderate complexity requirements. The automation involves multiple system integrations and custom workflow logic that will benefit from the standard 5-day development cycle.",
    "1.5": "An extended sprint of 7.5 days is recommended given the complexity of the required integrations and the need for thorough testing. This project involves multiple third-party APIs and custom business logic that requires additional development time.",
    "2": "A two-sprint timeline is recommended for this comprehensive automation project. The scope includes complex multi-system integrations, custom reporting features, and extensive testing requirements that justify the 10-day development period."
  }

  return explanations[sprintLength as keyof typeof explanations] || explanations["1"]
}

export function SprintPricingForm({ onConfirm, onCancel, initialData, isAdjustmentMode = false }: SprintPricingFormProps) {
  const [sprintLength, setSprintLength] = useState("1")
  const [price, setPrice] = useState(4000)
  const [explanation, setExplanation] = useState(generateRandomExplanation("1"))

  // Initialize with provided data or randomly select initial values on client side
  useEffect(() => {
    if (initialData) {
      // Use provided initial data
      setSprintLength(initialData.sprintLength)
      setPrice(initialData.price)
      setExplanation(isAdjustmentMode ? "" : initialData.explanation)
    } else {
      // Randomly select initial values
      const randomIndex = Math.floor(Math.random() * SPRINT_OPTIONS.length)
      const initialOption = SPRINT_OPTIONS[randomIndex]
      setSprintLength(initialOption.value)
      setPrice(initialOption.price)
      setExplanation(isAdjustmentMode ? "" : generateRandomExplanation(initialOption.value))
    }
  }, [initialData, isAdjustmentMode])

  const handleSprintLengthChange = (value: string) => {
    setSprintLength(value)
    const selectedOption = SPRINT_OPTIONS.find(option => option.value === value)
    if (selectedOption) {
      setPrice(selectedOption.price)
      if (!isAdjustmentMode) {
        setExplanation(generateRandomExplanation(value))
      }
    }
  }

  const handleConfirm = () => {
    onConfirm({
      sprintLength,
      price,
      explanation
    })
  }

  const selectedOption = SPRINT_OPTIONS.find(option => option.value === sprintLength)

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          Sprint Length & Price Estimate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Generated Notice */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤖</span>
            <p className="text-sm font-medium text-blue-800">AI-Generated Estimates</p>
          </div>
          <p className="text-xs text-blue-700">
            These estimates have been automatically generated based on the project requirements. You can review and adjust them before confirming.
          </p>
        </div>

        {/* Sprint Length Selection */}
        <div className="space-y-2">
          <label htmlFor="sprint-length" className="text-sm font-medium">
            Sprint Length
          </label>
          <Select id="sprint-length" value={sprintLength} onValueChange={handleSprintLengthChange}>
            {SPRINT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Price Display/Edit */}
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium">
            Price (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="pl-7"
              min="0"
              step="100"
            />
          </div>
          {selectedOption && (
            <p className="text-xs text-gray-500">
              Default price for {selectedOption.label}: ${selectedOption.price.toLocaleString()}
            </p>
          )}
        </div>

        {/* Explanation */}
        <div className="space-y-2">
          <label htmlFor="explanation" className="text-sm font-medium">
            {isAdjustmentMode ? "Reasoning for Adjustment" : "Explanation"}
          </label>
          {isAdjustmentMode ? (
            <>
              <textarea
                id="explanation"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-vertical min-h-[100px] text-sm"
                placeholder="Please explain the reasoning for adjusting the sprint length and/or price..."
              />
              <p className="text-xs text-gray-500">
                Provide details about why the sprint length or price needed to be adjusted.
              </p>
            </>
          ) : (
            <>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {explanation}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                This explanation describes why the selected sprint length was recommended for this project.
              </p>
            </>
          )}
        </div>

        {/* Summary Card */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Estimate Summary</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sprint Length:</span>
              <span className="font-medium">{selectedOption?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Price:</span>
              <span className="font-medium text-green-600">${price.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            className={`${onCancel ? 'flex-1' : 'w-full'} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0`}
          >
            ✅ Confirm Estimate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}