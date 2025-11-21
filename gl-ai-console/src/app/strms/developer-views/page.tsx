"use client"

import { useState } from "react"
import { DeveloperUnifiedView } from "@/components/shared/developer-unified-view"
import { Developer } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function DeveloperViewsPage() {
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer>("Nick")

  return (
    <div>
      {/* Developer Selector - moved to top of DeveloperUnifiedView */}
      <DeveloperUnifiedView
        developer={selectedDeveloper}
        onDeveloperChange={setSelectedDeveloper}
      />
    </div>
  )
}
