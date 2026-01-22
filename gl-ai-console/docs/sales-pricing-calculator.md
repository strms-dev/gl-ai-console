# Sales Pricing Calculator Documentation

## Overview

The Sales Pricing Calculator is a JotForm-based tool used by GrowthLab sales team members to calculate monthly accounting service pricing for prospective clients. The form collects information about a client's business structure, accounting needs, and service requirements to generate pricing estimates for Cash Basis, Modified Cash Basis, and Accrual Accounting services.

## Form Purpose

This calculator helps sales representatives:
- Determine appropriate service cadence (Weekly, BiWeekly, Monthly, Quarterly)
- Calculate monthly recurring accounting fees based on client complexity
- Estimate catchup/cleanup bookkeeping costs for new clients
- Generate pricing quotes that account for various add-on services

---

## Form Sections

### 1. Sales Questions (Lead Information)

Basic lead capture and business classification:

| Field | Description |
|-------|-------------|
| Who is submitting this form? | Sales rep selection (Dan Gertrudes, Sean Guerin, Tim Scullion, Charlotte Geisler, Tracy Wood) |
| Company Name | Lead's company name |
| Lead Name | First and Last name of contact |
| Email of Lead | Contact email |
| Entity Type | Non Profit, C-Corp, S-Corp, LLC, Other |
| Restricted Grants | (Non-profit only) Yes/No |
| Accounting Method | Cash Basis, Accrual, or Modified Cash Basis |
| Priority | Does client need financials by the 15th of the following month? (affects pricing multiplier) |

**Hidden Fields:**
- Hubspot Deal ID
- Airtable Lead Record ID

### 2. Payroll & Employee Information

| Field | Options | Pricing Impact |
|-------|---------|----------------|
| Payroll Provider | ADP, Gusto, OnPay, Paychex, Rippling, Justworks, Paycor, Zenefits, Other | Informational |
| Payroll Frequency | Weekly, Biweekly, Semi-monthly, Monthly | Informational |
| Payroll Day | Day of week | Informational |
| 401k Plan | Yes (+$25) / No | +$25/month if Yes |
| Payroll Allocation Departments | 0-5 departments | 0=$0, 1=$0, 2=$50, 3=$100, 4=$150, 5=$200 |
| Employees on Payroll | 0, 1-5 (+$75), 6-20 (+$200), 21+ (+$500) | Variable pricing |

### 3. Expense Tracking

| Field | Options | Pricing Impact |
|-------|---------|----------------|
| Track expenses by employee? | Yes/No | Shows additional fields if Yes |
| Expense Platform | Divvy ($50), Brex ($50), Ramp ($50), Expensify ($100), Hubdoc ($50) | Platform-specific pricing |
| Employees on expense platform | 1-10+ | Informational |

### 4. Bill Pay Support

| Field | Options | Pricing Impact |
|-------|---------|----------------|
| Need bill pay support? | Yes/No | Shows additional fields if Yes |
| Bill Pay Cadence | Weekly, BiWeekly, Monthly, Quarterly | Affects recommended cadence |
| Monthly Bills | Up to 25/Month (+$250), Over 25/Month (+$375) | Add-on pricing |

### 5. Invoicing Support

| Field | Options | Pricing Impact |
|-------|---------|----------------|
| Need invoicing support? | Yes/No | Shows additional fields if Yes |
| Invoicing Cadence | Weekly, BiWeekly, Monthly, Quarterly, Annually | Affects recommended cadence |
| Monthly Invoices | Up to 25/Month (+$250), Over 25/Month (+$450) | Add-on pricing |

### 6. CFO Review

| Field | Options | Pricing Impact |
|-------|---------|----------------|
| Quarterly CFO Review | Yes (+$500) / No | +$500/month if Yes |

CFO Review includes: 45-minute quarterly meeting to review financials, trends, growth trajectory, strategic risks and opportunities.

---

## General Ledger Review Section

### Financial Accounts Matrix

Users enter up to 20 financial accounts (bank accounts, credit cards, loans) with transaction volume:

| Column | Description |
|--------|-------------|
| Institution | Name of bank/institution |
| Type | Banking, Credit Cards, Loan, SBA, LOC, Mortgage, Other |
| <20 TRX | Low transaction volume |
| 20-100 TRX | Medium transaction volume |
| >100 TRX | High transaction volume |

**Transaction Volume Pricing:**
- <20 TRX: $25/account (calculated as count * 25)
- 20-100 TRX: $50/account (calculated as count * 50)
- >100 TRX: $100/account (calculated as count * 100)

### eCommerce Accounts

| Platform | Fields |
|----------|--------|
| Amazon | Inventory (Yes/No), Number of Accounts |
| Shopify | Inventory (Yes/No), Number of Accounts |
| Square | Inventory (Yes/No), Number of Accounts |
| Etsy | Inventory (Yes/No), Number of Accounts |
| Ebay | Inventory (Yes/No), Number of Accounts |
| WooCommerce | Inventory (Yes/No), Number of Accounts |
| Other | Inventory (Yes/No), Number of Accounts |

**eCommerce Pricing:** $100 per eCommerce account

### Revenue COA Allocations

| Selection | Pricing Impact |
|-----------|----------------|
| 1-2 (included) | $0 |
| 3-5 | +$150 |
| >5 (custom pricing) | +$250 (requires offline review) |

### Active Classes

Number of active accounting classes (0-10):

| Classes | Pricing |
|---------|---------|
| 0-1 | $0 |
| 2 | $50 |
| 3 | $100 |
| 4 | $150 |
| 5 | $200 |
| 6 | $250 |
| 7 | $300 |
| 8 | $350 |
| 9 | $400 |
| 10 | $450 |

### Catchup Bookkeeping

| Field | Description |
|-------|-------------|
| Catchup Required | Yes/No |
| Date Range | Start and end dates for catchup period |
| Number of Months | Manual entry |
| Cleanup Intensity | Cash Basis/Journal Entries (0.3x) OR Accrual/Balance Sheet Cleanup (0.75x) |

---

## Pricing Calculations

### Bookkeeping Cadence Base Pricing

The cadence pricing is determined by the minimum of accounting, invoicing, and bill pay recommended cadences:

| Cadence | Base Price Multiplier |
|---------|----------------------|
| Weekly | $400 |
| BiWeekly | $300 |
| Monthly | $200 |
| Quarterly | $100 |

**Accounting Method Cadence Values:**
- Cash Basis: Weekly=$300, BiWeekly=$300, Monthly=$100, Quarterly=$400
- Modified Cash: Weekly=$300, BiWeekly=$300, Monthly=$200
- Accrual: Weekly=$400, BiWeekly=$400, Monthly=$300

### Priority Multiplier

- **Yes** (need by 15th): 1.2x multiplier on cadence pricing
- **No**: 1.0x (no multiplier)

### Cadence x Priority Calculation

```
Cadence x Priority = Cadence Base Price x Priority Multiplier
```

### Monthly Price Formulas

#### Cash Basis Accounting

```
Total = (CadencexPriority + CashBasisReviews + FinancialAccountPricing +
         eCommerceAccountsPricing + 401k + PayrollRecs + PayrollAllocation +
         ExpensePlatform + BillPayAddon + OutboundInvoicing +
         RevenueCOAAllocations + ActiveClasses) + QuarterlyCFOReview
```

#### Modified Cash Basis Accounting

```
Total = ((CadencexPriority + ModifiedCashReviews + FinancialAccountPricing +
          eCommerceAccountsPricing + 401k + PayrollRecs + PayrollAllocation +
          ExpensePlatform + BillPayAddon + OutboundInvoicing +
          RevenueCOAAllocations + ActiveClasses) x 1.25) + QuarterlyCFOReview
```

#### Accrual Accounting

```
Total = ((CadencexPriority + AccrualReviews + FinancialAccountPricing +
          eCommerceAccountsPricing + 401k + PayrollRecs + PayrollAllocation +
          ExpensePlatform + BillPayAddon + OutboundInvoicing +
          RevenueCOAAllocations + ActiveClasses) x 1.25) + QuarterlyCFOReview
```

### Financial Account Pricing Formula

```
FinancialAccountPricing = (CountUnder20TRX x 25) + (Count20to100TRX x 50) + (Count100PlusTRX x 100)
```

### eCommerce Pricing Formula

```
eCommercePricing = TotalEcommerceAccounts x 100
```

### Cleanup/Catchup Estimates

```
Cleanup Estimate = Monthly Price x Cleanup Intensity x Number of Months
```

Where Cleanup Intensity:
- Cash Basis/Journal Entries: 0.3
- Accrual/Balance Sheet Cleanup: 0.75

---

## Conditional Logic

### Field Visibility Rules

1. **Accounting Method Selection:**
   - Cash Basis: Shows Cash-Basis Bookkeeping Cadence, Cash-Basis Reviews, Total Cash Basis Price
   - Modified Cash: Shows Modified-Cash Bookkeeping Cadence, Modified-Cash Reviews, Total Modified Cash Price
   - Accrual: Shows Accrual-Basis Bookkeeping Cadence, Accrual-Basis Reviews, Total Accrual Price

2. **Bill Pay Support = Yes:** Shows Bill Pay Cadence, Bills per Month

3. **Invoicing Support = Yes:** Shows Invoicing Cadence, Invoices per Month

4. **Track Expenses = Yes:** Shows Expense Platform, Employees on Platform

5. **Entity Type = Non Profit:** Shows Restricted Grants question

6. **Catchup Required = Yes:** Shows Date Range, Number of Months, Cleanup Intensity, Cleanup Estimates

---

## Output Fields

### Visible Outputs

| Field | Description |
|-------|-------------|
| Accounting Recommended Cadence | Auto-calculated based on inputs |
| Invoicing Recommended Cadence | Auto-calculated based on inputs |
| Bill Pay Recommended Cadence | Auto-calculated based on inputs |
| Final Recommended Cadence | Minimum of above three (editable) |
| Total eCommerce Accounts | Sum of all eCommerce account entries |

### Hidden Calculation Fields

| Field | Calculation |
|-------|-------------|
| Cadence x Priority | Cadence Base x Priority Multiplier |
| Cadence Calculation | Minimum cadence numeric value (1-4) |
| Cadence Pricing Calculation | Base price for selected cadence |
| Count of Under 20 TRX | Sum of <20 TRX selections / 20 |
| Count of 20-100 TRX | Sum of 20-100 TRX selections / 20100 |
| Count of 100+ TRX | Sum of >100 TRX selections / 100 |
| Financial Account Pricing | Transaction-based pricing total |
| eCommerce Accounts Final Pricing | eCommerce count x 100 |

### Final Price Outputs

| Field | When Shown |
|-------|------------|
| Total Estimated Cash Basis Accounting Monthly Price | Catchup=Yes AND Method=Cash Basis |
| Total Estimated Modified Cash Basis Accounting Monthly Price | Catchup=Yes AND Method=Modified Cash |
| Total Estimated Accrual Accounting Monthly Price | Catchup=Yes AND Method=Accrual |
| Cash Basis Cleanup Estimate | Catchup=Yes AND Method=Cash Basis |
| Modified Cash Basis Cleanup Estimate | Catchup=Yes AND Method=Modified Cash |
| Accrual Basis Cleanup Estimate | Catchup=Yes AND Method=Accrual |

---

## Review Pricing Add-ons

Based on bookkeeping review frequency selection:

| Review Frequency | Price |
|-----------------|-------|
| Weekly | $150/month |
| BiWeekly | $150/month |
| Monthly | $150/month |
| Quarterly | $75/month |
| None | $0 |

---

## Integration Points

- **Hubspot:** Deal ID field for CRM integration
- **Airtable:** Lead Record ID field for database sync
- **Fireflies:** Video link field for call recordings
- **Scribe:** Links to documentation guides for:
  - Determining Active Accounts
  - Determining Revenue COA Allocations
  - Determining # of Classes
