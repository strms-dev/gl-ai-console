"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Header } from "./header"
import { Sidebar } from "./sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const pathname = usePathname()

  // Reset scroll position for STRMS pages (both main page and lead details)
  useEffect(() => {
    if (pathname.startsWith('/strms')) {
      // Use requestAnimationFrame to ensure this runs after any scroll restoration
      requestAnimationFrame(() => {
        if (mainRef.current) {
          mainRef.current.scrollTop = 0
        }
      })
    }
  }, [pathname])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main ref={mainRef} className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}