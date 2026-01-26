"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Radio, ExternalLink, ArrowRight, Building2, User } from "lucide-react"
import {
  Influencer,
  EngagedPerson,
  influencerStatusLabels,
  influencerStatusColors,
  platformLabels,
  platformColors,
  engagementTypeLabels,
  engagementTypeColors,
  icpMatchLabels,
  icpMatchColors,
} from "@/lib/lead-discovery-types"

interface TrigifyTrackerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  influencers: Influencer[]
  engagedPeople: EngagedPerson[]
  onPushToClay: (personId: string) => void
  onViewInfluencer: (influencerId: string) => void
}

export function TrigifyTrackerModal({
  open,
  onOpenChange,
  influencers,
  engagedPeople,
  onPushToClay,
  onViewInfluencer,
}: TrigifyTrackerModalProps) {
  const [activeTab, setActiveTab] = useState<'engagements' | 'influencers'>('engagements')

  const trackingInfluencers = influencers.filter(
    (i) => i.status === 'tracking' || i.status === 'added_to_trigify'
  )
  const unpushedEngagements = engagedPeople.filter((e) => !e.pushedToClayAt)

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#95CBD7]/20 flex items-center justify-center">
              <Radio className="w-5 h-5 text-[#407B9D]" />
            </div>
            <div>
              <DialogTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Trigify Tracker
              </DialogTitle>
              <DialogDescription style={{ fontFamily: 'var(--font-body)' }}>
                Monitor influencers and track engaged leads
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Custom Tab Buttons */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-4">
          <button
            onClick={() => setActiveTab('engagements')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'engagements'
                ? 'bg-white text-[#463939] shadow-sm'
                : 'text-muted-foreground hover:text-[#463939]'
            }`}
          >
            Engaged Leads ({engagedPeople.length})
          </button>
          <button
            onClick={() => setActiveTab('influencers')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'influencers'
                ? 'bg-white text-[#463939] shadow-sm'
                : 'text-muted-foreground hover:text-[#463939]'
            }`}
          >
            Tracking ({trackingInfluencers.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'engagements' && (
            <div className="space-y-4">
              {engagedPeople.map((person) => (
                <div
                  key={person.id}
                  className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3
                          className="font-semibold text-[#463939]"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {person.name}
                        </h3>
                        <Badge className={engagementTypeColors[person.engagementType]}>
                          {engagementTypeLabels[person.engagementType]}
                        </Badge>
                        <Badge className={icpMatchColors[person.icpMatch]}>
                          {icpMatchLabels[person.icpMatch]}
                        </Badge>
                        {person.pushedToClayAt && (
                          <Badge className="bg-green-100 text-green-800">
                            In Clay
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        {person.company && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{person.company}</span>
                          </div>
                        )}
                        {person.title && (
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            <span>{person.title}</span>
                          </div>
                        )}
                      </div>
                      {person.icpMatchReason && (
                        <p
                          className="text-sm text-muted-foreground mb-2"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {person.icpMatchReason}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Engaged with <span className="font-medium">{person.engagedWithInfluencerName}</span> on {person.engagedAt}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!person.pushedToClayAt ? (
                        <Button
                          size="sm"
                          onClick={() => onPushToClay(person.id)}
                          className="bg-[#407B9D] hover:bg-[#407B9D]/90"
                        >
                          Push to Clay
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 py-1.5 px-3">
                          Already in Clay
                        </Badge>
                      )}
                      {person.linkedinUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#407B9D] text-[#407B9D]"
                          onClick={() => window.open(person.linkedinUrl, '_blank')}
                        >
                          LinkedIn
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {engagedPeople.length === 0 && (
                <div className="text-center py-12">
                  <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                    No engaged leads yet. Start tracking influencers to capture engagements.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'influencers' && (
            <div className="space-y-4">
              {trackingInfluencers.map((influencer) => (
                <div
                  key={influencer.id}
                  className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3
                          className="font-semibold text-[#463939]"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {influencer.name}
                        </h3>
                        <Badge className={platformColors[influencer.platform]}>
                          {platformLabels[influencer.platform]}
                        </Badge>
                        <Badge className={influencerStatusColors[influencer.status]}>
                          {influencerStatusLabels[influencer.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {formatFollowers(influencer.followerCount)} followers | {influencer.averageEngagement}% engagement
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {influencer.niche.map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-slate-50"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#407B9D] text-[#407B9D]"
                      onClick={() => onViewInfluencer(influencer.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}

              {trackingInfluencers.length === 0 && (
                <div className="text-center py-12">
                  <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                    No influencers being tracked. Add influencers to Trigify to start tracking.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {trackingInfluencers.length} tracking | {unpushedEngagements.length} to review
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
