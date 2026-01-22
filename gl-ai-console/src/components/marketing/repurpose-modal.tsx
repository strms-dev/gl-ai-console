"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, ArrowRight, Check, Wand2 } from "lucide-react"
import {
  RepurposeItem,
  contentTypeLabels,
  contentTypeColors,
  sourceOriginLabels,
  sourceOriginColors,
} from "@/lib/marketing-content-types"

interface RepurposeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: RepurposeItem[]
  onRepurpose: (itemId: string, targetFormat: string) => void
}

export function RepurposeModal({
  open,
  onOpenChange,
  items,
  onRepurpose,
}: RepurposeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C8E4BB]/30 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-[#407B9D]" />
            </div>
            <div>
              <DialogTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Repurpose Factory
              </DialogTitle>
              <DialogDescription style={{ fontFamily: 'var(--font-body)' }}>
                Transform your existing content into new formats
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3
                        className="font-semibold text-[#463939]"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {item.sourceTitle}
                      </h3>
                      <Badge className={contentTypeColors[item.sourceType]}>
                        {contentTypeLabels[item.sourceType]}
                      </Badge>
                      <Badge className={sourceOriginColors[item.sourceOrigin]}>
                        {sourceOriginLabels[item.sourceOrigin]}
                      </Badge>
                      {item.repurposedCount > 0 && (
                        <Badge className="bg-[#C8E4BB] text-[#463939]">
                          <Check className="w-3 h-3 mr-1" />
                          {item.repurposedCount} format{item.repurposedCount !== 1 ? 's' : ''} created
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        TRANSFORM INTO:
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.suggestedFormats.map((format) => (
                          <Button
                            key={format}
                            size="sm"
                            variant="outline"
                            onClick={() => onRepurpose(item.id, format)}
                            className="border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D] hover:text-white transition-colors"
                          >
                            <Wand2 className="w-3.5 h-3.5 mr-1" />
                            {contentTypeLabels[format]}
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        ))}
                      </div>
                    </div>

                    {item.lastRepurposed && (
                      <p className="text-xs text-muted-foreground mt-3">
                        Last repurposed: {item.lastRepurposed}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-12">
                <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                  No content ready for repurposing. Add content to your library first.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {items.length} piece{items.length !== 1 ? 's' : ''} of content available
          </p>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
