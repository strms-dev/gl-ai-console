"use client"

import { DeveloperViewWrapper } from "@/components/shared/developer-view-wrapper"

export default function NickActiveListPage() {
  return (
    <DeveloperViewWrapper
      developer="Nick"
      viewType="active"
      initialViewMode="list"
    />
  )
}
