"use client"

import { DeveloperViewWrapper } from "@/components/shared/developer-view-wrapper"

export default function NickActiveKanbanPage() {
  return (
    <DeveloperViewWrapper
      developer="Nick"
      viewType="active"
      initialViewMode="kanban"
    />
  )
}
