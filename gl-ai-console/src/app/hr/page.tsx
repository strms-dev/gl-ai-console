import { ComingSoon } from "@/components/layout/coming-soon"
import { Users } from "lucide-react"

export default function HRPage() {
  return (
    <ComingSoon
      departmentName="HR / PAS"
      departmentIcon={Users}
      description="People analytics and HR automation for modern workforce management"
      features={[
        "Automated employee onboarding",
        "Performance review workflows",
        "Payroll processing automation",
        "Benefits administration",
        "Compliance tracking",
        "Employee engagement analytics",
        "Talent acquisition tools",
        "Learning & development planning"
      ]}
    />
  )
}