"use client"

import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const departmentTitles = {
  "/strms/home": "STRMS Home",
  "/strms/sales-pipeline": "Sales Pipeline",
  "/strms": "STRMS",
  "/home": "Home"
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
    if (title === "STRMS" || title === "Home" || title === "STRMS Home" || title === "Sales Pipeline") {
      return null // Don't render anything for STRMS pages or Home page
    }
    return title
  }

  // Don't render header for STRMS pages or Home page
  const title = getPageTitle()
  if (title === "STRMS" || title === "Home" || title === "STRMS Home" || title === "Sales Pipeline") {
    return null
  }

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-foreground" style={{fontFamily: 'var(--font-heading)'}}>{renderTitle()}</h2>
      </div>
    </header>
  )
}