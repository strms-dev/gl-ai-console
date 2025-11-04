"use client"

import { DeveloperViewWrapper } from "@/components/shared/developer-view-wrapper"

export default function GonActiveKanbanPage() {
  return (
    <DeveloperViewWrapper
      developer="Gon"
      viewType="active"
      initialViewMode="kanban"
    />
  )
}
