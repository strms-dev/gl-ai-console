"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Wrench, RotateCw, Home, LucideIcon } from "lucide-react"

const departments = [
  { name: "STRMS", href: "/strms/home", icon: "wrench", active: true },
]

const departmentNavigation: Record<string, Array<{ name: string; href: string; icon: string }>> = {
  strms: [
    { name: "Sales Pipeline", href: "/strms/sales-pipeline", icon: "rotate-cw" },
  ],
}

// Icon mapping function
const getIconComponent = (iconName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'home': Home,
    'wrench': Wrench,
    'rotate-cw': RotateCw,
  }
  return iconMap[iconName] || RotateCw
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

  // Check if we're on home page
  const isHomePage = pathname === '/home'

  return (
    <div className={cn(
      "flex h-full flex-col bg-white border-r border-border transition-all duration-300 shadow-sm",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-white">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 hover:bg-[#407B9D]/10 text-[#407B9D] flex-shrink-0"
        >
          {isCollapsed ? "→" : "←"}
        </Button>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <Image
              src="/gl-ai-console-logo.png"
              alt="GrowthLab AI Console"
              width={240}
              height={60}
              priority
              className="w-full h-auto"
            />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {/* Home Button */}
        <div className={cn(
          "pt-4 pb-4 border-b border-border",
          isCollapsed ? "px-2" : "px-4"
        )}>
          <ul className="space-y-1">
            <li>
              <Link
                href="/home"
                className={cn(
                  "flex items-center text-sm font-semibold rounded-lg transition-all duration-200",
                  isCollapsed ? "justify-center p-2" : "px-3 py-2.5",
                  isHomePage
                    ? "bg-[#407B9D] text-white shadow-md"
                    : "text-[#463939] hover:bg-[#95CBD7]/20 hover:text-[#407B9D]"
                )}
                style={{fontFamily: 'var(--font-heading)'}}
                title={isCollapsed ? "Home" : undefined}
              >
                <Home className={cn(
                  "w-5 h-5",
                  isCollapsed ? "" : "mr-3"
                )} />
                {!isCollapsed && "Home"}
              </Link>
            </li>
          </ul>
        </div>

        {/* Departments Section */}
        <div className={cn(
          "pt-4 pb-4 border-b border-border",
          isCollapsed ? "px-2" : "px-4"
        )}>
          {!isCollapsed && (
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3" style={{fontFamily: 'var(--font-heading)'}}>Departments</p>
          )}
          <ul className="space-y-1">
            {departments.map((dept) => {
              // Only highlight department button when on department home, not sub-pages
              const isActive = pathname === dept.href
              return (
                <li key={dept.name}>
                  <Link
                    href={dept.href}
                    className={cn(
                      "flex items-center text-sm font-semibold rounded-lg transition-all duration-200",
                      isCollapsed ? "justify-center p-2" : "px-3 py-2.5",
                      isActive
                        ? "bg-[#407B9D] text-white shadow-md"
                        : "text-[#463939] hover:bg-[#95CBD7]/20 hover:text-[#407B9D]"
                    )}
                    style={{fontFamily: 'var(--font-heading)'}}
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
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3" style={{fontFamily: 'var(--font-heading)'}}>
                {departments.find(d => d.href.includes(currentDepartment))?.name}
              </p>
            )}
            <ul className="space-y-1">
              {currentNavigation.map((item) => {
                // Highlight sales pipeline when on the page OR on project details pages
                const isActive = pathname === item.href ||
                  (item.href === '/strms/sales-pipeline' && pathname.startsWith('/strms/sales-pipeline/projects/'))
                const IconComponent = getIconComponent(item.icon)
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center text-sm font-medium rounded-lg transition-all duration-200",
                        isCollapsed ? "justify-center p-2" : "px-3 py-2",
                        isActive
                          ? "bg-[#C8E4BB] text-[#463939] shadow-sm"
                          : "text-muted-foreground hover:bg-[#95CBD7]/15 hover:text-[#407B9D]"
                      )}
                      style={{fontFamily: 'var(--font-body)'}}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <IconComponent className={cn(
                        "w-5 h-5",
                        isCollapsed ? "" : "mr-3"
                      )} />
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