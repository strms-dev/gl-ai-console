import { ComingSoon } from "@/components/layout/coming-soon"
import { Briefcase } from "lucide-react"

export default function SalesPage() {
  return (
    <ComingSoon
      departmentName="Sales"
      departmentIcon={Briefcase}
      description="AI-driven sales automation and pipeline intelligence"
      features={[
        "Lead scoring and qualification",
        "Automated follow-up sequences",
        "Pipeline forecasting",
        "CRM data enrichment",
        "Sales performance analytics",
        "Quote and proposal generation",
        "Deal progression tracking",
        "Commission calculations"
      ]}
    />
  )
}