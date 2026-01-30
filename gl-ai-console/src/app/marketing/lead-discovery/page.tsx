"use client"

import { useState } from "react"
import { Search, Users, FlaskConical, ArrowRight } from "lucide-react"

// Components
import { InfluencerFinderCard } from "@/components/marketing/lead-discovery/influencer-finder-card"
import { HypothesisLabCard } from "@/components/marketing/lead-discovery/hypothesis-lab-card"
import { InfluencerFinderModal } from "@/components/marketing/lead-discovery/influencer-finder-modal"
import { HypothesisLabModal } from "@/components/marketing/lead-discovery/hypothesis-lab-modal"

// Test Data
import {
  testInfluencers,
} from "@/lib/lead-discovery-data"

import { Influencer, LeadHypothesis, HypothesisEntryMode } from "@/lib/lead-discovery-types"

export default function LeadDiscoveryPage() {
  // Modal states
  const [influencerFinderOpen, setInfluencerFinderOpen] = useState(false)
  const [hypothesisLabOpen, setHypothesisLabOpen] = useState(false)

  // Influencer state - start with empty array
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [isDiscovering, setIsDiscovering] = useState(false)

  // Hypothesis state - start with empty array
  const [hypotheses, setHypotheses] = useState<LeadHypothesis[]>([])
  const [hypothesisEntryMode, setHypothesisEntryMode] = useState<HypothesisEntryMode | null>(null)

  // Calculate stats from state
  const stats = {
    newInfluencers: influencers.filter(i => i.status === 'discovered').length,
    approvedInfluencers: influencers.filter(i => i.status === 'approved').length,
    inTrigify: influencers.filter(i => i.status === 'added_to_trigify').length,
    activeHypotheses: hypotheses.filter(h => h.status === 'draft' || h.status === 'validating' || h.status === 'approved' || h.status === 'active').length,
  }

  // Modal handlers
  const handleOpenModal = (modal: 'influencer' | 'hypothesis') => {
    switch (modal) {
      case 'influencer':
        setInfluencerFinderOpen(true)
        break
      case 'hypothesis':
        setHypothesisLabOpen(true)
        break
    }
  }

  const handleCloseModal = (modal: 'influencer' | 'hypothesis') => {
    switch (modal) {
      case 'influencer':
        setInfluencerFinderOpen(false)
        break
      case 'hypothesis':
        setHypothesisLabOpen(false)
        break
    }
  }

  // Influencer discovery handler
  const handleRunDiscovery = (type: 'general' | 'custom', customPrompt?: string) => {
    console.log('Running influencer discovery:', type, customPrompt)
    setIsDiscovering(true)

    // Simulate discovery delay (3 seconds)
    setTimeout(() => {
      // Add discovered influencers from test data with unique IDs
      const timestamp = Date.now()
      const newInfluencers = testInfluencers.map((inf, index) => ({
        ...inf,
        id: `${inf.id}-${timestamp}-${index}`, // Unique ID for each discovery run
        status: 'discovered' as const,
        discoveredAt: new Date().toISOString(),
      }))
      setInfluencers(prev => [...prev, ...newInfluencers])
      setIsDiscovering(false)
    }, 3000)
  }

  // Influencer action handlers
  const handleApproveInfluencer = (id: string) => {
    setInfluencers(prev => prev.map(inf =>
      inf.id === id ? { ...inf, status: 'approved' as const } : inf
    ))
  }

  const handleRejectInfluencer = (id: string) => {
    setInfluencers(prev => prev.filter(inf => inf.id !== id))
  }

  const handleAddToTrigify = (id: string) => {
    setInfluencers(prev => prev.map(inf =>
      inf.id === id ? { ...inf, status: 'added_to_trigify' as const, addedToTrigifyAt: new Date().toISOString() } : inf
    ))
  }

  const handleRemoveFromTrigify = (id: string) => {
    setInfluencers(prev => prev.map(inf =>
      inf.id === id ? { ...inf, status: 'approved' as const, addedToTrigifyAt: undefined } : inf
    ))
  }

  // Hypothesis workflow handler - opens modal and starts workflow
  const handleStartHypothesisWorkflow = (entryMode: HypothesisEntryMode) => {
    console.log('Starting hypothesis workflow:', entryMode)
    setHypothesisEntryMode(entryMode)
    setHypothesisLabOpen(true)
  }

  // Clear entry mode when modal closes
  const handleHypothesisModalClose = () => {
    setHypothesisLabOpen(false)
    setHypothesisEntryMode(null)
  }

  // Hypothesis action handlers
  const handleApproveHypothesis = (id: string) => {
    setHypotheses(prev => prev.map(hyp =>
      hyp.id === id ? { ...hyp, status: 'approved' as const, validatedAt: new Date().toISOString() } : hyp
    ))
  }

  const handleRejectHypothesis = (id: string) => {
    setHypotheses(prev => prev.filter(hyp => hyp.id !== id))
  }

  const handleMoveToPending = (id: string) => {
    setHypotheses(prev => prev.map(hyp =>
      hyp.id === id ? { ...hyp, status: 'draft' as const, validatedAt: undefined } : hyp
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF9F9] to-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header - Enhanced with gradient icon */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#95CBD7] to-[#407B9D] flex items-center justify-center shadow-lg shadow-[#95CBD7]/20">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-[#463939] tracking-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Lead Discovery
              </h1>
              <p
                className="text-muted-foreground text-sm"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Find influencers and generate lead hypotheses
              </p>
            </div>
          </div>
        </div>

        {/* Discovery Pipeline - Quick Navigation */}
        <div className="mb-8 flex items-center justify-center">
          <div className="inline-flex items-center bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 gap-1">
            <button
              onClick={() => handleOpenModal('influencer')}
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-[#407B9D]/5 transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#407B9D]/10 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4 text-[#407B9D]" />
              </div>
              <div className="text-left hidden sm:block">
                <p
                  className="text-sm font-medium text-[#463939] group-hover:text-[#407B9D] transition-colors"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Find Influencers
                </p>
                <p
                  className="text-xs text-[#999999]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  LinkedIn discovery
                </p>
              </div>
            </button>
            <div className="flex items-center mx-2">
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </div>
            <button
              onClick={() => handleOpenModal('hypothesis')}
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-[#C8E4BB]/10 transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#C8E4BB]/30 group-hover:scale-105 transition-transform">
                <FlaskConical className="w-4 h-4 text-[#407B9D]" />
              </div>
              <div className="text-left hidden sm:block">
                <p
                  className="text-sm font-medium text-[#463939] group-hover:text-[#407B9D] transition-colors"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Hypothesis Lab
                </p>
                <p
                  className="text-xs text-[#999999]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Generate & validate
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Workflow Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <InfluencerFinderCard
            newDiscoveriesCount={stats.newInfluencers}
            approvedCount={stats.approvedInfluencers + stats.inTrigify}
            isDiscovering={isDiscovering}
            onOpenModal={() => handleOpenModal('influencer')}
            onRunDiscovery={handleRunDiscovery}
          />
          <HypothesisLabCard
            activeHypothesesCount={stats.activeHypotheses}
            onOpenModal={() => handleOpenModal('hypothesis')}
            onStartWorkflow={handleStartHypothesisWorkflow}
          />
        </div>

        {/* Modals */}
        <InfluencerFinderModal
          open={influencerFinderOpen}
          onOpenChange={(open) => !open && handleCloseModal('influencer')}
          influencers={influencers}
          onApprove={handleApproveInfluencer}
          onReject={handleRejectInfluencer}
          onAddToTrigify={handleAddToTrigify}
          onRemoveFromTrigify={handleRemoveFromTrigify}
        />

        <HypothesisLabModal
          open={hypothesisLabOpen}
          onOpenChange={(open) => !open && handleHypothesisModalClose()}
          hypotheses={hypotheses}
          onApprove={handleApproveHypothesis}
          onReject={handleRejectHypothesis}
          onMoveToPending={handleMoveToPending}
          initialEntryMode={hypothesisEntryMode}
        />
      </div>
    </div>
  )
}
