"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Wrench, RotateCw, Home, Code, AlertCircle, Users, Clock, Folder, ChevronDown, ChevronRight, User, UserX, LucideIcon, Filter } from "lucide-react"
import { useState, useEffect } from "react"

const departments = [
  { name: "STRMS", href: "/strms/home", icon: "strms", active: true },
  { name: "RevOps", href: "/revops/home", icon: "revops", active: true },
]

interface NavigationItem {
  name: string
  href?: string
  icon: string
  children?: NavigationItem[]
}

const departmentNavigation: Record<string, NavigationItem[]> = {
  strms: [
    { name: "Sales Pipeline", href: "/strms/sales-pipeline", icon: "rotate-cw" },
    { name: "Offboarding", href: "/strms/offboarding", icon: "user-x" },
    {
      name: "Project Management",
      icon: "folder",
      children: [
        { name: "Development Projects", href: "/strms/project-management", icon: "code" },
        { name: "Maintenance", href: "/strms/maintenance", icon: "alert-circle" },
        { name: "Developer Views", href: "/strms/developer-views", icon: "users" },
        { name: "Time Tracking", href: "/strms/time-tracking", icon: "clock" },
      ]
    },
  ],
  revops: [
    { name: "Sales Funnel", href: "/revops/sales-funnel", icon: "funnel" },
    { name: "Sales Pipeline", href: "/revops/sales-pipeline", icon: "rotate-cw" },
  ],
}

// Icon mapping function
const getIconComponent = (iconName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'home': Home,
    'wrench': Wrench,
    'rotate-cw': RotateCw,
    'user-x': UserX,
    'code': Code,
    'alert-circle': AlertCircle,
    'users': Users,
    'user': User,
    'clock': Clock,
    'folder': Folder,
    'chevron-down': ChevronDown,
    'chevron-right': ChevronRight,
    'funnel': Filter,
  }
  return iconMap[iconName] || RotateCw
}

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  // State for expanded parent items
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  // Determine current department based on pathname
  const getCurrentDepartment = () => {
    if (pathname.startsWith('/strms')) return 'strms'
    if (pathname.startsWith('/revops')) return 'revops'
    return null
  }

  const currentDepartment = getCurrentDepartment()
  const currentNavigation = currentDepartment ? departmentNavigation[currentDepartment] : []

  // Check if we're on home page
  const isHomePage = pathname === '/home'

  // Load expanded state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-expanded-items')
    if (saved) {
      try {
        setExpandedItems(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved expanded items:', e)
      }
    }
  }, [])

  // Auto-expand parent items when on a child route
  useEffect(() => {
    const newExpanded = { ...expandedItems }
    let hasChanges = false

    currentNavigation.forEach((item) => {
      if (item.children) {
        // Check direct children
        const isChildActive = item.children.some((child) => {
          if (child.href) {
            return pathname === child.href ||
              (child.href === '/strms/project-management' && pathname.startsWith('/strms/project-management/projects/')) ||
              (child.href === '/strms/maintenance' && pathname.startsWith('/strms/maintenance/tickets/'))
          }

          // Check grandchildren (nested 3rd level)
          if (child.children) {
            return child.children.some((grandchild) => {
              if (!grandchild.href) return false
              return pathname === grandchild.href || pathname.startsWith(grandchild.href + '/')
            })
          }

          return false
        })

        if (isChildActive && !expandedItems[item.name]) {
          newExpanded[item.name] = true
          hasChanges = true
        }

        // Also expand nested parent if grandchild is active
        item.children.forEach((child) => {
          if (child.children) {
            const isGrandchildActive = child.children.some((grandchild) => {
              if (!grandchild.href) return false
              return pathname === grandchild.href || pathname.startsWith(grandchild.href + '/')
            })

            if (isGrandchildActive && !expandedItems[child.name]) {
              newExpanded[child.name] = true
              hasChanges = true
            }
          }
        })
      }
    })

    if (hasChanges) {
      setExpandedItems(newExpanded)
      localStorage.setItem('sidebar-expanded-items', JSON.stringify(newExpanded))
    }
  }, [pathname, currentNavigation])

  // Toggle expanded state
  const toggleExpanded = (itemName: string) => {
    const newExpanded = {
      ...expandedItems,
      [itemName]: !expandedItems[itemName]
    }
    setExpandedItems(newExpanded)
    localStorage.setItem('sidebar-expanded-items', JSON.stringify(newExpanded))
  }

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
                        src={dept.icon === 'strms' ? '/strms-logo-square.png' : '/tim-cxr-logo.png'}
                        alt={dept.name}
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
                // Check if this is a parent item with children
                if (item.children) {
                  const isExpanded = expandedItems[item.name]
                  const IconComponent = getIconComponent(item.icon)
                  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight

                  // Check if any child is active
                  const isChildActive = item.children.some((child) => {
                    if (!child.href) return false
                    return pathname === child.href ||
                      (child.href === '/strms/project-management' && pathname.startsWith('/strms/project-management/projects/')) ||
                      (child.href === '/strms/maintenance' && pathname.startsWith('/strms/maintenance/tickets/')) ||
                      (child.href === '/strms/developer-views' && pathname.startsWith('/strms/developer-views/'))
                  })

                  return (
                    <li key={item.name}>
                      {/* Parent item button */}
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={cn(
                          "w-full flex items-center text-sm font-medium rounded-lg transition-all duration-200",
                          isCollapsed ? "justify-center p-2" : "px-3 py-2",
                          isChildActive
                            ? "bg-[#95CBD7]/20 text-[#407B9D]"
                            : "text-muted-foreground hover:bg-[#95CBD7]/15 hover:text-[#407B9D]"
                        )}
                        style={{fontFamily: 'var(--font-body)'}}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <IconComponent className={cn(
                          "w-5 h-5 flex-shrink-0",
                          isCollapsed ? "" : "mr-3"
                        )} />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left">{item.name}</span>
                            <ChevronIcon className="w-4 h-4 flex-shrink-0" />
                          </>
                        )}
                      </button>

                      {/* Child items */}
                      {!isCollapsed && isExpanded && (
                        <ul className="mt-1 space-y-1">
                          {item.children.map((child) => {
                            // Check if child has its own children (nested 3rd level)
                            if (child.children) {
                              const isChildExpanded = expandedItems[child.name]
                              const ChildIconComponent = getIconComponent(child.icon)
                              const ChildChevronIcon = isChildExpanded ? ChevronDown : ChevronRight

                              // Check if any grandchild is active
                              const isGrandchildActive = child.children.some((grandchild) => {
                                if (!grandchild.href) return false
                                return pathname === grandchild.href || pathname.startsWith(grandchild.href + '/')
                              })

                              return (
                                <li key={child.name}>
                                  {/* Nested parent button */}
                                  <button
                                    onClick={() => toggleExpanded(child.name)}
                                    className={cn(
                                      "w-full flex items-center text-sm font-medium rounded-lg transition-all duration-200 pl-8 pr-3 py-2",
                                      isGrandchildActive
                                        ? "bg-[#95CBD7]/20 text-[#407B9D]"
                                        : "text-muted-foreground hover:bg-[#95CBD7]/15 hover:text-[#407B9D]"
                                    )}
                                    style={{fontFamily: 'var(--font-body)'}}
                                  >
                                    <ChildIconComponent className="w-4 h-4 mr-3 flex-shrink-0" />
                                    <span className="flex-1 text-left">{child.name}</span>
                                    <ChildChevronIcon className="w-3 h-3 flex-shrink-0" />
                                  </button>

                                  {/* Grandchild items (3rd level) */}
                                  {isChildExpanded && (
                                    <ul className="mt-1 space-y-1">
                                      {child.children.map((grandchild) => {
                                        if (!grandchild.href) return null

                                        const isActive = pathname === grandchild.href || pathname.startsWith(grandchild.href + '/')
                                        const GrandchildIconComponent = getIconComponent(grandchild.icon)

                                        return (
                                          <li key={grandchild.name}>
                                            <Link
                                              href={grandchild.href}
                                              className={cn(
                                                "flex items-center text-sm font-medium rounded-lg transition-all duration-200 pl-12 pr-3 py-2",
                                                isActive
                                                  ? "bg-[#C8E4BB] text-[#463939] shadow-sm"
                                                  : "text-muted-foreground hover:bg-[#95CBD7]/15 hover:text-[#407B9D]"
                                              )}
                                              style={{fontFamily: 'var(--font-body)'}}
                                            >
                                              <GrandchildIconComponent className="w-3 h-3 mr-2 flex-shrink-0" />
                                              {grandchild.name}
                                            </Link>
                                          </li>
                                        )
                                      })}
                                    </ul>
                                  )}
                                </li>
                              )
                            }

                            // Regular child item with link
                            if (!child.href) return null

                            const isActive = pathname === child.href ||
                              (child.href === '/strms/project-management' && pathname.startsWith('/strms/project-management/projects/')) ||
                              (child.href === '/strms/maintenance' && pathname.startsWith('/strms/maintenance/tickets/'))
                            const ChildIconComponent = getIconComponent(child.icon)

                            return (
                              <li key={child.name}>
                                <Link
                                  href={child.href}
                                  className={cn(
                                    "flex items-center text-sm font-medium rounded-lg transition-all duration-200 pl-8 pr-3 py-2",
                                    isActive
                                      ? "bg-[#C8E4BB] text-[#463939] shadow-sm"
                                      : "text-muted-foreground hover:bg-[#95CBD7]/15 hover:text-[#407B9D]"
                                  )}
                                  style={{fontFamily: 'var(--font-body)'}}
                                >
                                  <ChildIconComponent className="w-4 h-4 mr-3 flex-shrink-0" />
                                  {child.name}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </li>
                  )
                }

                // Regular item without children
                const isActive = pathname === item.href ||
                  (item.href === '/strms/sales-pipeline' && pathname.startsWith('/strms/sales-pipeline/projects/'))
                const IconComponent = getIconComponent(item.icon)

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href!}
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