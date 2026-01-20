/**
 * Sales Pricing Calculator
 *
 * Implements the complete pricing logic from the JotForm Sales Pricing Calculator.
 * Calculates monthly accounting service pricing based on client complexity.
 */

import { SalesIntakeFormData, GLReviewFormData, FinancialAccount, ECommerceData } from "./sales-pipeline-timeline-types"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PricingBreakdownItem {
  category: string        // e.g., "Cadence Base", "401k Plan", "Financial Accounts"
  description: string     // e.g., "Monthly x Priority (1.0)", "401k Administration"
  amount: number          // e.g., 100, 25, 150
  formula?: string        // Optional: e.g., "3 accounts x $50"
}

export interface PricingResult {
  monthlyPrice: number
  cleanupEstimate: number | null
  breakdown: PricingBreakdownItem[]
  cadence: string
  accountingMethod: string
  appliedMultiplier: number   // 1.0 for cash, 1.25 for accrual/modified
  priorityMultiplier: number  // 1.0 or 1.2
}

export interface PricingInput {
  // From Sales Intake
  accountingBasis: "cash" | "accrual" | "modified-cash" | ""
  bookkeepingCadence: "weekly" | "biweekly" | "monthly" | "quarterly" | ""
  needsFinancialsBefore15th: string  // 'yes-*' variants or 'no'
  financialReviewFrequency: "none" | "weekly" | "biweekly" | "monthly" | "quarterly" | ""
  has401k: "yes" | "no" | ""
  payrollDepartments: "0" | "1" | "2" | "3" | "4" | "5" | ""
  employeeCount: "0" | "1-5" | "6-20" | "21+" | ""
  tracksExpensesByEmployee: "yes" | "no" | ""
  expensePlatform: string
  needsBillPaySupport: "yes" | "no" | ""
  billPayCadence: "weekly" | "biweekly" | "monthly" | "quarterly" | ""
  billsPerMonth: "up-to-25" | "over-25" | ""
  needsInvoicingSupport: "yes" | "no" | ""
  invoicingCadence: "weekly" | "biweekly" | "monthly" | "quarterly" | "annually" | ""
  invoicesPerMonth: "up-to-25" | "over-25" | ""
  interestedInCfoReview: "yes" | "no" | ""

  // From GL Review
  accounts: FinancialAccount[]
  ecommerce: ECommerceData
  revenueCoaAllocations: "1-2" | "3-5" | ">5" | ""
  activeClasses: string  // '0' to '10'
  catchupRequired: "yes" | "no" | ""
  catchupDateRange: string
}

// ============================================================================
// PRICING CONSTANTS
// ============================================================================

// Cadence base prices by accounting method
const CADENCE_PRICES: Record<string, Record<string, number>> = {
  cash: { weekly: 300, biweekly: 300, monthly: 100, quarterly: 400 },
  "modified-cash": { weekly: 300, biweekly: 300, monthly: 200, quarterly: 200 },
  accrual: { weekly: 400, biweekly: 400, monthly: 300, quarterly: 300 }
}

// Default cadence prices (fallback)
const DEFAULT_CADENCE_PRICES: Record<string, number> = {
  weekly: 400,
  biweekly: 300,
  monthly: 200,
  quarterly: 100
}

// Financial review add-on prices
const REVIEW_PRICES: Record<string, number> = {
  weekly: 150,
  biweekly: 150,
  monthly: 150,
  quarterly: 75,
  none: 0,
  "": 0
}

// Payroll department allocation prices
const PAYROLL_DEPARTMENT_PRICES: Record<string, number> = {
  "0": 0,
  "1": 0,
  "2": 50,
  "3": 100,
  "4": 150,
  "5": 200,
  "": 0
}

// Employee count prices
const EMPLOYEE_COUNT_PRICES: Record<string, number> = {
  "0": 0,
  "1-5": 75,
  "6-20": 200,
  "21+": 500,
  "": 0
}

// Expense platform prices
const EXPENSE_PLATFORM_PRICES: Record<string, number> = {
  divvy: 50,
  brex: 50,
  ramp: 50,
  expensify: 100,
  hubdoc: 50,
  other: 50,
  "": 0
}

// Active classes prices (0-10)
const ACTIVE_CLASSES_PRICES: Record<string, number> = {
  "0": 0,
  "1": 0,
  "2": 50,
  "3": 100,
  "4": 150,
  "5": 200,
  "6": 250,
  "7": 300,
  "8": 350,
  "9": 400,
  "10": 450,
  "": 0
}

// Revenue COA allocation prices
const REVENUE_COA_PRICES: Record<string, number> = {
  "1-2": 0,
  "3-5": 150,
  ">5": 250,
  "": 0
}

// Transaction count prices per account
const TRANSACTION_COUNT_PRICES: Record<string, number> = {
  "<20": 25,
  "20-100": 50,
  ">100": 100,
  "": 0
}

// Cleanup intensity multipliers
const CLEANUP_INTENSITY: Record<string, number> = {
  cash: 0.3,
  "modified-cash": 0.75,
  accrual: 0.75
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determine the recommended bookkeeping cadence based on all factors
 */
function determineBookkeepingCadence(input: PricingInput): string {
  const cadencePriority: Record<string, number> = {
    weekly: 1,
    biweekly: 2,
    monthly: 3,
    quarterly: 4,
    annually: 5
  }

  // Get cadences from different sources
  const accountingCadence = input.bookkeepingCadence || "monthly"
  const billPayCadence = input.needsBillPaySupport === "yes" ? (input.billPayCadence || "monthly") : "quarterly"
  const invoicingCadence = input.needsInvoicingSupport === "yes" ? (input.invoicingCadence || "monthly") : "quarterly"

  // Find the most frequent (lowest priority number = most frequent)
  const cadences = [accountingCadence, billPayCadence, invoicingCadence]
  let minPriority = 5
  let recommendedCadence = "monthly"

  for (const cadence of cadences) {
    const priority = cadencePriority[cadence] || 4
    if (priority < minPriority) {
      minPriority = priority
      recommendedCadence = cadence
    }
  }

  return recommendedCadence
}

/**
 * Get cadence base price based on accounting method
 */
function getCadenceBasePrice(accountingBasis: string, cadence: string): number {
  const methodPrices = CADENCE_PRICES[accountingBasis] || CADENCE_PRICES.cash
  return methodPrices[cadence] || DEFAULT_CADENCE_PRICES[cadence] || 200
}

/**
 * Get priority multiplier (1.2x if needs financials by 15th)
 */
function getPriorityMultiplier(needsFinancialsBefore15th: string): number {
  // Any "yes-*" variant means they need it by the 15th
  if (needsFinancialsBefore15th.startsWith("yes")) {
    return 1.2
  }
  return 1.0
}

/**
 * Calculate financial accounts pricing
 */
function calculateFinancialAccountsPricing(
  accounts: FinancialAccount[]
): { total: number; breakdown: PricingBreakdownItem[] } {
  const filled = accounts.filter(a => a.name && a.name.trim() !== "")

  if (filled.length === 0) {
    return { total: 0, breakdown: [] }
  }

  // Count by transaction volume
  const counts = {
    "<20": 0,
    "20-100": 0,
    ">100": 0
  }

  for (const account of filled) {
    const txCount = account.transactionCount
    if (txCount === "<20") counts["<20"]++
    else if (txCount === "20-100") counts["20-100"]++
    else if (txCount === ">100") counts[">100"]++
    else counts["<20"]++ // Default to lowest tier if not set
  }

  const breakdown: PricingBreakdownItem[] = []
  let total = 0

  if (counts["<20"] > 0) {
    const amount = counts["<20"] * 25
    total += amount
    breakdown.push({
      category: "Financial Accounts (<20 TRX)",
      description: "Low transaction volume accounts",
      amount,
      formula: `${counts["<20"]} accounts x $25`
    })
  }

  if (counts["20-100"] > 0) {
    const amount = counts["20-100"] * 50
    total += amount
    breakdown.push({
      category: "Financial Accounts (20-100 TRX)",
      description: "Medium transaction volume accounts",
      amount,
      formula: `${counts["20-100"]} accounts x $50`
    })
  }

  if (counts[">100"] > 0) {
    const amount = counts[">100"] * 100
    total += amount
    breakdown.push({
      category: "Financial Accounts (>100 TRX)",
      description: "High transaction volume accounts",
      amount,
      formula: `${counts[">100"]} accounts x $100`
    })
  }

  return { total, breakdown }
}

/**
 * Calculate eCommerce pricing
 */
function calculateEcommercePricing(
  ecommerce: ECommerceData
): { total: number; count: number; breakdown: PricingBreakdownItem[] } {
  let totalAccounts = 0
  const platforms: string[] = []

  const platformNames: Record<keyof ECommerceData, string> = {
    amazon: "Amazon",
    shopify: "Shopify",
    square: "Square",
    etsy: "Etsy",
    ebay: "eBay",
    woocommerce: "WooCommerce",
    other: "Other"
  }

  for (const [key, value] of Object.entries(ecommerce)) {
    if (value && value !== "" && value !== "0") {
      const count = parseInt(value) || 0
      if (count > 0) {
        totalAccounts += count
        const platformName = platformNames[key as keyof ECommerceData] || key
        platforms.push(`${platformName} (${count})`)
      }
    }
  }

  const total = totalAccounts * 100
  const breakdown: PricingBreakdownItem[] = []

  if (total > 0) {
    breakdown.push({
      category: "eCommerce Platforms",
      description: platforms.join(", "),
      amount: total,
      formula: `${totalAccounts} accounts x $100`
    })
  }

  return { total, count: totalAccounts, breakdown }
}

/**
 * Estimate months from catchup date range
 */
function estimateCatchupMonths(dateRange: string): number {
  if (!dateRange) return 0

  // Try to parse date range like "Jan 2024 - Dec 2024" or "2024-01 to 2024-12"
  const monthMatch = dateRange.match(/(\d+)\s*months?/i)
  if (monthMatch) {
    return parseInt(monthMatch[1]) || 0
  }

  // Try to find year-month patterns
  const datePatterns = dateRange.match(/(\d{4}[-/]\d{1,2})/g) || []
  if (datePatterns.length >= 2) {
    const start = new Date(datePatterns[0])
    const end = new Date(datePatterns[1])
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
      return Math.max(0, months + 1) // +1 to include both months
    }
  }

  // Default to 3 months if we can't parse
  return 3
}

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

/**
 * Calculate accounting service pricing based on all inputs
 */
export function calculateAccountingPrice(input: PricingInput): PricingResult {
  const breakdown: PricingBreakdownItem[] = []

  // Determine accounting method (default to cash)
  const accountingMethod = input.accountingBasis || "cash"
  const isAccrualOrModified = accountingMethod === "accrual" || accountingMethod === "modified-cash"
  const methodMultiplier = isAccrualOrModified ? 1.25 : 1.0

  // Determine cadence
  const cadence = determineBookkeepingCadence(input)

  // Calculate priority multiplier
  const priorityMultiplier = getPriorityMultiplier(input.needsFinancialsBefore15th)

  // 1. Cadence Base Price
  const cadenceBase = getCadenceBasePrice(accountingMethod, cadence)
  const cadenceWithPriority = Math.round(cadenceBase * priorityMultiplier)

  breakdown.push({
    category: "Cadence Base",
    description: `${cadence.charAt(0).toUpperCase() + cadence.slice(1)} ${accountingMethod} basis`,
    amount: cadenceWithPriority,
    formula: priorityMultiplier > 1 ? `$${cadenceBase} x ${priorityMultiplier} (priority)` : undefined
  })

  // 2. Financial Review Add-on
  const reviewPrice = REVIEW_PRICES[input.financialReviewFrequency] || 0
  if (reviewPrice > 0) {
    breakdown.push({
      category: "Bookkeeping Reviews",
      description: `${input.financialReviewFrequency} review meetings`,
      amount: reviewPrice
    })
  }

  // 3. Financial Accounts
  const accountsPricing = calculateFinancialAccountsPricing(input.accounts)
  breakdown.push(...accountsPricing.breakdown)

  // 4. eCommerce Platforms
  const ecommercePricing = calculateEcommercePricing(input.ecommerce)
  breakdown.push(...ecommercePricing.breakdown)

  // 5. 401k
  const has401kPrice = input.has401k === "yes" ? 25 : 0
  if (has401kPrice > 0) {
    breakdown.push({
      category: "401k Plan",
      description: "401k administration support",
      amount: has401kPrice
    })
  }

  // 6. Payroll Employees
  const employeePrice = EMPLOYEE_COUNT_PRICES[input.employeeCount] || 0
  if (employeePrice > 0) {
    breakdown.push({
      category: "Payroll (Employees)",
      description: `${input.employeeCount} employees on payroll`,
      amount: employeePrice
    })
  }

  // 7. Payroll Department Allocation
  const deptPrice = PAYROLL_DEPARTMENT_PRICES[input.payrollDepartments] || 0
  if (deptPrice > 0) {
    breakdown.push({
      category: "Payroll Allocation",
      description: `${input.payrollDepartments} department${input.payrollDepartments !== "1" ? "s" : ""}`,
      amount: deptPrice
    })
  }

  // 8. Expense Platform
  let expensePrice = 0
  if (input.tracksExpensesByEmployee === "yes" && input.expensePlatform) {
    expensePrice = EXPENSE_PLATFORM_PRICES[input.expensePlatform] || 50
    breakdown.push({
      category: "Expense Tracking",
      description: `${input.expensePlatform.charAt(0).toUpperCase() + input.expensePlatform.slice(1)} platform`,
      amount: expensePrice
    })
  }

  // 9. Bill Pay Add-on
  let billPayPrice = 0
  if (input.needsBillPaySupport === "yes" && input.billsPerMonth) {
    billPayPrice = input.billsPerMonth === "over-25" ? 375 : 250
    breakdown.push({
      category: "Bill Pay Support",
      description: input.billsPerMonth === "over-25" ? "Over 25 bills/month" : "Up to 25 bills/month",
      amount: billPayPrice
    })
  }

  // 10. Invoicing Add-on
  let invoicingPrice = 0
  if (input.needsInvoicingSupport === "yes" && input.invoicesPerMonth) {
    invoicingPrice = input.invoicesPerMonth === "over-25" ? 450 : 250
    breakdown.push({
      category: "Invoicing Support",
      description: input.invoicesPerMonth === "over-25" ? "Over 25 invoices/month" : "Up to 25 invoices/month",
      amount: invoicingPrice
    })
  }

  // 11. Revenue COA Allocations
  const coaPrice = REVENUE_COA_PRICES[input.revenueCoaAllocations] || 0
  if (coaPrice > 0) {
    breakdown.push({
      category: "Revenue COA Allocations",
      description: input.revenueCoaAllocations === ">5" ? "5+ allocations (custom)" : `${input.revenueCoaAllocations} allocations`,
      amount: coaPrice
    })
  }

  // 12. Active Classes
  const classesPrice = ACTIVE_CLASSES_PRICES[input.activeClasses] || 0
  if (classesPrice > 0) {
    breakdown.push({
      category: "Active Classes",
      description: `${input.activeClasses} active class${input.activeClasses !== "1" ? "es" : ""}`,
      amount: classesPrice
    })
  }

  // Calculate subtotal (before method multiplier and CFO)
  const subtotalBeforeMultiplier =
    cadenceWithPriority +
    reviewPrice +
    accountsPricing.total +
    ecommercePricing.total +
    has401kPrice +
    employeePrice +
    deptPrice +
    expensePrice +
    billPayPrice +
    invoicingPrice +
    coaPrice +
    classesPrice

  // Apply accounting method multiplier (1.25x for accrual/modified-cash)
  let subtotalAfterMultiplier = subtotalBeforeMultiplier
  if (isAccrualOrModified) {
    subtotalAfterMultiplier = Math.round(subtotalBeforeMultiplier * methodMultiplier)
    breakdown.push({
      category: "Accounting Method Multiplier",
      description: `${accountingMethod === "accrual" ? "Accrual" : "Modified Cash"} basis adjustment`,
      amount: subtotalAfterMultiplier - subtotalBeforeMultiplier,
      formula: `Subtotal x 0.25 (1.25x total)`
    })
  }

  // 13. CFO Review (added after multiplier)
  const cfoPrice = input.interestedInCfoReview === "yes" ? 500 : 0
  if (cfoPrice > 0) {
    breakdown.push({
      category: "Quarterly CFO Review",
      description: "45-min quarterly strategic review",
      amount: cfoPrice
    })
  }

  // Final monthly price
  const monthlyPrice = subtotalAfterMultiplier + cfoPrice

  // Calculate cleanup estimate if needed
  let cleanupEstimate: number | null = null
  if (input.catchupRequired === "yes") {
    const intensity = CLEANUP_INTENSITY[accountingMethod] || 0.3
    const months = estimateCatchupMonths(input.catchupDateRange)
    if (months > 0) {
      cleanupEstimate = Math.round(monthlyPrice * intensity * months)
    }
  }

  return {
    monthlyPrice,
    cleanupEstimate,
    breakdown,
    cadence,
    accountingMethod: accountingMethod === "modified-cash" ? "Modified Cash" :
                      accountingMethod === "accrual" ? "Accrual" : "Cash",
    appliedMultiplier: methodMultiplier,
    priorityMultiplier
  }
}

/**
 * Build PricingInput from Sales Intake and GL Review data
 */
export function buildPricingInput(
  salesIntake: SalesIntakeFormData | null,
  glReview: GLReviewFormData | null
): PricingInput {
  return {
    // Sales Intake fields
    accountingBasis: salesIntake?.accountingBasis || "",
    bookkeepingCadence: salesIntake?.bookkeepingCadence || "",
    needsFinancialsBefore15th: salesIntake?.needsFinancialsBefore15th || "",
    financialReviewFrequency: salesIntake?.financialReviewFrequency || "",
    has401k: salesIntake?.has401k || "",
    payrollDepartments: salesIntake?.payrollDepartments || "",
    employeeCount: salesIntake?.employeeCount || "",
    tracksExpensesByEmployee: salesIntake?.tracksExpensesByEmployee || "",
    expensePlatform: salesIntake?.expensePlatform || "",
    needsBillPaySupport: salesIntake?.needsBillPaySupport || "",
    billPayCadence: salesIntake?.billPayCadence || "",
    billsPerMonth: salesIntake?.billsPerMonth || "",
    needsInvoicingSupport: salesIntake?.needsInvoicingSupport || "",
    invoicingCadence: salesIntake?.invoicingCadence || "",
    invoicesPerMonth: salesIntake?.invoicesPerMonth || "",
    interestedInCfoReview: salesIntake?.interestedInCfoReview || "",

    // GL Review fields
    accounts: glReview?.accounts || [],
    ecommerce: glReview?.ecommerce || { amazon: "", shopify: "", square: "", etsy: "", ebay: "", woocommerce: "", other: "" },
    revenueCoaAllocations: glReview?.revenueCoaAllocations || "",
    activeClasses: glReview?.activeClasses || "",
    catchupRequired: glReview?.catchupRequired || "",
    catchupDateRange: glReview?.catchupDateRange || ""
  }
}

/**
 * Format pricing result as human-readable text for backward compatibility
 */
export function formatPricingBreakdown(result: PricingResult): string {
  const lines: string[] = [
    `=== ${result.accountingMethod.toUpperCase()} BASIS PRICING ===`,
    `Recommended Cadence: ${result.cadence.charAt(0).toUpperCase() + result.cadence.slice(1)}`,
    `Priority Multiplier: ${result.priorityMultiplier}x${result.priorityMultiplier > 1 ? " (financials needed by 15th)" : ""}`,
    `Accounting Method Multiplier: ${result.appliedMultiplier}x`,
    "",
    "--- BREAKDOWN ---",
    ""
  ]

  for (const item of result.breakdown) {
    const amountStr = `$${item.amount.toLocaleString()}`
    if (item.formula) {
      lines.push(`${item.category}: ${amountStr}`)
      lines.push(`  (${item.formula})`)
    } else {
      lines.push(`${item.category}: ${amountStr}`)
      if (item.description && item.description !== item.category) {
        lines.push(`  (${item.description})`)
      }
    }
  }

  lines.push("")
  lines.push("--- TOTAL ---")
  lines.push(`Monthly Price: $${result.monthlyPrice.toLocaleString()}`)

  if (result.cleanupEstimate !== null && result.cleanupEstimate > 0) {
    lines.push("")
    lines.push("--- CLEANUP ESTIMATE ---")
    lines.push(`One-time Cleanup: $${result.cleanupEstimate.toLocaleString()}`)
  }

  return lines.join("\n")
}
