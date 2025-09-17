import { ComingSoon } from "@/components/layout/coming-soon"

interface HRCatchAllProps {
  params: Promise<{
    slug: string[]
  }>
}

export default async function HRCatchAll({ params }: HRCatchAllProps) {
  return (
    <ComingSoon
      departmentName="HR / PAS"
      departmentIcon="👥"
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