// Marketing Content Engine Test Data

import {
  ContentItem,
  TopicIdea,
  ContentBrief,
  RepurposeItem,
  RefreshRecommendation,
  ChatMessage,
} from './marketing-content-types'

// ===================
// Content Library Test Data
// ===================

export const testContentLibrary: ContentItem[] = [
  {
    id: 'content-1',
    title: 'The Ultimate Guide to 13-Week Cash Flow Forecasting',
    type: 'blog',
    url: 'https://growthlab.com/blog/13-week-cash-flow',
    dateCreated: '2024-08-15',
    lastUpdated: '2024-08-15',
    status: 'published',
    keywords: ['cash flow', 'forecasting', 'financial planning', '13-week'],
    wordCount: 2450,
    author: 'Dan',
    description: 'A comprehensive guide to implementing 13-week cash flow forecasting for better financial visibility.',
  },
  {
    id: 'content-2',
    title: 'Why Outsourced Accounting is the Future for Growing Businesses',
    type: 'linkedin',
    url: 'https://linkedin.com/posts/dangrowthlab/outsourced-accounting',
    dateCreated: '2025-01-10',
    status: 'published',
    author: 'Dan',
    description: 'LinkedIn post discussing the benefits of outsourced accounting for scaling companies.',
  },
  {
    id: 'content-3',
    title: '5 Signs You Need a Fractional CFO',
    type: 'blog',
    url: 'https://growthlab.com/blog/signs-need-fractional-cfo',
    dateCreated: '2024-03-10',
    lastUpdated: '2024-03-10',
    status: 'published',
    keywords: ['fractional CFO', 'financial leadership', 'CFO services'],
    wordCount: 1850,
    author: 'Dan',
    description: 'Key indicators that your business has outgrown DIY finances and needs fractional CFO support.',
  },
  {
    id: 'content-4',
    title: 'GrowthLab Client Success: TechStart Solutions Case Study',
    type: 'case_study',
    url: 'https://growthlab.com/case-studies/techstart-solutions',
    dateCreated: '2024-06-20',
    lastUpdated: '2024-06-20',
    status: 'published',
    keywords: ['case study', 'SaaS', 'financial transformation'],
    wordCount: 1200,
    description: 'How TechStart Solutions achieved 40% better cash visibility with GrowthLab.',
  },
  {
    id: 'content-5',
    title: 'Understanding Financial Close: Best Practices for Month-End',
    type: 'youtube',
    url: 'https://youtube.com/watch?v=abc123',
    dateCreated: '2024-09-05',
    status: 'published',
    author: 'Dan',
    description: 'Video walkthrough of efficient month-end close processes.',
  },
  {
    id: 'content-6',
    title: 'Our Services - Outsourced Accounting',
    type: 'website_page',
    url: 'https://growthlab.com/services/outsourced-accounting',
    dateCreated: '2023-01-15',
    lastUpdated: '2024-11-01',
    status: 'published',
    keywords: ['outsourced accounting', 'bookkeeping', 'services'],
    description: 'Service page describing GrowthLab outsourced accounting offerings.',
  },
  {
    id: 'content-7',
    title: 'Tax Planning Strategies Every Business Owner Should Know',
    type: 'blog',
    url: 'https://growthlab.com/blog/tax-planning-strategies',
    dateCreated: '2024-02-15',
    lastUpdated: '2024-02-15',
    status: 'published',
    keywords: ['tax planning', 'tax strategy', 'business taxes'],
    wordCount: 2100,
    author: 'Alison',
    description: 'Essential tax planning strategies for business owners to minimize liability.',
  },
  {
    id: 'content-8',
    title: 'The Power of KPIs: Metrics That Matter for Growth',
    type: 'linkedin',
    url: 'https://linkedin.com/posts/dangrowthlab/kpi-metrics',
    dateCreated: '2024-12-15',
    status: 'published',
    author: 'Dan',
    description: 'Post about key performance indicators every growing business should track.',
  },
  {
    id: 'content-9',
    title: 'FP&A vs. Accounting: Understanding the Difference',
    type: 'blog',
    url: 'https://growthlab.com/blog/fpa-vs-accounting',
    dateCreated: '2024-07-22',
    lastUpdated: '2024-07-22',
    status: 'published',
    keywords: ['FP&A', 'accounting', 'financial planning', 'analysis'],
    wordCount: 1650,
    author: 'Dan',
    description: 'Explaining the distinction between financial planning & analysis and traditional accounting.',
  },
  {
    id: 'content-10',
    title: 'Scaling Your Business: Financial Infrastructure Checklist',
    type: 'youtube',
    url: 'https://youtube.com/watch?v=def456',
    dateCreated: '2024-10-12',
    status: 'published',
    author: 'Dan',
    description: 'Video guide on building financial infrastructure to support business growth.',
  },
  {
    id: 'content-11',
    title: 'Client Review Meeting - Acme Corp Q4 2024',
    type: 'meeting_transcript',
    dateCreated: '2024-12-18',
    status: 'published',
    keywords: ['client meeting', 'quarterly review', 'Acme Corp'],
    description: 'Quarterly review meeting discussing Q4 performance and 2025 planning.',
  },
  {
    id: 'content-12',
    title: 'When to Hire Your First Controller',
    type: 'blog',
    url: 'https://growthlab.com/blog/hire-first-controller',
    dateCreated: '2024-05-08',
    lastUpdated: '2024-05-08',
    status: 'published',
    keywords: ['controller', 'hiring', 'finance team', 'scaling'],
    wordCount: 1900,
    author: 'Dan',
    description: 'Guide to knowing when your business needs a dedicated controller.',
  },
  {
    id: 'content-13',
    title: 'Sales Discovery Call - TechVenture Inc',
    type: 'meeting_transcript',
    dateCreated: '2025-01-15',
    status: 'published',
    keywords: ['sales call', 'discovery', 'SaaS', 'pain points'],
    author: 'Tim',
    description: 'Discovery call with TechVenture discussing their cash flow challenges and need for FP&A support.',
  },
  {
    id: 'content-14',
    title: 'Team Standup - Content Strategy Planning',
    type: 'meeting_transcript',
    dateCreated: '2025-01-20',
    status: 'published',
    keywords: ['internal meeting', 'content planning', 'strategy'],
    author: 'Alison',
    description: 'Weekly marketing standup discussing Q1 content priorities and upcoming campaigns.',
  },
  {
    id: 'content-15',
    title: 'Customer Success Call - StartupCo Monthly Review',
    type: 'meeting_transcript',
    dateCreated: '2025-01-10',
    status: 'published',
    keywords: ['customer success', 'monthly review', 'StartupCo', 'testimonial potential'],
    author: 'Tim',
    description: 'Monthly review with StartupCo - great testimonial opportunity, client mentioned 50% time savings.',
  },
  {
    id: 'content-16',
    title: '2025 Tax Deadline Guide for Small Businesses',
    type: 'blog',
    url: 'https://growthlab.com/blog/2025-tax-deadlines',
    dateCreated: '2024-12-01',
    lastUpdated: '2024-12-01',
    status: 'published',
    keywords: ['tax deadlines', '2025 taxes', 'small business', 'compliance'],
    wordCount: 1400,
    author: 'Alison',
    description: 'Complete guide to 2025 tax deadlines and filing requirements for small businesses.',
  },
  {
    id: 'content-17',
    title: 'Q4 2024 Economic Outlook for Small Business Owners',
    type: 'blog',
    url: 'https://growthlab.com/blog/q4-2024-economic-outlook',
    dateCreated: '2024-09-15',
    lastUpdated: '2024-09-15',
    status: 'published',
    keywords: ['economic outlook', 'Q4 2024', 'interest rates', 'planning'],
    wordCount: 1800,
    author: 'Dan',
    description: 'Analysis of Q4 2024 economic conditions and what they mean for small businesses.',
  },
]

// ===================
// Topic Radar Test Data
// ===================

export const testTopicIdeas: TopicIdea[] = [
  {
    id: 'topic-1',
    topic: 'Fractional CFO vs Full-Time CFO: A Complete Cost Comparison',
    gapScore: 87,
    rationale: 'High search volume keyword (1,200/mo) with no existing content. Top 3 competitors rank for this term. Direct alignment with our services.',
    suggestedFormat: 'blog',
    relatedContentIds: ['content-3'],
    status: 'new',
    createdAt: '2025-01-22',
    createdBy: 'ai',
  },
  {
    id: 'topic-2',
    topic: 'How to Prepare for a Financial Audit: Step-by-Step Guide',
    gapScore: 74,
    rationale: 'Moderate search volume (800/mo). We mention audits in several pieces but have no dedicated guide. Good lead gen opportunity.',
    suggestedFormat: 'blog',
    status: 'new',
    createdAt: '2025-01-22',
    createdBy: 'ai',
  },
  {
    id: 'topic-3',
    topic: 'Revenue Recognition Best Practices for SaaS Companies',
    gapScore: 81,
    rationale: 'Technical topic with strong search intent. Many of our clients are SaaS. Could establish thought leadership in this niche.',
    suggestedFormat: 'blog',
    relatedContentIds: ['content-4'],
    status: 'approved',
    createdAt: '2025-01-20',
    createdBy: 'ai',
  },
  {
    id: 'topic-4',
    topic: 'Building a Finance Team: From Startup to Scale-Up',
    gapScore: 68,
    rationale: 'Related to existing content on hiring controllers. Could be expanded into a comprehensive guide covering multiple roles.',
    suggestedFormat: 'youtube',
    relatedContentIds: ['content-12'],
    status: 'new',
    createdAt: '2025-01-22',
    createdBy: 'ai',
  },
  {
    id: 'topic-5',
    topic: 'The True Cost of Bad Bookkeeping',
    gapScore: 72,
    rationale: 'Pain point topic with emotional hook. Could drive awareness of outsourced accounting benefits. Good for LinkedIn.',
    suggestedFormat: 'linkedin',
    relatedContentIds: ['content-2', 'content-6'],
    status: 'new',
    createdAt: '2025-01-22',
    createdBy: 'ai',
  },
]

// ===================
// Brief Builder Test Data
// ===================

export const testBriefs: ContentBrief[] = [
  {
    id: 'brief-1',
    title: 'Tax Planning Strategies for Q1 2025',
    status: 'draft',
    targetFormat: 'blog',
    targetKeywords: ['tax planning 2025', 'Q1 tax strategy', 'business tax tips'],
    outline: [
      'Introduction - Why Q1 tax planning matters',
      'Key tax deadlines for Q1 2025',
      'Top 5 strategies to implement now',
      'Common mistakes to avoid',
      'Checklist: Your Q1 tax prep action items',
      'CTA - Schedule a tax planning consultation',
    ],
    notes: 'Tie into existing tax planning blog. Include downloadable checklist as lead magnet.',
    assignedTo: 'Alison',
    createdAt: '2025-01-20',
    updatedAt: '2025-01-21',
  },
  {
    id: 'brief-2',
    title: 'Revenue Recognition Best Practices for SaaS Companies',
    status: 'approved',
    targetFormat: 'blog',
    targetKeywords: ['SaaS revenue recognition', 'ASC 606', 'deferred revenue'],
    outline: [
      'Introduction - The complexity of SaaS revenue',
      'ASC 606 overview and why it matters',
      '5 common revenue recognition mistakes',
      'Best practices for clean revenue reporting',
      'Tools and systems that help',
      'Case study snippet from TechStart',
      'CTA - Get a revenue recognition assessment',
    ],
    sourceTopicId: 'topic-3',
    assignedTo: 'Dan',
    createdAt: '2025-01-18',
    updatedAt: '2025-01-20',
  },
  {
    id: 'brief-3',
    title: 'LinkedIn Series: Finance Team Building Tips',
    status: 'in_progress',
    targetFormat: 'linkedin',
    targetKeywords: ['finance hiring', 'CFO', 'controller', 'finance team'],
    outline: [
      'Post 1: Signs you need finance help (teaser)',
      'Post 2: Fractional vs full-time decision framework',
      'Post 3: First hire - bookkeeper, controller, or CFO?',
      'Post 4: Building the right finance stack',
      'Post 5: Our journey helping 50+ companies build finance teams',
    ],
    notes: 'Create as a 5-part series. Schedule over 2 weeks. Use consistent hashtags.',
    sourceTopicId: 'topic-4',
    assignedTo: 'Alison',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-22',
  },
]

// ===================
// Repurpose Factory Test Data
// ===================

export const testRepurposeItems: RepurposeItem[] = [
  {
    id: 'repurpose-1',
    sourceContentId: 'content-1',
    sourceTitle: 'The Ultimate Guide to 13-Week Cash Flow Forecasting',
    sourceType: 'blog',
    sourceOrigin: 'scraped', // Auto-imported from website
    suggestedFormats: ['linkedin', 'youtube'],
    repurposedCount: 0,
  },
  {
    id: 'repurpose-2',
    sourceContentId: 'content-5',
    sourceTitle: 'Understanding Financial Close: Best Practices for Month-End',
    sourceType: 'youtube',
    sourceOrigin: 'uploaded', // Dan uploaded video
    suggestedFormats: ['blog', 'linkedin'],
    repurposedCount: 1,
    lastRepurposed: '2024-10-15',
  },
  {
    id: 'repurpose-3',
    sourceContentId: 'content-4',
    sourceTitle: 'GrowthLab Client Success: TechStart Solutions Case Study',
    sourceType: 'case_study',
    sourceOrigin: 'uploaded', // Manually written case study
    suggestedFormats: ['linkedin', 'blog'],
    repurposedCount: 0,
  },
  {
    id: 'repurpose-4',
    sourceContentId: 'content-9',
    sourceTitle: 'FP&A vs. Accounting: Understanding the Difference',
    sourceType: 'blog',
    sourceOrigin: 'ai_generated', // AI-generated content
    suggestedFormats: ['linkedin', 'youtube'],
    repurposedCount: 0,
  },
  {
    id: 'repurpose-5',
    sourceContentId: 'content-10',
    sourceTitle: 'Scaling Your Business: Financial Infrastructure Checklist',
    sourceType: 'youtube',
    sourceOrigin: 'uploaded', // Dan uploaded video
    suggestedFormats: ['blog', 'linkedin'],
    repurposedCount: 0,
  },
  {
    id: 'repurpose-6',
    sourceContentId: 'content-15',
    sourceTitle: 'Customer Success Call - StartupCo Monthly Review',
    sourceType: 'meeting_transcript',
    sourceOrigin: 'scraped', // Auto-imported from Fireflies
    suggestedFormats: ['case_study', 'linkedin'],
    repurposedCount: 0,
  },
]

// ===================
// Refresh Finder Test Data
// ===================

export const testRefreshRecommendations: RefreshRecommendation[] = [
  {
    id: 'refresh-1',
    contentId: 'content-3',
    title: '5 Signs You Need a Fractional CFO',
    contentType: 'blog',
    currentRanking: 15,
    previousRanking: 8,
    trafficChange: -32,
    lastUpdated: '2024-03-10',
    recommendedActions: [
      'Update statistics with 2025 data',
      'Add section on AI/automation trends',
      'Refresh meta description for better CTR',
      'Add internal links to newer content',
    ],
    priority: 'high',
    status: 'pending',
    refreshTrigger: 'analytics_decay',
  },
  {
    id: 'refresh-2',
    contentId: 'content-7',
    title: 'Tax Planning Strategies Every Business Owner Should Know',
    contentType: 'blog',
    currentRanking: 12,
    previousRanking: 10,
    trafficChange: -18,
    lastUpdated: '2024-02-15',
    recommendedActions: [
      'Update for 2025 tax law changes',
      'Add section on new deductions',
      'Include Q1 2025 deadlines',
    ],
    priority: 'high',
    status: 'pending',
    refreshTrigger: 'analytics_decay',
  },
  {
    id: 'refresh-3',
    contentId: 'content-6',
    title: 'Our Services - Outsourced Accounting',
    contentType: 'website_page',
    trafficChange: -8,
    lastUpdated: '2024-11-01',
    recommendedActions: [
      'Add new client logos',
      'Update pricing section if applicable',
      'Add FAQ schema markup',
    ],
    priority: 'medium',
    status: 'pending',
    refreshTrigger: 'analytics_decay',
  },
  {
    id: 'refresh-4',
    contentId: 'content-12',
    title: 'When to Hire Your First Controller',
    contentType: 'blog',
    currentRanking: 22,
    previousRanking: 18,
    trafficChange: -25,
    lastUpdated: '2024-05-08',
    recommendedActions: [
      'Add salary benchmarks for 2025',
      'Include remote hiring considerations',
      'Link to fractional CFO content',
    ],
    priority: 'medium',
    status: 'pending',
    refreshTrigger: 'analytics_decay',
  },
  {
    id: 'refresh-5',
    contentId: 'content-16',
    title: '2025 Tax Deadline Guide for Small Businesses',
    contentType: 'blog',
    lastUpdated: '2024-12-01',
    recommendedActions: [
      'Update with any new IRS announcements',
      'Add Q2-Q4 deadline details',
      'Include state-specific deadline variations',
    ],
    priority: 'high',
    status: 'pending',
    refreshTrigger: 'time_sensitive',
    timeSensitiveDate: '2025',
  },
  {
    id: 'refresh-6',
    contentId: 'content-17',
    title: 'Q4 2024 Economic Outlook for Small Business Owners',
    contentType: 'blog',
    lastUpdated: '2024-09-15',
    recommendedActions: [
      'Archive or redirect to new 2025 outlook',
      'Consider creating Q1 2025 update',
      'Add note that content is dated',
    ],
    priority: 'high',
    status: 'pending',
    refreshTrigger: 'time_sensitive',
    timeSensitiveDate: 'Q4 2024',
  },
]

// ===================
// Chat Test Data
// ===================

export const testChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'What content gaps do we have around CFO topics?',
    timestamp: '2025-01-22T09:15:00Z',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: 'Based on the Topic Radar analysis, I found a significant gap around "Fractional CFO vs Full-Time CFO" comparisons. This has high search volume (1,200/mo) and your competitors rank well for it, but you have no dedicated content. Your existing "5 Signs You Need a Fractional CFO" blog could serve as a foundation, but a direct cost comparison piece would capture searchers at a different stage of their decision journey.',
    timestamp: '2025-01-22T09:15:30Z',
  },
  {
    id: 'msg-3',
    role: 'user',
    content: 'That makes sense. What format would work best for that topic?',
    timestamp: '2025-01-22T09:16:00Z',
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content: 'I recommend a comprehensive blog post (1,500-2,000 words) as the primary format. This topic involves detailed cost breakdowns and comparison tables that work well in written form. After publishing, you could repurpose it into: 1) A LinkedIn carousel showing the cost comparison visually, and 2) A short YouTube video where Dan walks through the decision framework. This gives you multiple touchpoints from one piece of content.',
    timestamp: '2025-01-22T09:16:45Z',
  },
]

// ===================
// Dashboard Stats (computed from test data)
// ===================

export const getDashboardStats = () => {
  const newIdeas = testTopicIdeas.filter(t => t.status === 'new').length
  const briefsInProgress = testBriefs.filter(b => b.status === 'draft' || b.status === 'in_progress').length
  const readyToRepurpose = testRepurposeItems.filter(r => r.repurposedCount === 0).length
  const needsRefresh = testRefreshRecommendations.filter(r => r.priority === 'high').length

  return {
    newIdeas,
    briefsInProgress,
    readyToRepurpose,
    needsRefresh,
    totalContent: testContentLibrary.length,
  }
}
