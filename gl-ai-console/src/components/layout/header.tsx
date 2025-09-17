"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

const departmentTitles = {
  "/strms": "STRMS",
  "/accounting": "Accounting Department",
  "/fpa": "Financial Planning & Analysis",
  "/tax": "Tax Department",
  "/hr": "Human Resources / PAS",
  "/sales": "Sales Department",
  "/marketing": "Marketing Department"
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
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm">
          🔔 Notifications
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">N</span>
          </div>
          <span className="text-sm font-medium">Nick</span>
        </div>
      </div>
    </header>
  )
}