import { ComingSoon } from "@/components/layout/coming-soon"

interface TaxCatchAllProps {
  params: Promise<{
    slug: string[]
  }>
}

export default async function TaxCatchAll({ params }: TaxCatchAllProps) {
  return (
    <ComingSoon
      departmentName="Tax"
      departmentIcon="🧾"
      description="Intelligent tax compliance and planning automation"
      features={[
        "Automated tax provision calculations",
        "Compliance monitoring and alerts",
        "Tax return preparation assistance",
        "Research and documentation tools",
        "Multi-jurisdiction support",
        "Audit preparation automation",
        "Tax planning optimization",
        "Regulatory update tracking"
      ]}
    />
  )
}