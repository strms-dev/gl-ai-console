"use client"

import { useState } from "react"
import { Search } from "lucide-react"

// Components
import { InfluencerFinderCard } from "@/components/marketing/lead-discovery/influencer-finder-card"
import { HypothesisLabCard } from "@/components/marketing/lead-discovery/hypothesis-lab-card"
import { InfluencerFinderModal } from "@/components/marketing/lead-discovery/influencer-finder-modal"
import { HypothesisLabModal } from "@/components/marketing/lead-discovery/hypothesis-lab-modal"

// Test Data
import {
  testInfluencers,
  testHypotheses,
} from "@/lib/lead-discovery-data"

import { Influencer, LeadHypothesis } from "@/lib/lead-discovery-types"

export default function LeadDiscoveryPage() {
  // Modal states
  const [influencerFinderOpen, setInfluencerFinderOpen] = useState(false)
  const [hypothesisLabOpen, setHypothesisLabOpen] = useState(false)

  // Influencer state - start with empty array
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [isDiscovering, setIsDiscovering] = useState(false)

  // Hypothesis state - start with empty array
  const [hypotheses, setHypotheses] = useState<LeadHypothesis[]>([])
  const [isGeneratingHypotheses, setIsGeneratingHypotheses] = useState(false)

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

  // Hypothesis generation handler
  const handleNewHypothesis = (type: 'general' | 'custom', customPrompt?: string) => {
    console.log('Generating hypotheses:', type, customPrompt)
    setIsGeneratingHypotheses(true)

    // Simulate generation delay (3 seconds)
    setTimeout(() => {
      // Generate hypotheses from test data with unique IDs
      const timestamp = Date.now()
      const newHypotheses: LeadHypothesis[] = testHypotheses.map((hyp, index) => ({
        ...hyp,
        id: `${hyp.id}-${timestamp}-${index}`, // Unique ID for each generation run
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        leadsGenerated: 0,
      }))
      setHypotheses(prev => [...prev, ...newHypotheses])
      setIsGeneratingHypotheses(false)
    }, 3000)
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
    <div className="min-h-screen bg-[#FAF9F9]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#407B9D]/10 flex items-center justify-center">
              <Search className="w-6 h-6 text-[#407B9D]" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-[#463939]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Lead Discovery
              </h1>
              <p
                className="text-muted-foreground"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Find influencers and generate lead hypotheses
              </p>
            </div>
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
            isGenerating={isGeneratingHypotheses}
            onOpenModal={() => handleOpenModal('hypothesis')}
            onNewHypothesis={handleNewHypothesis}
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
          onOpenChange={(open) => !open && handleCloseModal('hypothesis')}
          hypotheses={hypotheses}
          onApprove={handleApproveHypothesis}
          onReject={handleRejectHypothesis}
          onMoveToPending={handleMoveToPending}
        />
      </div>
    </div>
  )
}
