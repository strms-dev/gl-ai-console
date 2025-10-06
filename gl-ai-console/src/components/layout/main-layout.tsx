"use client"

import { useState } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <>
      <div className="fixed top-0 left-0 h-screen z-40">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      <div
        className="min-h-screen bg-background transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? '4rem' : '16rem'
        }}
      >
        <div className="sticky top-0 z-30">
          <Header />
        </div>
        <main>
          {children}
        </main>
      </div>
    </>
  )
}