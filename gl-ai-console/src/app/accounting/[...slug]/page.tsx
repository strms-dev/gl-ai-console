import { redirect } from "next/navigation"

interface AccountingCatchAllProps {
  params: Promise<{
    slug: string[]
  }>
}

export default async function AccountingCatchAll({ params }: AccountingCatchAllProps) {
  // Redirect any undefined accounting routes to the accounting home page
  redirect("/accounting/home")
}
