"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const departments = [
  { name: "STRMS", href: "/strms", icon: "🔧", active: true },
]

const departmentNavigation: Record<string, Array<{ name: string; href: string; icon: string }>> = {
  strms: [
    { name: "Sales Pipeline", href: "/strms", icon: "🔄" },
  ],
}

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  // Determine current department based on pathname
  const getCurrentDepartment = () => {
    if (pathname.startsWith('/strms')) return 'strms'
    return null
  }

  const currentDepartment = getCurrentDepartment()
  const currentNavigation = currentDepartment ? departmentNavigation[currentDepartment] : []

  return (
    <div className={cn(
      "flex h-full flex-col bg-white border-r border-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 items-center px-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          {isCollapsed ? "→" : "←"}
        </Button>
        {!isCollapsed && (
          <Image
            src="/gl-ai-console-logo.png"
            alt="GrowthLab AI Console"
            width={200}
            height={40}
            className="ml-2 object-contain"
          />
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <div className={cn(
          "py-4 border-b border-border",
          isCollapsed ? "px-2" : "px-4"
        )}>
          {!isCollapsed && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Departments</p>
          )}
          <ul className="space-y-1">
            {departments.map((dept) => {
              const isActive = pathname.startsWith(dept.href)
              return (
                <li key={dept.name}>
                  <Link
                    href={dept.href}
                    className={cn(
                      "flex items-center text-sm font-medium rounded-md transition-colors",
                      isCollapsed ? "justify-center p-2" : "px-3 py-2",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    title={isCollapsed ? dept.name : undefined}
                  >
                    <div className={cn(
                      "flex items-center justify-center",
                      isCollapsed ? "w-6 h-6" : "w-6 h-6 mr-3"
                    )}>
                      <Image
                        src="/strms-logo-square.png"
                        alt="STRMS"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    {!isCollapsed && dept.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {currentDepartment && currentNavigation.length > 0 && (
          <nav className={cn(
            "flex-1 py-4",
            isCollapsed ? "px-2" : "px-4"
          )}>
            {!isCollapsed && (
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                {departments.find(d => d.href.includes(currentDepartment))?.name}
              </p>
            )}
            <ul className="space-y-1">
              {currentNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center text-sm font-medium rounded-md transition-colors",
                        isCollapsed ? "justify-center p-2" : "px-3 py-2",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <span className={cn(
                        "text-lg",
                        isCollapsed ? "" : "mr-3"
                      )}>{item.icon}</span>
                      {!isCollapsed && item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        )}
      </div>
    </div>
  )
}