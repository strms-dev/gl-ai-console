import {
  Influencer,
  EngagedPerson,
  LeadHypothesis,
  ClayLead,
  LeadChatMessage,
  LeadDashboardStats,
} from './lead-discovery-types'

// ===================
// Influencer Test Data
// ===================

export const testInfluencers: Influencer[] = [
  {
    id: 'inf-1',
    name: 'Sarah Chen',
    platform: 'linkedin',
    profileUrl: 'https://linkedin.com/in/sarahchen-cfo',
    followerCount: 45000,
    averageEngagement: 4.2,
    niche: ['fractional CFO', 'SaaS finance', 'startup growth'],
    icpMatch: 'high',
    icpMatchReason: 'Audience is primarily SaaS founders and finance leaders - direct match to GrowthLab ICP.',
    status: 'tracking',
    addedToTrigifyAt: '2025-01-15',
    discoveredAt: '2025-01-10',
    discoveredBy: 'ai',
  },
  {
    id: 'inf-2',
    name: 'Mike Rodriguez',
    platform: 'youtube',
    profileUrl: 'https://youtube.com/@mikefinance',
    followerCount: 120000,
    averageEngagement: 6.8,
    niche: ['small business finance', 'bookkeeping tips', 'cash flow'],
    icpMatch: 'high',
    icpMatchReason: 'Content focuses on financial challenges faced by growing businesses. High engagement from our target market.',
    status: 'added_to_trigify',
    addedToTrigifyAt: '2025-01-20',
    discoveredAt: '2025-01-18',
    discoveredBy: 'ai',
  },
  {
    id: 'inf-3',
    name: 'Jennifer Walsh',
    platform: 'linkedin',
    profileUrl: 'https://linkedin.com/in/jwalsh-startup',
    followerCount: 28000,
    averageEngagement: 5.1,
    niche: ['startup operations', 'fundraising', 'scaling'],
    icpMatch: 'medium',
    icpMatchReason: 'Startup-focused audience, but more operations than finance. Still valuable for awareness.',
    status: 'reviewing',
    discoveredAt: '2025-01-22',
    discoveredBy: 'ai',
  },
  {
    id: 'inf-4',
    name: 'The CFO Playbook',
    platform: 'podcast',
    profileUrl: 'https://cfoplaybook.com',
    followerCount: 15000,
    averageEngagement: 8.5,
    niche: ['CFO strategies', 'financial leadership', 'B2B SaaS'],
    icpMatch: 'high',
    icpMatchReason: 'Podcast listeners are highly engaged finance decision-makers. Perfect for thought leadership.',
    status: 'discovered',
    discoveredAt: '2025-01-23',
    discoveredBy: 'ai',
  },
  {
    id: 'inf-5',
    name: 'Alex Thompson',
    platform: 'newsletter',
    profileUrl: 'https://financeweekly.substack.com',
    followerCount: 8500,
    averageEngagement: 42.0, // open rate
    niche: ['finance news', 'accounting trends', 'SMB finance'],
    icpMatch: 'medium',
    icpMatchReason: 'Newsletter reaches finance professionals but broader than our core ICP.',
    status: 'discovered',
    discoveredAt: '2025-01-24',
    discoveredBy: 'Alison',
  },
]

// ===================
// Engaged People Test Data
// ===================

export const testEngagedPeople: EngagedPerson[] = [
  {
    id: 'eng-1',
    name: 'David Park',
    company: 'TechNova Inc',
    title: 'CEO',
    linkedinUrl: 'https://linkedin.com/in/davidpark-technova',
    engagementType: 'comment',
    engagedWithInfluencerId: 'inf-1',
    engagedWithInfluencerName: 'Sarah Chen',
    engagedPostUrl: 'https://linkedin.com/posts/sarahchen/cash-flow-tips',
    engagedAt: '2025-01-22',
    icpMatch: 'high',
    icpMatchReason: 'Series A SaaS company, 25 employees, actively commented about needing better financial ops.',
    pushedToClayAt: '2025-01-22',
    leadStatus: 'enriched',
  },
  {
    id: 'eng-2',
    name: 'Lisa Martinez',
    company: 'GrowthMode Labs',
    title: 'COO',
    linkedinUrl: 'https://linkedin.com/in/lisamartinez',
    engagementType: 'like',
    engagedWithInfluencerId: 'inf-1',
    engagedWithInfluencerName: 'Sarah Chen',
    engagedAt: '2025-01-21',
    icpMatch: 'medium',
    icpMatchReason: 'B2B SaaS company but primarily operations focused.',
  },
  {
    id: 'eng-3',
    name: 'Ryan Chen',
    company: 'DataStack',
    title: 'Founder & CEO',
    linkedinUrl: 'https://linkedin.com/in/ryanchen-datastack',
    email: 'ryan@datastack.io',
    engagementType: 'comment',
    engagedWithInfluencerId: 'inf-2',
    engagedWithInfluencerName: 'Mike Rodriguez',
    engagedPostUrl: 'https://youtube.com/watch?v=cashflow101',
    engagedAt: '2025-01-20',
    icpMatch: 'high',
    icpMatchReason: 'Seed-stage data company, commented asking about fractional CFO recommendations.',
    pushedToClayAt: '2025-01-21',
    leadStatus: 'in_outreach',
  },
  {
    id: 'eng-4',
    name: 'Amanda Foster',
    company: 'CloudServe Pro',
    title: 'VP Finance',
    linkedinUrl: 'https://linkedin.com/in/amandafoster',
    engagementType: 'share',
    engagedWithInfluencerId: 'inf-1',
    engagedWithInfluencerName: 'Sarah Chen',
    engagedAt: '2025-01-19',
    icpMatch: 'high',
    icpMatchReason: 'Mid-market SaaS, shared post about needing FP&A support.',
    pushedToClayAt: '2025-01-20',
    leadStatus: 'ready_for_outreach',
  },
  {
    id: 'eng-5',
    name: 'Michael Torres',
    company: 'AppFlow Solutions',
    title: 'CEO',
    linkedinUrl: 'https://linkedin.com/in/michaeltorres',
    engagementType: 'follow',
    engagedWithInfluencerId: 'inf-2',
    engagedWithInfluencerName: 'Mike Rodriguez',
    engagedAt: '2025-01-23',
    icpMatch: 'high',
    icpMatchReason: 'Series B SaaS company, recently followed after video on financial planning.',
  },
]

// ===================
// Hypothesis Test Data
// ===================

export const testHypotheses: LeadHypothesis[] = [
  {
    id: 'hyp-1',
    title: 'Recently Funded SaaS Startups (Series A)',
    description: 'SaaS companies that raised Series A in the last 6 months typically need to formalize their finance function. They have capital and are scaling rapidly.',
    targetCriteria: [
      'Raised Series A ($5M-$20M)',
      'SaaS/B2B software',
      'US-based',
      'No in-house CFO yet',
      '15-50 employees',
    ],
    estimatedLeadCount: 85,
    confidenceScore: 78,
    dataSource: 'Crunchbase + LinkedIn Sales Navigator',
    status: 'active',
    leadsGenerated: 23,
    createdAt: '2025-01-10',
    createdBy: 'ai',
    validatedAt: '2025-01-12',
    validatedBy: 'Tim',
  },
  {
    id: 'hyp-2',
    title: 'Companies Searching for Fractional CFO',
    description: 'Companies actively searching for fractional CFO services on LinkedIn or job boards but have not filled the role.',
    targetCriteria: [
      'Posted fractional CFO job in last 30 days',
      'Job still open',
      'Company size 20-200',
      'B2B company',
    ],
    estimatedLeadCount: 42,
    confidenceScore: 92,
    dataSource: 'LinkedIn Jobs + Indeed',
    status: 'approved',
    leadsGenerated: 0,
    createdAt: '2025-01-15',
    createdBy: 'ai',
    validatedAt: '2025-01-18',
    validatedBy: 'Dan',
  },
  {
    id: 'hyp-3',
    title: 'E-commerce Brands Hitting $2M+ Revenue',
    description: 'E-commerce brands crossing $2M ARR often struggle with inventory financing and cash flow - prime candidates for outsourced accounting.',
    targetCriteria: [
      'E-commerce / DTC brand',
      '$2M-$10M revenue',
      'Shopify or similar platform',
      'No dedicated finance team',
    ],
    estimatedLeadCount: 120,
    confidenceScore: 65,
    dataSource: 'Shopify partner network + SimilarWeb',
    status: 'validating',
    leadsGenerated: 0,
    createdAt: '2025-01-20',
    createdBy: 'Alison',
  },
  {
    id: 'hyp-4',
    title: 'Tax Season Pain Point Outreach',
    description: 'Companies that had tax filing issues last year or are searching for tax-related content.',
    targetCriteria: [
      'Engaged with tax-related content',
      'Small business (10-100 employees)',
      'Had late filings or amendments',
    ],
    estimatedLeadCount: 200,
    confidenceScore: 55,
    dataSource: 'Content engagement + IRS public data',
    status: 'draft',
    leadsGenerated: 0,
    createdAt: '2025-01-23',
    createdBy: 'ai',
  },
]

// ===================
// Clay Pipeline Test Data
// ===================

export const testClayLeads: ClayLead[] = [
  {
    id: 'lead-1',
    name: 'David Park',
    company: 'TechNova Inc',
    title: 'CEO',
    email: 'david@technova.io',
    linkedinUrl: 'https://linkedin.com/in/davidpark-technova',
    source: 'influencer_engagement',
    sourceId: 'inf-1',
    sourceName: 'Sarah Chen (LinkedIn)',
    icpMatch: 'high',
    status: 'enriched',
    enrichmentData: {
      companySize: '25-50',
      industry: 'B2B SaaS',
      revenue: '$2M-$5M ARR',
      techStack: ['AWS', 'Stripe', 'HubSpot'],
      recentNews: 'Raised $8M Series A in November 2024',
    },
    addedAt: '2025-01-22',
    enrichedAt: '2025-01-22',
  },
  {
    id: 'lead-2',
    name: 'Ryan Chen',
    company: 'DataStack',
    title: 'Founder & CEO',
    email: 'ryan@datastack.io',
    linkedinUrl: 'https://linkedin.com/in/ryanchen-datastack',
    source: 'influencer_engagement',
    sourceId: 'inf-2',
    sourceName: 'Mike Rodriguez (YouTube)',
    icpMatch: 'high',
    status: 'in_outreach',
    enrichmentData: {
      companySize: '10-25',
      industry: 'Data/Analytics SaaS',
      revenue: '$500K-$1M ARR',
      techStack: ['GCP', 'Snowflake', 'dbt'],
      recentNews: 'Seed round closed Q4 2024',
    },
    addedAt: '2025-01-21',
    enrichedAt: '2025-01-21',
    outreachSentAt: '2025-01-22',
  },
  {
    id: 'lead-3',
    name: 'Amanda Foster',
    company: 'CloudServe Pro',
    title: 'VP Finance',
    linkedinUrl: 'https://linkedin.com/in/amandafoster',
    source: 'influencer_engagement',
    sourceId: 'inf-1',
    sourceName: 'Sarah Chen (LinkedIn)',
    icpMatch: 'high',
    status: 'ready_for_outreach',
    enrichmentData: {
      companySize: '50-100',
      industry: 'Cloud Infrastructure',
      revenue: '$5M-$10M ARR',
      techStack: ['Azure', 'Salesforce', 'NetSuite'],
    },
    addedAt: '2025-01-20',
    enrichedAt: '2025-01-20',
  },
  {
    id: 'lead-4',
    name: 'Jennifer Wong',
    company: 'ScaleUp Labs',
    title: 'CEO',
    email: 'jen@scaleuplabs.com',
    linkedinUrl: 'https://linkedin.com/in/jenwong',
    source: 'hypothesis',
    sourceId: 'hyp-1',
    sourceName: 'Recently Funded SaaS Startups',
    icpMatch: 'high',
    status: 'responded',
    enrichmentData: {
      companySize: '30-50',
      industry: 'HR Tech SaaS',
      revenue: '$3M-$5M ARR',
      techStack: ['AWS', 'Stripe', 'Intercom'],
      recentNews: 'Series A closed December 2024, $12M raised',
    },
    addedAt: '2025-01-18',
    enrichedAt: '2025-01-18',
    outreachSentAt: '2025-01-19',
    respondedAt: '2025-01-21',
  },
  {
    id: 'lead-5',
    name: 'Marcus Johnson',
    company: 'FinFlow',
    title: 'Co-Founder',
    linkedinUrl: 'https://linkedin.com/in/marcusjohnson',
    source: 'hypothesis',
    sourceId: 'hyp-1',
    sourceName: 'Recently Funded SaaS Startups',
    icpMatch: 'medium',
    status: 'enriching',
    addedAt: '2025-01-23',
  },
]

// ===================
// Chat Test Data
// ===================

export const testLeadChatMessages: LeadChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'What influencers should we prioritize for Trigify tracking?',
    timestamp: '2025-01-24T09:15:00Z',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: 'Based on my analysis, I recommend prioritizing Sarah Chen and The CFO Playbook podcast. Sarah has a highly engaged LinkedIn following of finance decision-makers, and her audience directly matches our ICP. The CFO Playbook, while smaller, has exceptional engagement (8.5%) and reaches exactly the right decision-makers. Both would give us access to qualified leads who are actively seeking financial guidance.',
    timestamp: '2025-01-24T09:15:30Z',
  },
]

// ===================
// Dashboard Stats Function
// ===================

export const getLeadDashboardStats = (): LeadDashboardStats => {
  const newInfluencers = testInfluencers.filter(i => i.status === 'discovered').length
  const trackingInfluencers = testInfluencers.filter(i => i.status === 'tracking' || i.status === 'added_to_trigify').length
  const engagedLeads = testEngagedPeople.filter(e => !e.pushedToClayAt).length
  const activeHypotheses = testHypotheses.filter(h => h.status === 'active' || h.status === 'approved').length
  const leadsInClay = testClayLeads.length
  const readyForOutreach = testClayLeads.filter(l => l.status === 'ready_for_outreach').length

  return {
    newInfluencers,
    trackingInfluencers,
    engagedLeads,
    activeHypotheses,
    leadsInClay,
    readyForOutreach,
  }
}
