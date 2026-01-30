// Marketing Content Engine Test Data

import {
  ContentItem,
  TopicIdea,
  ContentBrief,
  RepurposeItem,
  RefreshRecommendation,
  ChatMessage,
  FinalDraft,
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
  {
    id: 'content-18',
    title: 'Webinar: Mastering Cash Flow for Growing Businesses',
    type: 'external',
    url: 'https://rightworks.com/webinars/cash-flow-masterclass',
    dateCreated: '2025-01-15',
    status: 'published',
    keywords: ['webinar', 'cash flow', 'RightWorks', 'partnership'],
    author: 'Dan',
    description: 'Joint webinar with RightWorks on cash flow management strategies for growing businesses.',
  },
  {
    id: 'content-19',
    title: 'Guest Post: The Future of Outsourced Accounting',
    type: 'external',
    url: 'https://accountingtoday.com/guest/future-outsourced-accounting',
    dateCreated: '2024-11-20',
    status: 'published',
    keywords: ['guest post', 'outsourced accounting', 'industry trends'],
    author: 'Dan',
    description: 'Guest article published on Accounting Today discussing the evolution of outsourced accounting services.',
  },
  {
    id: 'content-20',
    title: 'Podcast Interview: Building a Fractional CFO Practice',
    type: 'external',
    url: 'https://cfoinsights.com/podcasts/fractional-cfo-practice',
    dateCreated: '2024-10-05',
    status: 'published',
    keywords: ['podcast', 'fractional CFO', 'interview', 'thought leadership'],
    author: 'Dan',
    description: 'Dan was interviewed on CFO Insights podcast about building a successful fractional CFO practice.',
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
    category: 'generalized',
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
    category: 'generalized',
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
    category: 'generalized',
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
    category: 'generalized',
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
    category: 'generalized',
    createdAt: '2025-01-22',
    createdBy: 'ai',
  },
  {
    id: 'topic-6',
    topic: 'How Bench Accounting Handles Month-End Close (And How You Can Do Better)',
    gapScore: 79,
    rationale: 'Competitor Bench ranks #2 for "month-end close process". Their blog gets 5K visits/month. We can create superior content targeting their audience.',
    suggestedFormat: 'blog',
    status: 'new',
    category: 'competitor',
    createdAt: '2025-01-22',
    createdBy: 'ai',
  },
  {
    id: 'topic-7',
    topic: 'Why Companies Are Switching from Pilot to Fractional CFOs',
    gapScore: 85,
    rationale: 'Pilot (competitor) has significant market share. Their customers often outgrow their services. Position our fractional CFO offering as the next step.',
    suggestedFormat: 'blog',
    relatedContentIds: ['content-3'],
    status: 'new',
    category: 'competitor',
    createdAt: '2025-01-22',
    createdBy: 'ai',
  },
  {
    id: 'topic-8',
    topic: 'New FASB Standards 2025: What Your Business Needs to Know',
    gapScore: 91,
    rationale: 'FASB announced new lease accounting changes effective 2025. High search potential as businesses scramble to comply. Time-sensitive opportunity.',
    suggestedFormat: 'blog',
    status: 'new',
    category: 'market_trends',
    createdAt: '2025-01-22',
    createdBy: 'ai',
  },
  {
    id: 'topic-9',
    topic: 'AI in Accounting: What CFOs Need to Know for 2025',
    gapScore: 88,
    rationale: 'AI accounting tools are trending topic. 340% increase in search volume year-over-year. Position as thought leaders on AI adoption.',
    suggestedFormat: 'youtube',
    status: 'new',
    category: 'market_trends',
    createdAt: '2025-01-22',
    createdBy: 'ai',
  },
  {
    id: 'topic-10',
    topic: 'Interest Rate Changes 2025: Financial Planning Implications',
    gapScore: 76,
    rationale: 'Fed rate decisions affecting business planning. Timely content opportunity as rates are expected to shift. Good for thought leadership.',
    suggestedFormat: 'linkedin',
    status: 'new',
    category: 'market_trends',
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
    currentStep: 'outline',
    targetFormat: 'blog',
    targetKeywords: ['tax planning 2025', 'Q1 tax strategy', 'business tax tips'],
    outline: [
      { id: 'section-1', title: 'Introduction - Why Q1 tax planning matters', description: 'Hook readers with the cost of procrastination. Include stat on penalties.' },
      { id: 'section-2', title: 'Key tax deadlines for Q1 2025', description: 'Timeline/calendar visual of important dates.' },
      { id: 'section-3', title: 'Top 5 strategies to implement now', description: 'Actionable tips with examples.' },
      { id: 'section-4', title: 'Common mistakes to avoid', description: 'What not to do - cautionary tales.' },
      { id: 'section-5', title: 'Checklist: Your Q1 tax prep action items', description: 'Downloadable PDF checklist offer.' },
      { id: 'section-6', title: 'CTA - Schedule a tax planning consultation', description: 'Clear next step with calendar link.' },
    ],
    outlineApproved: false,
    notes: 'Tie into existing tax planning blog. Include downloadable checklist as lead magnet.',
    assignedTo: 'Alison',
    createdAt: '2025-01-20',
    updatedAt: '2025-01-21',
  },
  {
    id: 'brief-2',
    title: 'Revenue Recognition Best Practices for SaaS Companies',
    status: 'in_progress',
    currentStep: 'first_draft',
    targetFormat: 'blog',
    targetKeywords: ['SaaS revenue recognition', 'ASC 606', 'deferred revenue'],
    outline: [
      { id: 'section-1', title: 'Introduction - The complexity of SaaS revenue', description: 'Why SaaS revenue is uniquely challenging.' },
      { id: 'section-2', title: 'ASC 606 overview and why it matters', description: 'Plain-English explanation of the standard.' },
      { id: 'section-3', title: '5 common revenue recognition mistakes', description: 'Real examples from our experience.' },
      { id: 'section-4', title: 'Best practices for clean revenue reporting', description: 'Step-by-step process recommendations.' },
      { id: 'section-5', title: 'Tools and systems that help', description: 'Software recommendations and integrations.' },
      { id: 'section-6', title: 'Case study snippet from TechStart', description: 'Before/after transformation story.' },
      { id: 'section-7', title: 'CTA - Get a revenue recognition assessment', description: 'Free assessment offer.' },
    ],
    outlineApproved: true,
    firstDraft: `# Revenue Recognition Best Practices for SaaS Companies

Revenue recognition in SaaS is notoriously complex. With subscription models, usage-based pricing, and multi-element arrangements, getting it right requires both technical knowledge and practical experience.

## The Complexity of SaaS Revenue

Unlike traditional businesses where revenue is recognized at the point of sale, SaaS companies must navigate a maze of timing issues...

[Draft continues with placeholder content for each section...]

## ASC 606 Overview and Why It Matters

ASC 606 established a five-step model for revenue recognition that applies to all contracts with customers...

## 5 Common Revenue Recognition Mistakes

1. **Recognizing revenue before performance obligations are satisfied** - Many SaaS companies...
2. **Failing to properly allocate transaction prices** - When bundles include multiple elements...
3. **Ignoring variable consideration** - Usage-based components require estimation...
4. **Inconsistent treatment of contract modifications** - Upgrades and downgrades...
5. **Poor documentation of judgments** - Auditors need to see your reasoning...

## Best Practices for Clean Revenue Reporting

Start with a robust contract review process...

## Tools and Systems That Help

Consider implementing RevPro, Zuora Revenue, or similar solutions...

## TechStart Solutions: A Success Story

When TechStart came to us, they were manually tracking revenue in spreadsheets...

## Ready to Get Your Revenue Recognition Right?

Schedule a free revenue recognition assessment with our team...`,
    faqs: [
      { id: 'faq-1', question: 'What is ASC 606?', answer: 'ASC 606 is the revenue recognition standard that establishes a comprehensive framework for determining when and how to recognize revenue from contracts with customers.' },
      { id: 'faq-2', question: 'When should SaaS companies recognize subscription revenue?', answer: 'SaaS subscription revenue should be recognized ratably over the subscription period as the service is delivered, not upfront when payment is received.' },
      { id: 'faq-3', question: 'How do you handle revenue recognition for annual contracts paid monthly?', answer: 'The full annual contract value should be allocated across the service period. Monthly payments affect cash flow, not revenue recognition timing.' },
    ],
    internalLinks: [
      { id: 'link-1', title: 'GrowthLab Client Success: TechStart Solutions Case Study', url: '/case-studies/techstart-solutions', type: 'internal', context: 'Reference in the case study section' },
      { id: 'link-2', title: 'FP&A vs. Accounting: Understanding the Difference', url: '/blog/fpa-vs-accounting', type: 'internal', context: 'Link when discussing financial reporting' },
    ],
    externalLinks: [
      { id: 'link-3', title: 'FASB ASC 606 Overview', url: 'https://fasb.org/asc606', type: 'external', context: 'Link in the ASC 606 section for official reference' },
      { id: 'link-4', title: 'SEC Revenue Recognition Guidance', url: 'https://sec.gov/revenue-recognition', type: 'external', context: 'Additional authority for public companies' },
    ],
    recommendedAuthor: 'dan',
    sourceTopicId: 'topic-3',
    assignedTo: 'Dan',
    createdAt: '2025-01-18',
    updatedAt: '2025-01-20',
  },
  {
    id: 'brief-3',
    title: 'LinkedIn Series: Finance Team Building Tips',
    status: 'in_progress',
    currentStep: 'outline',
    targetFormat: 'linkedin',
    targetKeywords: ['finance hiring', 'CFO', 'controller', 'finance team'],
    outline: [
      { id: 'section-1', title: 'Post 1: Signs you need finance help (teaser)', description: 'Hook with pain points founders experience.' },
      { id: 'section-2', title: 'Post 2: Fractional vs full-time decision framework', description: 'Simple decision tree for choosing.' },
      { id: 'section-3', title: 'Post 3: First hire - bookkeeper, controller, or CFO?', description: 'Role comparison for different stages.' },
      { id: 'section-4', title: 'Post 4: Building the right finance stack', description: 'Tools and systems recommendations.' },
      { id: 'section-5', title: 'Post 5: Our journey helping 50+ companies build finance teams', description: 'Social proof and CTA.' },
    ],
    outlineApproved: false,
    notes: 'Create as a 5-part series. Schedule over 2 weeks. Use consistent hashtags.',
    sourceTopicId: 'topic-4',
    assignedTo: 'Alison',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-22',
  },
  {
    id: 'brief-4',
    title: 'Fractional CFO vs Full-Time CFO Cost Comparison',
    status: 'in_progress',
    currentStep: 'final_review',
    targetFormat: 'blog',
    targetKeywords: ['fractional CFO cost', 'CFO salary', 'fractional vs full-time CFO'],
    outline: [
      { id: 'section-1', title: 'Introduction - The CFO decision every growing company faces', description: 'Set up the comparison.' },
      { id: 'section-2', title: 'Full-Time CFO: Total Cost of Ownership', description: 'Salary, benefits, equity, overhead.' },
      { id: 'section-3', title: 'Fractional CFO: Flexible Investment', description: 'Typical engagement models and costs.' },
      { id: 'section-4', title: 'Side-by-Side Comparison Table', description: 'Visual breakdown of costs.' },
      { id: 'section-5', title: 'When Each Option Makes Sense', description: 'Decision framework based on company stage.' },
      { id: 'section-6', title: 'Real Examples from GrowthLab Clients', description: 'Anonymized case examples.' },
      { id: 'section-7', title: 'CTA - Calculate Your CFO Needs', description: 'Interactive calculator or consultation offer.' },
    ],
    outlineApproved: true,
    firstDraft: `# Fractional CFO vs Full-Time CFO: A Complete Cost Comparison

Every growing company reaches a point where DIY finances no longer cut it. But should you hire a full-time CFO or engage a fractional CFO? The answer often comes down to cost—but not in the way you might think.

## Full-Time CFO: Total Cost of Ownership

When you hire a full-time CFO, salary is just the beginning. Let's break down the real numbers:

**Base Salary:** $250,000 - $400,000
**Benefits & Insurance:** $30,000 - $60,000
**Equity (0.5-2% over 4 years):** Value varies by company
**Recruiting Costs:** $75,000 - $150,000 (25-30% of first-year salary)
**Onboarding & Ramp Time:** 3-6 months to full productivity

**Total Year-One Investment:** $400,000 - $650,000+

## Fractional CFO: Flexible Investment

Fractional CFO engagements offer a different model entirely:

**Monthly Retainer:** $5,000 - $15,000
**Typical Engagement:** 20-40 hours per month
**No benefits, equity, or recruiting costs**
**Immediate productivity with experienced hire**

**Annual Investment:** $60,000 - $180,000

## Side-by-Side Comparison

| Factor | Full-Time CFO | Fractional CFO |
|--------|---------------|----------------|
| Annual Cost | $400K-$650K+ | $60K-$180K |
| Time to Value | 3-6 months | Immediate |
| Flexibility | Low | High |
| Experience Level | Varies | Usually senior |

## When Each Option Makes Sense

**Choose Full-Time When:**
- Revenue exceeds $50M annually
- Complex capital structure or M&A activity
- Need dedicated, daily strategic input
- Building out a full finance team

**Choose Fractional When:**
- Revenue between $2M - $50M
- Need strategic guidance without full overhead
- Rapid scaling with changing needs
- Want senior expertise without senior cost

## Real Examples from GrowthLab Clients

**Company A (Series A SaaS):** Engaged fractional CFO at $10K/month. Saved $300K+ compared to full-time hire while navigating fundraise.

**Company B (PE-Backed Services):** Started fractional, transitioned to full-time at $75M revenue when complexity justified the investment.

## Calculate Your CFO Needs

Not sure which option is right for your company? Schedule a free consultation to discuss your specific situation and get a customized recommendation.

[Schedule Consultation Button]`,
    faqs: [
      { id: 'faq-1', question: 'What is a fractional CFO?', answer: 'A fractional CFO is an experienced finance executive who works with your company on a part-time or project basis, typically 20-40 hours per month, providing strategic financial leadership without the cost of a full-time hire.' },
      { id: 'faq-2', question: 'How much does a fractional CFO cost?', answer: 'Fractional CFO services typically range from $5,000 to $15,000 per month, depending on the scope of work and level of experience. This is significantly less than the $400K-$650K+ annual cost of a full-time CFO.' },
      { id: 'faq-3', question: 'At what revenue level should I hire a full-time CFO?', answer: 'Most companies transition from fractional to full-time CFO when they reach $50M+ in revenue, have complex capital structures, or need daily strategic financial leadership. Before that point, a fractional CFO often provides better value.' },
    ],
    internalLinks: [
      { id: 'link-1', title: '5 Signs You Need a Fractional CFO', url: '/blog/signs-need-fractional-cfo', type: 'internal', context: 'Link in the introduction section' },
      { id: 'link-2', title: 'When to Hire Your First Controller', url: '/blog/hire-first-controller', type: 'internal', context: 'Reference in the finance team building discussion' },
    ],
    externalLinks: [
      { id: 'link-3', title: 'CFO Salary Survey - Robert Half', url: 'https://roberthalf.com/salary-guide/cfo', type: 'external', context: 'Source for salary data' },
    ],
    recommendedAuthor: 'dan',
    finalDraft: `# Fractional CFO vs Full-Time CFO: A Complete Cost Comparison

[Full polished content here - same as firstDraft but with final edits applied]

Every growing company reaches a point where DIY finances no longer cut it...

[Content continues...]`,
    sourceTopicId: 'topic-1',
    assignedTo: 'Dan',
    createdAt: '2025-01-22',
    updatedAt: '2025-01-25',
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
  // Repurpose and Refresh start empty - items only appear as users complete workflows
  const readyToRepurpose = 0
  const needsRefresh = 0

  return {
    newIdeas,
    briefsInProgress,
    readyToRepurpose,
    needsRefresh,
    totalContent: testContentLibrary.length,
  }
}

// ===================
// Final Drafts Test Data
// ===================

export const testFinalDrafts: FinalDraft[] = [
  {
    id: 'final-1',
    briefId: 'brief-4',
    title: 'Fractional CFO vs Full-Time CFO: A Complete Cost Comparison',
    targetFormat: 'blog',
    content: `# Fractional CFO vs Full-Time CFO: A Complete Cost Comparison

Every growing company reaches a point where DIY finances no longer cut it. But should you hire a full-time CFO or engage a fractional CFO? The answer often comes down to cost—but not in the way you might think.

## Full-Time CFO: Total Cost of Ownership

When you hire a full-time CFO, salary is just the beginning. Let's break down the real numbers:

**Base Salary:** $250,000 - $400,000
**Benefits & Insurance:** $30,000 - $60,000
**Equity (0.5-2% over 4 years):** Value varies by company
**Recruiting Costs:** $75,000 - $150,000 (25-30% of first-year salary)
**Onboarding & Ramp Time:** 3-6 months to full productivity

**Total Year-One Investment:** $400,000 - $650,000+

## Fractional CFO: Flexible Investment

Fractional CFO engagements offer a different model entirely:

**Monthly Retainer:** $5,000 - $15,000
**Typical Engagement:** 20-40 hours per month
**No benefits, equity, or recruiting costs**
**Immediate productivity with experienced hire**

**Annual Investment:** $60,000 - $180,000

## Side-by-Side Comparison

| Factor | Full-Time CFO | Fractional CFO |
|--------|---------------|----------------|
| Annual Cost | $400K-$650K+ | $60K-$180K |
| Time to Value | 3-6 months | Immediate |
| Flexibility | Low | High |
| Experience Level | Varies | Usually senior |

## When Each Option Makes Sense

**Choose Full-Time When:**
- Revenue exceeds $50M annually
- Complex capital structure or M&A activity
- Need dedicated, daily strategic input
- Building out a full finance team

**Choose Fractional When:**
- Revenue between $2M - $50M
- Need strategic guidance without full overhead
- Rapid scaling with changing needs
- Want senior expertise without senior cost

## Real Examples from GrowthLab Clients

**Company A (Series A SaaS):** Engaged fractional CFO at $10K/month. Saved $300K+ compared to full-time hire while navigating fundraise.

**Company B (PE-Backed Services):** Started fractional, transitioned to full-time at $75M revenue when complexity justified the investment.

## Frequently Asked Questions

**What is a fractional CFO?**
A fractional CFO is an experienced finance executive who works with your company on a part-time or project basis, typically 20-40 hours per month, providing strategic financial leadership without the cost of a full-time hire.

**How much does a fractional CFO cost?**
Fractional CFO services typically range from $5,000 to $15,000 per month, depending on the scope of work and level of experience. This is significantly less than the $400K-$650K+ annual cost of a full-time CFO.

**At what revenue level should I hire a full-time CFO?**
Most companies transition from fractional to full-time CFO when they reach $50M+ in revenue, have complex capital structures, or need daily strategic financial leadership.

## Calculate Your CFO Needs

Not sure which option is right for your company? Schedule a free consultation to discuss your specific situation and get a customized recommendation.`,
    faqs: [
      { id: 'faq-1', question: 'What is a fractional CFO?', answer: 'A fractional CFO is an experienced finance executive who works with your company on a part-time or project basis, typically 20-40 hours per month, providing strategic financial leadership without the cost of a full-time hire.' },
      { id: 'faq-2', question: 'How much does a fractional CFO cost?', answer: 'Fractional CFO services typically range from $5,000 to $15,000 per month, depending on the scope of work and level of experience. This is significantly less than the $400K-$650K+ annual cost of a full-time CFO.' },
      { id: 'faq-3', question: 'At what revenue level should I hire a full-time CFO?', answer: 'Most companies transition from fractional to full-time CFO when they reach $50M+ in revenue, have complex capital structures, or need daily strategic financial leadership. Before that point, a fractional CFO often provides better value.' },
    ],
    author: 'Dan Fennessy',
    approvedAt: '2025-01-25',
    keywords: ['fractional CFO cost', 'CFO salary', 'fractional vs full-time CFO'],
  },
  {
    id: 'final-2',
    briefId: 'brief-old-1',
    title: 'The Complete Guide to Month-End Close Process',
    targetFormat: 'blog',
    content: `# The Complete Guide to Month-End Close Process

A well-executed month-end close is the foundation of financial health. Here's how to streamline yours...

[Full blog content here]

## What is Month-End Close?

The month-end close is the process of reviewing, reconciling, and reporting all financial transactions...

## The 5-Day Close Framework

Day 1: Cutoff and data collection
Day 2: Reconciliations
Day 3: Accruals and adjustments
Day 4: Review and analysis
Day 5: Reporting and sign-off

## Common Close Challenges

1. Late invoices and receipts
2. Missing documentation
3. Bank reconciliation delays
4. Cross-department coordination
5. Manual processes

## Best Practices for Faster Close

- Implement close calendar with clear deadlines
- Automate routine reconciliations
- Use checklists for consistency
- Hold pre-close meetings
- Document everything

## Frequently Asked Questions

**How long should month-end close take?**
Best-in-class companies close within 5 business days. Average is 7-10 days. If you're taking longer than 15 days, there's significant room for improvement.

**What are the most critical month-end tasks?**
Bank reconciliations, revenue recognition review, expense accruals, and inter-company transactions are typically the highest priority items.`,
    author: 'Dan Fennessy',
    approvedAt: '2025-01-15',
    publishedAt: '2025-01-18',
    keywords: ['month-end close', 'financial close process', 'close calendar'],
  },
]
