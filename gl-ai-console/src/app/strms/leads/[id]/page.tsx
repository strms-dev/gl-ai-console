import { redirect } from 'next/navigation'
import { use } from 'react'

interface LeadDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OldLeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = use(params)
  redirect(`/strms/sales-pipeline/projects/${id}`)
}
