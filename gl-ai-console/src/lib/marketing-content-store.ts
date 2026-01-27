// Marketing Content Store - localStorage persistence for Topic Radar and Brief Builder

import {
  TopicIdea,
  ContentBrief,
  FinalDraft,
  TopicCategory,
  TopicIdeaStatus,
  BriefStep,
  ContentType,
  OutlineSection,
  FAQ,
  LinkRecommendation,
} from './marketing-content-types'

// Storage keys
const TOPIC_IDEAS_KEY = 'marketing_topic_ideas'
const APPROVED_IDEAS_KEY = 'marketing_approved_ideas'
const BRIEFS_KEY = 'marketing_briefs'
const FINAL_DRAFTS_KEY = 'marketing_final_drafts'

// ===================
// Topic Ideas Store
// ===================

export function getTopicIdeas(): TopicIdea[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(TOPIC_IDEAS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveTopicIdeas(ideas: TopicIdea[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOPIC_IDEAS_KEY, JSON.stringify(ideas))
}

export function addTopicIdeas(newIdeas: TopicIdea[]): TopicIdea[] {
  const current = getTopicIdeas()
  const updated = [...current, ...newIdeas]
  saveTopicIdeas(updated)
  return updated
}

export function updateTopicIdea(ideaId: string, updates: Partial<TopicIdea>): TopicIdea[] {
  const current = getTopicIdeas()
  const updated = current.map(idea =>
    idea.id === ideaId ? { ...idea, ...updates } : idea
  )
  saveTopicIdeas(updated)
  return updated
}

export function removeTopicIdea(ideaId: string): TopicIdea[] {
  const current = getTopicIdeas()
  const updated = current.filter(idea => idea.id !== ideaId)
  saveTopicIdeas(updated)
  return updated
}

export function clearTopicIdeas(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOPIC_IDEAS_KEY)
}

// ===================
// Approved Ideas Store
// ===================
// These are ideas approved from Topic Radar, waiting to be turned into briefs

export function getApprovedIdeas(): TopicIdea[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(APPROVED_IDEAS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveApprovedIdeas(ideas: TopicIdea[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(APPROVED_IDEAS_KEY, JSON.stringify(ideas))
}

export function addApprovedIdea(idea: TopicIdea): TopicIdea[] {
  const current = getApprovedIdeas()
  // Update status to approved when adding
  const approvedIdea = { ...idea, status: 'approved' as TopicIdeaStatus }
  const updated = [...current, approvedIdea]
  saveApprovedIdeas(updated)
  return updated
}

export function removeApprovedIdea(ideaId: string): TopicIdea[] {
  const current = getApprovedIdeas()
  const updated = current.filter(idea => idea.id !== ideaId)
  saveApprovedIdeas(updated)
  return updated
}

export function clearApprovedIdeas(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(APPROVED_IDEAS_KEY)
}

// ===================
// Briefs Store
// ===================

export function getBriefs(): ContentBrief[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(BRIEFS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveBriefs(briefs: ContentBrief[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(BRIEFS_KEY, JSON.stringify(briefs))
}

export function addBrief(brief: ContentBrief): ContentBrief[] {
  const current = getBriefs()
  // Check if brief with this ID already exists - if so, update instead of adding
  const existingIndex = current.findIndex(b => b.id === brief.id)
  if (existingIndex >= 0) {
    // Update existing brief instead of adding duplicate
    const updated = current.map(b => b.id === brief.id ? { ...b, ...brief } : b)
    saveBriefs(updated)
    return updated
  }
  const updated = [...current, brief]
  saveBriefs(updated)
  return updated
}

export function updateBrief(briefId: string, updates: Partial<ContentBrief>): ContentBrief[] {
  const current = getBriefs()
  const updated = current.map(brief =>
    brief.id === briefId ? { ...brief, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : brief
  )
  saveBriefs(updated)
  return updated
}

export function removeBrief(briefId: string): ContentBrief[] {
  const current = getBriefs()
  const updated = current.filter(brief => brief.id !== briefId)
  saveBriefs(updated)
  return updated
}

export function getBriefById(briefId: string): ContentBrief | undefined {
  const briefs = getBriefs()
  return briefs.find(b => b.id === briefId)
}

export function clearBriefs(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(BRIEFS_KEY)
}

// ===================
// Final Drafts Store
// ===================

export function getFinalDrafts(): FinalDraft[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(FINAL_DRAFTS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveFinalDrafts(drafts: FinalDraft[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(FINAL_DRAFTS_KEY, JSON.stringify(drafts))
}

export function addFinalDraft(draft: FinalDraft): FinalDraft[] {
  const current = getFinalDrafts()
  const updated = [...current, draft]
  saveFinalDrafts(updated)
  return updated
}

export function updateFinalDraft(draftId: string, updates: Partial<FinalDraft>): FinalDraft[] {
  const current = getFinalDrafts()
  const updated = current.map(draft =>
    draft.id === draftId ? { ...draft, ...updates } : draft
  )
  saveFinalDrafts(updated)
  return updated
}

export function clearFinalDrafts(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(FINAL_DRAFTS_KEY)
}

// ===================
// Test Data Generation
// ===================

// Generate simulated topic ideas based on category
export function generateTopicIdeasForCategory(category: TopicCategory): TopicIdea[] {
  const now = new Date().toISOString().split('T')[0]
  const baseId = Date.now()

  const ideasByCategory: Record<TopicCategory, TopicIdea[]> = {
    generalized: [
      {
        id: `topic-gen-${baseId}-1`,
        topic: 'Fractional CFO vs Full-Time CFO: A Complete Cost Comparison',
        gapScore: 87,
        rationale: 'High search volume keyword (1,200/mo) with no existing content. Top 3 competitors rank for this term. Direct alignment with our services.',
        suggestedFormat: 'blog',
        relatedContentIds: ['content-3'],
        status: 'new',
        category: 'generalized',
        createdAt: now,
        createdBy: 'ai',
      },
      {
        id: `topic-gen-${baseId}-2`,
        topic: 'How to Prepare for a Financial Audit: Step-by-Step Guide',
        gapScore: 74,
        rationale: 'Moderate search volume (800/mo). We mention audits in several pieces but have no dedicated guide. Good lead gen opportunity.',
        suggestedFormat: 'blog',
        status: 'new',
        category: 'generalized',
        createdAt: now,
        createdBy: 'ai',
      },
      {
        id: `topic-gen-${baseId}-3`,
        topic: 'Revenue Recognition Best Practices for SaaS Companies',
        gapScore: 81,
        rationale: 'Technical topic with strong search intent. Many of our clients are SaaS. Could establish thought leadership in this niche.',
        suggestedFormat: 'blog',
        relatedContentIds: ['content-4'],
        status: 'new',
        category: 'generalized',
        createdAt: now,
        createdBy: 'ai',
      },
    ],
    competitor: [
      {
        id: `topic-comp-${baseId}-1`,
        topic: 'How Bench Accounting Handles Month-End Close (And How You Can Do Better)',
        gapScore: 79,
        rationale: 'Competitor Bench ranks #2 for "month-end close process". Their blog gets 5K visits/month. We can create superior content targeting their audience.',
        suggestedFormat: 'blog',
        status: 'new',
        category: 'competitor',
        createdAt: now,
        createdBy: 'ai',
      },
      {
        id: `topic-comp-${baseId}-2`,
        topic: 'Why Companies Are Switching from Pilot to Fractional CFOs',
        gapScore: 85,
        rationale: 'Pilot (competitor) has significant market share. Their customers often outgrow their services. Position our fractional CFO offering as the next step.',
        suggestedFormat: 'blog',
        relatedContentIds: ['content-3'],
        status: 'new',
        category: 'competitor',
        createdAt: now,
        createdBy: 'ai',
      },
      {
        id: `topic-comp-${baseId}-3`,
        topic: 'ScaleFactor Shutdown: Lessons Learned and What Comes Next',
        gapScore: 72,
        rationale: 'ScaleFactor customers are actively searching for alternatives. This is a timely piece that positions GrowthLab as a solution.',
        suggestedFormat: 'blog',
        status: 'new',
        category: 'competitor',
        createdAt: now,
        createdBy: 'ai',
      },
    ],
    market_trends: [
      {
        id: `topic-trend-${baseId}-1`,
        topic: 'New FASB Standards 2025: What Your Business Needs to Know',
        gapScore: 91,
        rationale: 'FASB announced new lease accounting changes effective 2025. High search potential as businesses scramble to comply. Time-sensitive opportunity.',
        suggestedFormat: 'blog',
        status: 'new',
        category: 'market_trends',
        createdAt: now,
        createdBy: 'ai',
      },
      {
        id: `topic-trend-${baseId}-2`,
        topic: 'AI in Accounting: What CFOs Need to Know for 2025',
        gapScore: 88,
        rationale: 'AI accounting tools are trending topic. 340% increase in search volume year-over-year. Position as thought leaders on AI adoption.',
        suggestedFormat: 'youtube',
        status: 'new',
        category: 'market_trends',
        createdAt: now,
        createdBy: 'ai',
      },
      {
        id: `topic-trend-${baseId}-3`,
        topic: 'Interest Rate Changes 2025: Financial Planning Implications',
        gapScore: 76,
        rationale: 'Fed rate decisions affecting business planning. Timely content opportunity as rates are expected to shift. Good for thought leadership.',
        suggestedFormat: 'linkedin',
        status: 'new',
        category: 'market_trends',
        createdAt: now,
        createdBy: 'ai',
      },
    ],
  }

  return ideasByCategory[category]
}

// Generate outline sections based on content type and title
export function generateOutlineForBrief(title: string, format: ContentType): OutlineSection[] {
  const baseId = Date.now()

  // Generic outline that works for most content types
  const outlines: OutlineSection[] = [
    {
      id: `section-${baseId}-1`,
      title: `Introduction - Why ${title.split(':')[0]} matters`,
      description: 'Hook readers with a compelling problem statement or statistic.',
    },
    {
      id: `section-${baseId}-2`,
      title: 'The Core Problem or Challenge',
      description: 'Define the problem your audience faces.',
    },
    {
      id: `section-${baseId}-3`,
      title: 'Key Insights and Solutions',
      description: 'Present your main points with supporting evidence.',
    },
    {
      id: `section-${baseId}-4`,
      title: 'Practical Steps or Framework',
      description: 'Actionable advice readers can implement.',
    },
    {
      id: `section-${baseId}-5`,
      title: 'Common Mistakes to Avoid',
      description: 'What not to do - adds value by preventing errors.',
    },
    {
      id: `section-${baseId}-6`,
      title: 'Conclusion and Next Steps',
      description: 'Summarize key points and include a clear CTA.',
    },
  ]

  // Adjust for LinkedIn (shorter)
  if (format === 'linkedin') {
    return outlines.slice(0, 4).map(s => ({ ...s, description: s.description + ' (Keep concise for LinkedIn)' }))
  }

  // Adjust for YouTube (script format)
  if (format === 'youtube') {
    return [
      { id: `section-${baseId}-1`, title: 'Hook (0:00-0:30)', description: 'Attention-grabbing opener' },
      { id: `section-${baseId}-2`, title: 'Intro & Context (0:30-1:30)', description: 'Introduce yourself and the topic' },
      { id: `section-${baseId}-3`, title: 'Main Content (1:30-5:00)', description: 'Core value delivery' },
      { id: `section-${baseId}-4`, title: 'Key Takeaways (5:00-6:00)', description: 'Summarize main points' },
      { id: `section-${baseId}-5`, title: 'CTA & Outro (6:00-6:30)', description: 'Subscribe, comment, next steps' },
    ]
  }

  return outlines
}

// Generate first draft content
export function generateFirstDraft(brief: Partial<ContentBrief>): string {
  const title = brief.title || 'Untitled Content'
  const outline = brief.outline || []

  let draft = `# ${title}\n\n`

  outline.forEach((section, index) => {
    draft += `## ${section.title}\n\n`
    draft += `${section.description || 'Content for this section...'}\n\n`

    // Add some placeholder content
    if (index === 0) {
      draft += `Every growing business reaches a point where they need to consider ${title.toLowerCase().split(' ').slice(0, 3).join(' ')}. In this comprehensive guide, we will explore everything you need to know.\n\n`
    } else if (index === outline.length - 1) {
      draft += `Ready to take the next step? Schedule a consultation with our team to discuss your specific needs and goals.\n\n`
    } else {
      draft += `This section covers important aspects of the topic that will help you make informed decisions...\n\n`
    }
  })

  return draft
}

// Generate FAQs based on the brief
export function generateFAQs(brief: Partial<ContentBrief>): FAQ[] {
  const baseId = Date.now()
  const title = brief.title || 'the topic'

  return [
    {
      id: `faq-${baseId}-1`,
      question: `What is the most important thing to know about ${title.toLowerCase().split(' ').slice(0, 4).join(' ')}?`,
      answer: 'The most critical factor is understanding your specific business needs and how they align with available solutions. Every situation is unique.',
    },
    {
      id: `faq-${baseId}-2`,
      question: 'How long does this typically take to implement?',
      answer: 'Implementation timelines vary based on complexity, but most businesses see initial results within 30-90 days of getting started.',
    },
    {
      id: `faq-${baseId}-3`,
      question: 'What are the typical costs involved?',
      answer: 'Costs depend on your specific requirements and scope. We recommend scheduling a consultation to discuss pricing tailored to your situation.',
    },
  ]
}

// Generate link recommendations
export function generateLinkRecommendations(brief: Partial<ContentBrief>): { internal: LinkRecommendation[], external: LinkRecommendation[] } {
  const baseId = Date.now()

  return {
    internal: [
      {
        id: `link-int-${baseId}-1`,
        title: '5 Signs You Need a Fractional CFO',
        url: '/blog/signs-need-fractional-cfo',
        type: 'internal',
        context: 'Reference in the introduction section',
      },
      {
        id: `link-int-${baseId}-2`,
        title: 'Client Success: TechStart Solutions',
        url: '/case-studies/techstart-solutions',
        type: 'internal',
        context: 'Link when discussing real-world examples',
      },
    ],
    external: [
      {
        id: `link-ext-${baseId}-1`,
        title: 'FASB Official Guidelines',
        url: 'https://fasb.org/standards',
        type: 'external',
        context: 'Cite for authoritative reference',
      },
      {
        id: `link-ext-${baseId}-2`,
        title: 'Industry Research Report',
        url: 'https://example.com/research',
        type: 'external',
        context: 'Source for statistics mentioned',
      },
    ],
  }
}

// Create a brief from an approved topic idea
export function createBriefFromTopicIdea(idea: TopicIdea): ContentBrief {
  const now = new Date().toISOString().split('T')[0]
  const outline = generateOutlineForBrief(idea.topic, idea.suggestedFormat)

  return {
    id: `brief-${Date.now()}`,
    title: idea.topic,
    status: 'draft',
    currentStep: 'outline',
    targetFormat: idea.suggestedFormat,
    targetKeywords: idea.topic.toLowerCase().split(' ').filter(w => w.length > 3).slice(0, 5),
    outline,
    outlineApproved: false,
    sourceTopicId: idea.id,
    createdAt: now,
    updatedAt: now,
  }
}

// Create a new empty brief for manual input
export function createEmptyBrief(): ContentBrief {
  const now = new Date().toISOString().split('T')[0]

  return {
    id: `brief-${Date.now()}`,
    title: '',
    status: 'draft',
    currentStep: 'format_selection',
    targetFormat: 'blog',
    targetKeywords: [],
    outline: [],
    outlineApproved: false,
    createdAt: now,
    updatedAt: now,
  }
}

// Create a final draft from a completed brief
export function createFinalDraftFromBrief(brief: ContentBrief, authorName: string): FinalDraft {
  const now = new Date().toISOString().split('T')[0]

  return {
    id: `final-${Date.now()}`,
    briefId: brief.id,
    title: brief.title,
    targetFormat: brief.targetFormat,
    content: brief.finalDraft || brief.firstDraft || '',
    faqs: brief.faqs,
    author: authorName,
    approvedAt: now,
    keywords: brief.targetKeywords,
  }
}

// ===================
// Stats Calculation
// ===================

export function getMarketingStats() {
  const ideas = getTopicIdeas()
  const briefs = getBriefs()
  const finalDrafts = getFinalDrafts()

  return {
    newIdeas: ideas.filter(i => i.status === 'new').length,
    approvedIdeas: ideas.filter(i => i.status === 'approved').length,
    briefsInProgress: briefs.filter(b => b.status !== 'completed').length,
    completedBriefs: briefs.filter(b => b.status === 'completed').length,
    finalDraftsReady: finalDrafts.filter(d => !d.publishedAt).length,
    totalFinalDrafts: finalDrafts.length,
  }
}
