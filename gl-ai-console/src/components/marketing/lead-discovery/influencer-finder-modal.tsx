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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ExternalLink, Users, TrendingUp, CheckCircle, Linkedin, X, ArrowLeft } from "lucide-react"
import {
  Influencer,
  influencerStatusLabels,
  influencerStatusColors,
  icpMatchLabels,
  icpMatchColors,
} from "@/lib/lead-discovery-types"

interface InfluencerFinderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  influencers: Influencer[]
  onApprove: (influencerId: string) => void
  onReject: (influencerId: string) => void
  onAddToTrigify: (influencerId: string) => void
  onRemoveFromTrigify: (influencerId: string) => void
}

export function InfluencerFinderModal({
  open,
  onOpenChange,
  influencers,
  onApprove,
  onReject,
  onAddToTrigify,
  onRemoveFromTrigify,
}: InfluencerFinderModalProps) {
  const [activeTab, setActiveTab] = useState<'discovered' | 'approved'>('discovered')

  // Filter influencers by status
  const discoveredInfluencers = influencers.filter(i => i.status === 'discovered')
  const approvedInfluencers = influencers.filter(i => i.status === 'approved')
  const inTrigifyInfluencers = influencers.filter(i => i.status === 'added_to_trigify')

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  const InfluencerCard = ({
    influencer,
    section,
  }: {
    influencer: Influencer
    section: 'discovered' | 'approved' | 'in_trigify'
  }) => (
    <div className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3
              className="font-semibold text-[#463939]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {influencer.name}
            </h3>
            <Badge className="bg-sky-100 text-sky-800">
              <Linkedin className="w-3 h-3 mr-1" />
              LinkedIn
            </Badge>
            <Badge className={influencerStatusColors[influencer.status]}>
              {influencerStatusLabels[influencer.status]}
            </Badge>
          </div>
          <p
            className="text-sm text-muted-foreground mb-3"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {influencer.icpMatchReason}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#407B9D]" />
              <span className="font-medium text-[#463939]">
                {formatFollowers(influencer.followerCount)} followers
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#407B9D]" />
              <span className="text-muted-foreground">
                {influencer.averageEngagement}% engagement
              </span>
            </div>
            <Badge className={icpMatchColors[influencer.icpMatch]}>
              {icpMatchLabels[influencer.icpMatch]}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {influencer.niche.map((tag, idx) => (
              <Badge
                key={idx}
                className="text-xs bg-slate-50 border border-slate-200"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {section === 'discovered' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-[#407B9D] text-[#407B9D]"
                onClick={() => window.open(influencer.profileUrl, '_blank')}
              >
                View Profile
                <ExternalLink className="w-4 h-4 ml-1" />
              </Button>
              <Button
                size="sm"
                onClick={() => onApprove(influencer.id)}
                className="bg-[#C8E4BB] text-[#463939] hover:bg-[#C8E4BB]/80"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(influencer.id)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          {section === 'approved' && (
            <>
              <Button
                size="sm"
                onClick={() => onAddToTrigify(influencer.id)}
                className="bg-[#407B9D] hover:bg-[#407B9D]/90"
              >
                Add to Trigify
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[#407B9D] text-[#407B9D]"
                onClick={() => window.open(influencer.profileUrl, '_blank')}
              >
                View Profile
                <ExternalLink className="w-4 h-4 ml-1" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(influencer.id)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </>
          )}
          {section === 'in_trigify' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-[#407B9D] text-[#407B9D]"
                onClick={() => window.open(influencer.profileUrl, '_blank')}
              >
                View Profile
                <ExternalLink className="w-4 h-4 ml-1" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemoveFromTrigify(influencer.id)}
                className="text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Remove from Trigify
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#407B9D]/10 flex items-center justify-center">
              <Search className="w-5 h-5 text-[#407B9D]" />
            </div>
            <div>
              <DialogTitle
                className="text-xl text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Influencer Finder
              </DialogTitle>
              <DialogDescription style={{ fontFamily: 'var(--font-body)' }}>
                Discover and approve LinkedIn influencers to track in Trigify
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'discovered' | 'approved')}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="discovered" className="relative">
              Discovered
              {discoveredInfluencers.length > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                  {discoveredInfluencers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="relative">
              Approved
              {(approvedInfluencers.length + inTrigifyInfluencers.length) > 0 && (
                <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                  {approvedInfluencers.length + inTrigifyInfluencers.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discovered" className="flex-1 overflow-y-auto mt-0">
            <div className="space-y-4">
              {discoveredInfluencers.map((influencer) => (
                <InfluencerCard
                  key={influencer.id}
                  influencer={influencer}
                  section="discovered"
                />
              ))}

              {discoveredInfluencers.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                    No influencers discovered yet. Run a discovery to find matches.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="flex-1 overflow-y-auto mt-0">
            <div className="space-y-6">
              {/* Approved but not yet in Trigify */}
              {approvedInfluencers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                    Ready to Add to Trigify ({approvedInfluencers.length})
                  </h4>
                  <div className="space-y-4">
                    {approvedInfluencers.map((influencer) => (
                      <InfluencerCard
                        key={influencer.id}
                        influencer={influencer}
                        section="approved"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Already in Trigify */}
              {inTrigifyInfluencers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                    Already in Trigify ({inTrigifyInfluencers.length})
                  </h4>
                  <div className="space-y-4">
                    {inTrigifyInfluencers.map((influencer) => (
                      <InfluencerCard
                        key={influencer.id}
                        influencer={influencer}
                        section="in_trigify"
                      />
                    ))}
                  </div>
                </div>
              )}

              {approvedInfluencers.length === 0 && inTrigifyInfluencers.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                    No approved influencers yet. Review discovered influencers to approve them.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {influencers.length} influencer{influencers.length !== 1 ? 's' : ''} total
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
