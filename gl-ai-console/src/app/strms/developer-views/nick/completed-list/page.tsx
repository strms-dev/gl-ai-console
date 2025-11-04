"use client"

import { DeveloperViewWrapper } from "@/components/shared/developer-view-wrapper"

export default function NickCompletedListPage() {
  return (
    <DeveloperViewWrapper
      developer="Nick"
      viewType="completed"
      initialViewMode="list"
    />
  )
}
