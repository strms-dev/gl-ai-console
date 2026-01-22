"use client"

import { SimplifiedStageCard } from "./simplified-stage-card"
import {
  SimplifiedQuoteSentStageData,
  HUBSPOT_STAGE_NAMES
} from "@/lib/sales-pipeline-timeline-types"

interface QuoteSentProps {
  stageData: SimplifiedQuoteSentStageData
  hubspotQuoteLink: string | null
  onConfirm: () => void
  onQuoteDeclined: () => void
  onReset?: () => void
}

export function QuoteSent({
  stageData,
  hubspotQuoteLink,
  onConfirm,
  onQuoteDeclined,
  onReset
}: QuoteSentProps) {
  return (
    <SimplifiedStageCard
      stageTitle="SQO - Quote Sent"
      hubspotStageName={HUBSPOT_STAGE_NAMES["quote-sent"]}
      description="Confirm that you have sent the quote to the client via HubSpot."
      confirmButtonLabel="Confirm Quote Sent"
      isConfirmed={!!stageData.confirmedAt}
      confirmedAt={stageData.confirmedAt || undefined}
      isAutoSynced={stageData.isAutoSynced}
      onConfirm={onConfirm}
      secondaryAction={{
        label: "Quote Declined",
        onClick: onQuoteDeclined,
        variant: "destructive"
      }}
      externalLink={hubspotQuoteLink ? {
        label: "View Quote in HubSpot",
        url: hubspotQuoteLink
      } : undefined}
      onReset={onReset}
    />
  )
}
