"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

const departmentTitles = {
  "/strms": "STRMS"
}

export function Header() {
  const pathname = usePathname()

  const getPageTitle = () => {
    for (const [path, title] of Object.entries(departmentTitles)) {
      if (pathname.startsWith(path)) {
        return title
      }
    }
    return "GrowthLab AI Console"
  }

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-foreground">{getPageTitle()}</h2>
      </div>
    </header>
  )
}