"use client"

import { usePathname } from "next/navigation"
import Image from "next/image"
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

  const renderTitle = () => {
    const title = getPageTitle()
    if (title === "STRMS") {
      return null // Don't render anything for STRMS page
    }
    return title
  }

  // Don't render header for STRMS page
  if (getPageTitle() === "STRMS") {
    return null
  }

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-foreground">{renderTitle()}</h2>
      </div>
    </header>
  )
}