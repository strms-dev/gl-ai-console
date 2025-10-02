import { ComingSoon } from "@/components/layout/coming-soon"
import { TrendingUp } from "lucide-react"

export default function FPAPage() {
  return (
    <ComingSoon
      departmentName="FP&A"
      departmentIcon={TrendingUp}
      description="Strategic financial planning and analysis with predictive AI insights"
      features={[
        "Automated budget planning",
        "Intelligent forecasting models",
        "Variance analysis automation",
        "Scenario planning tools",
        "KPI tracking and alerts",
        "Executive dashboard creation",
        "Rolling forecast updates",
        "Investment analysis"
      ]}
    />
  )
}