import { ComingSoon } from "@/components/layout/coming-soon"
import { Megaphone } from "lucide-react"

export default function MarketingPage() {
  return (
    <ComingSoon
      departmentName="Marketing"
      departmentIcon={Megaphone}
      description="Intelligent marketing automation and campaign optimization"
      features={[
        "Automated campaign management",
        "Content generation and optimization",
        "Lead nurturing workflows",
        "Marketing analytics and attribution",
        "Social media automation",
        "Email marketing sequences",
        "A/B testing automation",
        "ROI tracking and reporting"
      ]}
    />
  )
}