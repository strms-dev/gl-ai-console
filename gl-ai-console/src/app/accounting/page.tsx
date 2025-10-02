import { ComingSoon } from "@/components/layout/coming-soon"
import { BarChart3 } from "lucide-react"

export default function AccountingPage() {
  return (
    <ComingSoon
      departmentName="Accounting"
      departmentIcon={BarChart3}
      description="AI-powered financial automation and real-time accounting insights"
      features={[
        "Automated transaction categorization",
        "Real-time financial reporting",
        "Intelligent reconciliation",
        "Monthly close automation",
        "Expense report processing",
        "Audit trail management",
        "Cash flow forecasting",
        "Compliance monitoring"
      ]}
    />
  )
}