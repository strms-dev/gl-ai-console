"use client"

import { DeveloperViewWrapper } from "@/components/shared/developer-view-wrapper"

export default function GonCompletedListPage() {
  return (
    <DeveloperViewWrapper
      developer="Gon"
      viewType="completed"
      initialViewMode="list"
    />
  )
}
