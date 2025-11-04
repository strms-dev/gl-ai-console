"use client"

import { DeveloperViewWrapper } from "@/components/shared/developer-view-wrapper"

export default function GonActiveListPage() {
  return (
    <DeveloperViewWrapper
      developer="Gon"
      viewType="active"
      initialViewMode="list"
    />
  )
}
