import { ComingSoon } from "@/components/layout/coming-soon"
import { BarChart3 } from "lucide-react"

interface AccountingCatchAllProps {
  params: Promise<{
    slug: string[]
  }>
}

export default async function AccountingCatchAll({ params }: AccountingCatchAllProps) {
  // We don't need to use the slug, just show the coming soon page
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