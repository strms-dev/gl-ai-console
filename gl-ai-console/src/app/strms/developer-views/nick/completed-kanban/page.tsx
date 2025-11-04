"use client"

import { DeveloperViewWrapper } from "@/components/shared/developer-view-wrapper"

export default function NickCompletedKanbanPage() {
  return (
    <DeveloperViewWrapper
      developer="Nick"
      viewType="completed"
      initialViewMode="kanban"
    />
  )
}
