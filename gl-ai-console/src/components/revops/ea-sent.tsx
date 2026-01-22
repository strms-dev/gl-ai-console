"use client"

import { SimplifiedStageCard } from "./simplified-stage-card"
import {
  SimplifiedEASentStageData,
  HUBSPOT_STAGE_NAMES
} from "@/lib/sales-pipeline-timeline-types"

interface EASentProps {
  stageData: SimplifiedEASentStageData
  onConfirm: () => void
  onReset?: () => void
}

export function EASent({
  stageData,
  onConfirm,
  onReset
}: EASentProps) {
  return (
    <SimplifiedStageCard
      stageTitle="EA Sent"
      hubspotStageName={HUBSPOT_STAGE_NAMES["ea-sent"]}
      description="Confirm that the Engagement Agreement has been sent to the client."
      confirmButtonLabel="Confirm EA Sent"
      isConfirmed={!!stageData.confirmedAt}
      confirmedAt={stageData.confirmedAt || undefined}
      isAutoSynced={stageData.isAutoSynced}
      onConfirm={onConfirm}
      onReset={onReset}
    />
  )
}
