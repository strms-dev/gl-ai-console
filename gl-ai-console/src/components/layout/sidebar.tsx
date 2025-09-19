"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const departments = [
  { name: "STRMS", href: "/strms", icon: "🔧", active: true },
  { name: "Accounting", href: "/accounting", icon: "📊", active: true },
  { name: "FP&A", href: "/fpa", icon: "📈", active: true },
  { name: "Tax", href: "/tax", icon: "🧾", active: true },
  { name: "HR / PAS", href: "/hr", icon: "👥", active: true },
  { name: "Sales", href: "/sales", icon: "💼", active: true },
  { name: "Marketing", href: "/marketing", icon: "📢", active: true },
]

const departmentNavigation: Record<string, Array<{ name: string; href: string; icon: string }>> = {
  strms: [
    { name: "Pipeline", href: "/strms", icon: "🔄" },
  ],
  accounting: [
    { name: "General Ledger", href: "/accounting", icon: "📋" },
    { name: "Accounts Payable", href: "/accounting/ap", icon: "💳" },
    { name: "Accounts Receivable", href: "/accounting/ar", icon: "💰" },
    { name: "Monthly Close", href: "/accounting/close", icon: "📅" },
  ],
  fpa: [
    { name: "Financial Reports", href: "/fpa", icon: "📊" },
    { name: "Budget Planning", href: "/fpa/budget", icon: "📋" },
    { name: "Forecasting", href: "/fpa/forecast", icon: "🔮" },
    { name: "Variance Analysis", href: "/fpa/variance", icon: "📈" },
  ],
  tax: [
    { name: "Tax Returns", href: "/tax", icon: "📄" },
    { name: "Tax Planning", href: "/tax/planning", icon: "📝" },
    { name: "Compliance", href: "/tax/compliance", icon: "✅" },
    { name: "Research", href: "/tax/research", icon: "🔍" },
  ],
  hr: [
    { name: "Employee Records", href: "/hr", icon: "👤" },
    { name: "Payroll", href: "/hr/payroll", icon: "💵" },
    { name: "Benefits", href: "/hr/benefits", icon: "🎁" },
    { name: "Performance", href: "/hr/performance", icon: "⭐" },
  ],
  sales: [
    { name: "Pipeline", href: "/sales", icon: "🔄" },
    { name: "Opportunities", href: "/sales/opportunities", icon: "🎯" },
    { name: "Forecasting", href: "/sales/forecast", icon: "📊" },
    { name: "Reports", href: "/sales/reports", icon: "📈" },
  ],
  marketing: [
    { name: "Campaigns", href: "/marketing", icon: "📢" },
    { name: "Analytics", href: "/marketing/analytics", icon: "📊" },
    { name: "Content", href: "/marketing/content", icon: "📝" },
    { name: "Automation", href: "/marketing/automation", icon: "🤖" },
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
    if (pathname.startsWith('/accounting')) return 'accounting'
    if (pathname.startsWith('/fpa')) return 'fpa'
    if (pathname.startsWith('/tax')) return 'tax'
    if (pathname.startsWith('/hr')) return 'hr'
    if (pathname.startsWith('/sales')) return 'sales'
    if (pathname.startsWith('/marketing')) return 'marketing'
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
          <h1 className="ml-2 text-xl font-bold text-primary">GrowthLab AI Console</h1>
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
                    <span className={cn(
                      "text-lg",
                      isCollapsed ? "" : "mr-3"
                    )}>{dept.icon}</span>
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