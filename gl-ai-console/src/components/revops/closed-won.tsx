"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ClosedWonStageData
} from "@/lib/sales-pipeline-timeline-types"
import {
  Trophy,
  ExternalLink,
  DollarSign,
  CheckCircle2,
  PartyPopper
} from "lucide-react"

interface ClosedWonProps {
  wonData: ClosedWonStageData
  companyName: string
  onUpdateNotes: (notes: string) => void
  onSyncToHubspot: () => void
}

export function ClosedWon({
  wonData,
  companyName,
  onUpdateNotes,
  onSyncToHubspot
}: ClosedWonProps) {
  const [notes, setNotes] = useState(wonData.closingNotes || "")
  const [notesChanged, setNotesChanged] = useState(false)

  const handleNotesChange = (value: string) => {
    setNotes(value)
    setNotesChanged(true)
  }

  const handleSaveNotes = () => {
    onUpdateNotes(notes)
    setNotesChanged(false)
  }

  const totalMonthly = wonData.finalDealValue || 0

  return (
    <div className="mt-4 p-6 border-2 border-[#C8E4BB] rounded-lg bg-gradient-to-br from-[#C8E4BB]/20 to-[#C8E4BB]/5">
      {/* Success Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C8E4BB] mb-4">
          <Trophy className="w-8 h-8 text-[#5A8A4A]" />
        </div>
        <h4
          className="text-2xl font-bold text-[#5A8A4A] mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Congratulations!
        </h4>
        <p className="text-lg text-[#463939]">
          <strong>{companyName}</strong> is now a customer
        </p>
        {wonData.closedAt && (
          <p className="text-sm text-muted-foreground mt-1">
            Closed on {new Date(wonData.closedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Deal Value Card */}
      <div className="bg-white rounded-lg border border-[#C8E4BB] p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
            <p className="text-3xl font-bold text-[#5A8A4A]">
              ${totalMonthly.toLocaleString()}
              <span className="text-lg font-normal text-muted-foreground">/mo</span>
            </p>
          </div>
          <DollarSign className="w-12 h-12 text-[#C8E4BB]" />
        </div>
      </div>

      {/* Services Included */}
      {wonData.servicesIncluded && wonData.servicesIncluded.length > 0 && (
        <div className="bg-white rounded-lg border border-[#C8E4BB] p-4 mb-4">
          <h5 className="text-sm font-medium mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            Services Included
          </h5>
          <div className="space-y-2">
            {wonData.servicesIncluded.map((service, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5A8A4A]" />
                  <span>{service.service}</span>
                </div>
                <span className="font-medium">${service.monthlyPrice.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Closing Notes */}
      <div className="mb-4">
        <Label htmlFor="closingNotes" className="text-sm font-medium">
          Closing Notes
        </Label>
        <Textarea
          id="closingNotes"
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Add any notes about the deal, special arrangements, or onboarding requirements..."
          rows={3}
          className="mt-1 bg-white"
        />
        {notesChanged && (
          <Button
            size="sm"
            onClick={handleSaveNotes}
            className="mt-2 h-7 bg-[#407B9D] hover:bg-[#366a88] text-white"
          >
            Save Notes
          </Button>
        )}
      </div>

      {/* HubSpot Sync */}
      <div className="pt-4 border-t border-[#C8E4BB]">
        <Button
          variant="outline"
          onClick={onSyncToHubspot}
          disabled={wonData.hubspotSynced}
          className={wonData.hubspotSynced
            ? "w-full border-[#5A8A4A] text-[#5A8A4A]"
            : "w-full border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D]/10"
          }
        >
          {wonData.hubspotSynced ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Synced to HubSpot
              {wonData.hubspotSyncedAt && (
                <span className="text-xs ml-2 text-muted-foreground">
                  ({new Date(wonData.hubspotSyncedAt).toLocaleDateString()})
                </span>
              )}
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4 mr-2" />
              Sync to HubSpot
            </>
          )}
        </Button>
      </div>

      {/* Next Steps */}
      <div className="mt-4 p-3 bg-white rounded-lg border border-[#C8E4BB]">
        <p className="text-sm text-muted-foreground">
          <strong>Next Steps:</strong> Begin client onboarding process. Schedule kickoff call and set up accounting system access.
        </p>
      </div>
    </div>
  )
}
