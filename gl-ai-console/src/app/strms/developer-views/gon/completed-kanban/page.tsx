"use client"

import { DeveloperViewWrapper } from "@/components/shared/developer-view-wrapper"

export default function GonCompletedKanbanPage() {
  return (
    <DeveloperViewWrapper
      developer="Gon"
      viewType="completed"
      initialViewMode="kanban"
    />
  )
}
