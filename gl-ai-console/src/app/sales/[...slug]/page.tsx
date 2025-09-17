import { ComingSoon } from "@/components/layout/coming-soon"

interface SalesCatchAllProps {
  params: Promise<{
    slug: string[]
  }>
}

export default async function SalesCatchAll({ params }: SalesCatchAllProps) {
  return (
    <ComingSoon
      departmentName="Sales"
      departmentIcon="💼"
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