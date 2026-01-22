"use client"

import { SimplifiedStageCard } from "./simplified-stage-card"
import {
  SimplifiedEAReadyForReviewStageData,
  HUBSPOT_STAGE_NAMES
} from "@/lib/sales-pipeline-timeline-types"

interface EAReadyForReviewProps {
  stageData: SimplifiedEAReadyForReviewStageData
  onConfirm: () => void
  onReset?: () => void
}

export function EAReadyForReview({
  stageData,
  onConfirm,
  onReset
}: EAReadyForReviewProps) {
  return (
    <SimplifiedStageCard
      stageTitle="EA Ready for Review"
      hubspotStageName={HUBSPOT_STAGE_NAMES["ea-ready-for-review"]}
      description="Confirm that the internal team has reviewed the Engagement Agreement."
      confirmButtonLabel="Confirm Review Complete"
      isConfirmed={!!stageData.confirmedAt}
      confirmedAt={stageData.confirmedAt || undefined}
      isAutoSynced={stageData.isAutoSynced}
      onConfirm={onConfirm}
      onReset={onReset}
    />
  )
}
