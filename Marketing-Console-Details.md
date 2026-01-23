Priority 3: Marketing — AI Workflows + Agents, guided by a simple Console
Owner: Nick
Why this matters
Marketing spans content, SEO, social/community, GTM outbound, events, and reporting—across HubSpot, Semrush, GA/Search Console, Duda, YouTube, Unify, Trigify, HeyReach, Clay, etc. Centralizing “what happens next” and letting AI carry the repetitive work frees Alison to focus on ideas, creative quality, and GTM strategy.
What the Console & Agent do (plainly)
Console: One place to review/approve and keep moving. Most work runs in the background; the team mainly approves drafts, green-lights sends, and answers short clarifications.


Process awareness: The Console and conversational Agent know where each campaign/task sits and suggest the next step, highlighting actions AI can execute now (e.g., build a brief, repurpose for channels, pull Trigify engagers, launch a sequence, post the scorecard).


How Alison interacts: They can ask or instruct in natural language (e.g., “give me evidenced topics,” “repurpose this video,” “pull people who engaged with and draft first touches,” “post Monday’s scorecard”). The Agent executes, asks for any needed approvals, and logs everything to the timeline.



Future State by Area (Trigger • Action • Context)
A) Content Engine (blogs, newsletters, case studies, long/short video)
Workflow 1 — Topic Radar → Evidenced ideas
Trigger: Weekly timer or “New ideas” click.


Action: Monitor Semrush + competitor pages + Search Console; propose topics with search data, SERP gaps, and examples.


Context: Personas, priority keywords, competitor list, Semrush/Search Console access.


Workflow 2 — Brief Builder → Draft
Trigger: Topic accepted.


Action: Create a brief (angle, outline, sources, internal-link targets), generate a first draft, flag SME input sections, save to Docs, open an approval task.


Context: Brand voice, style guide, internal content map, SME roster.


Workflow 3 — Repurpose Factory
Trigger: Draft (or published asset) marked “Repurpose.”


Action: Produce LinkedIn post, newsletter blurb, IG caption/template, YouTube title + chapters, Shorts script + thumbnail prompts; stage in schedulers.


Context: Channel voice/tone, posting calendar, source asset/URL.


Workflow 4 — Refresh Finder
Trigger: Monthly timer.


Action: Detect decaying posts; propose a refresh plan (new stats/screens, interlinking, updated steps, CTA).


Context: GA trends, Semrush positions, content inventory.



B) SEO & Website Ops
Workflow 5 — Internal-link suggester
Trigger: New article published or weekly sweep.


Action: Suggest 5–10 internal links (source → target) with anchor text; output a ready-to-apply list for Duda/HubSpot CMS.


Context: Site map, content graph, link policies.


Workflow 6 — Technical sweep
Trigger: Weekly.


Action: PageSpeed + broken links + schema checks; open tickets with severity and proposed fixes.


Context: PageSpeed/GA/Search Console access; Duda edit links.



C) Social / Community (LinkedIn, YouTube; Reddit optional)
Workflow 7 — Trigify “engaged-audience” feed
Trigger: Daily scan.


Action: Track chosen influencers on LinkedIn; pull people who engaged with their posts; score by ICP fit; create a review list.


Context: Trigify watchlist, influencer post feed, ICP rules.


Workflow 8 — Outreach to engaged prospects (HeyReach / email / Unify)
Trigger: List from Workflow 7 approved.


Action: Draft personalized first touches referencing the post they engaged with; send via HeyReach (DM) or email/Unify; route all “interested” replies to SDR for booking.


Context: Post permalink, prospect profile, HeyReach/Unify configuration.


(Optional) Reddit program
Trigger: Watchlist of subs; high-intent threads detected.


Action: Draft help-first replies citing non-gated resources; human approval before posting.


Context: Sub rules; resource library; brand guardrails.



D) Outbound / GTM (Clay, Unify, HeyReach, HubSpot)
Workflow 9 — GTM Hypothesis Generator (Agent)
Trigger: On-demand or weekly.


Action: Propose and score 3–5 GTM ideas using recent wins/losses, content performance, site search, and market signals. Each idea includes: ICP definition, pains, value props, suggested channels, sample openers, and a test size; create a draft “campaign” card.


Context: HubSpot notes, GA/SEO highlights, recent posts, service strengths.


Workflow 10 — Segment Builder (Clay)
Trigger: Hypothesis approved.


Action: Build/enrich a list matching the ICP (firmographics, tech stack, funding); sync to a HubSpot list.


Context: Clay queries/filters, enrichment fields.


Workflow 11 — Message variants & sequences (Unify / HeyReach)
Trigger: List synced.


Action: Generate persona-specific variants (A/B angles); launch sequences in Unify/HeyReach; route all “interested” replies to SDR for booking/next steps.


Context: Persona angles, compliance guardrails, Unify/HeyReach setup.


(So: 7–8 = influencer-engaged audience motion. 9–11 = hypothesis-driven GTM not tied to influencer engagements.)

E) Events & Funnels
Workflow 12 — Landing Page Kit
Trigger: New event.


Action: Spin up page (agenda, speakers), create HubSpot form, UTMs, thank-you emails; connect Unify retargeting audiences.


Context: Event details; Duda, HubSpot, Unify access.


Workflow 13 — Funnel Watcher
Trigger: Daily during campaign.


Action: Track visitors → signups → attendance → meetings; surface drop-offs and recommended fixes; log to timeline.


Context: GA + HubSpot + Unify events.



F) Weekly Analytics & Scorecard (Slack every Monday)
Workflow 14 — Scorecard pull & post
Trigger: Mondays 9am.


Action: Pull metrics and post a single Slack card with WoW deltas; store a weekly row for trend lines.


Context & sources:


HubSpot: form submissions; meetings booked via website


Google Analytics: website visitors (incl. YouTube/Reddit referrals)


LinkedIn: impressions


YouTube: new subscribers


Anchor/Spotify for Podcasters: podcast listens


Duda: new/updated blogs; FAQs added


Semrush: SEO visibility/score


(Optional) Google Sheet: UTMs created


Google My Business: new reviews



Data & storage (simple split)
HubSpot: contacts, forms, sequences, campaigns, meetings; campaign notes; links to assets.


Supabase/Warehouse: scorecard table, content metadata, engaged-audience shortlists, outreach status, event log; links to files (Drive/YouTube/Duda).


Console/Agent read this layer; the team doesn’t need to open Supabase directly.


Roles, guardrails, security
Human approvals: publishing, outreach sends, community replies/Reddit posts, and campaign launches.


Audit trail: every workflow posts to a timeline (who/what/when).


Kill-switches: pause any workflow; “handoff to human” in the Agent anytime.


Brand safety: tone/compliance checks before anything goes live.



Optional future experiment
If/when you want to test influencer collaborations (guest posts, co-hosted videos, AMAs), add a separate motion later (small volume, high touch). For now, keep core focus on engaged-audience prospecting (Trigify → HeyReach/Unify) and hypothesis-driven GTM (Clay → Unify/HeyReach).


Marketing AI Console — Change Log
(Based on Nov 18, 2025 Meeting)
New Items • Adjustments • Removals to the Future-State Roadmap

0. Platform / Tools Updates
Removed / Deprioritized
Unify is being retired end-of-year → replace all sequences + outreach launching with Clay → Instantly / HeyReach paths.


Facebook Ads not expected to be used in 2026 → remove FB integrations from scope.


Added
Full Content Database required in Supabase (titles, topics, metadata, links, optionally content bodies).


Automation required to push new content into the database (no scraping).


Console must support content retrieval + similarity search (blog search, link suggestions).



1. Content Engine Changes
1.1 Topic Radar (Workflow 1)
Add:
Must use internal content database + LinkedIn posts as inputs, alongside Semrush & competitors.


Requires import of all website content (titles, topics, tags, dates).


Semrush API capabilities need validation; may require fallback to research agent.


1.2 Brief Builder / Draft Generator (Workflow 2)
Clarification:
After topic acceptance, agent drafts → saves to Google Docs or text file.


No major workflow changes.


1.3 Repurpose Factory (Workflow 3)
Major Change: Split into two modes:
Repurpose from AI-generated long-form content


Repurpose from externally uploaded content (Dan videos, manually written blogs)


Console UI Update:
User selects content type (Blog, LinkedIn post, YouTube video, Case study, etc.) → agent chooses the correct workflow.


Additional Requirement:
Support video input → produce cuts, chapters, Shorts scripts, and thumbnail prompts.


1.4 Refresh Finder (Workflow 4)
Add:
Two refresh triggers:


Analytics decay (low traffic, declining rankings, Semrush + GA trends)


Time-sensitive content (e.g., “2025 Deadlines”) → auto-notify for update


Additional Logic:
Sub-workflow for “outdated but still valuable” content.


Ability to flag content for deletion when irrelevant.



2. SEO & Website Ops Changes
2.1 Internal Link Suggester (Workflow 5)
Must use Supabase content database as source-of-truth.


Trigger when a new blog is added or manually uploaded.


Output: internal link recommendations + anchor suggestions.


2.2 Technical Sweep (Workflow 6)
Major Change:
Do not replicate Semrush logic.


Instead pull Semrush daily site audit directly.


Console should:
Display weekly summary


Allow agent to interpret issues


Auto-create Trello cards for Sophia (one per issue type)


Data Source: Semrush daily audit (exportable format)

3. Social & Community Changes
3.1 Influencer-Engaged Audience Motion (Workflows 7–8)
Workflow 7 Update
Original: Monitor influencers → pull engaged audience
 New direction: Primary automation is finding influencers, not tracking audience.
Agent must:
Identify relevant influencers (web search, LinkedIn, APIs)


Provide reasoning for each recommendation


Maintain non-duplicate influencer list


Workflow 8 Update
Remove: approving engaged-audience lists (Trigify → Clay → Instantly/HeyReach already handles it)
Console’s role:
Approve influencers


Push into Trigify


Let existing stack handle ICP filtering + routing


3.2 Reddit Program (Workflow 7 Optional)
Enhancements:
Subreddit discovery


Must respect anti-spam rules; draft “help-first” responses


Supports:
Detecting high-intent threads


Drafting contextual replies referencing GrowthLab resources


Human approval before posting


AI must learn tone (non-salesy, resource-first)


Note: Investigate Reddit’s rules for DMs or automated posting (likely draft-only).

4. Outbound / GTM (Workflows 9–11)
4.1 GTM Hypothesis Generator (Workflow 9)
Must be grounded in current events + market triggers (interest rates, SBA loans, etc.)
AI should generate:
ICP


Pain points


Value props


Channels


Example messages


Why this campaign matters now


4.2 Segment Builder (Workflow 10)
Clarification:
Clay remains the system of record for list building & enrichment.


Console should:
Guide user through required Clay steps


Provide recommended filters & fields


Optionally set filters / create tables via Clay API (if possible)


4.3 Message Variants & Sequences (Workflow 11)
Change:
Replace Unify with Instantly / HeyReach depending on channel.


Console:
Drafts variants


Prepares campaign components


User handles final routing


AI guides, but does not automate complex Clay tables



5. Events & Funnels Adjustments
5.1 Landing Page Kit (Workflow 12)
Deprioritized:
 Low priority due to limited events.
 Duda pages require heavy manual design.
 Keep as “nice to have.”
5.2 Funnel Watcher → renamed to “Ad + Landing Flow Watcher” (Workflow 13)
Integrates:
Google Ads API (ad → click → landing page)


Google Analytics path flows


Purpose:
Track post-click behavior


Identify drop-offs


Attribute leads to ads



6. Weekly Analytics & Scorecard (Workflow 14)
Metrics changing via Alison’s revamp


Workflow must accept evolving KPIs


Console outputs:


Monday 9am Slack card


Historical trendline row



6.1 Meeting Insights Generator (Workflow 15)
(New Workflow)
Automatically generates content ideas + insights from internal or client meetings.
Inputs:
Tim’s recordings (CX Manager)


Team meeting recordings


Krisp transcripts


Core Functions:
Ingest transcript


Anonymize sensitive details


Extract:


Key insights


Potential LinkedIn angles


Supporting quotes


Action items (optional)


CX / product / GTM patterns


Outputs:
Slack message ~1 min after meeting


Formatted as: insight → quote → suggested angle


Additional Use Cases:
Proposal meetings → scope notes


Financial reviews → key points + client data


Team reviews → summary + scores → HCM


Guardrails:
AI suggests ideas, never writes full posts


Human finalizes content



7. Data & Infrastructure Updates
Additions
Create Supabase content table with:
Titles


Topics


Category


Publish date


URL


Summary


Tags


(Optional) Full text


Automation required for:
Initial import of existing blogs


Ongoing ingestion of new blogs


Removed
No more reliance on on-demand scraping for content ingestion.



8. Roles, Guardrails, Approvals
No changes


Reinforce Reddit caution + influencer approval logic



9. Future Experiments
Influencer collaborations remain Q1 exploratory


No workflows defined yet



10. Next Steps / Sprint Planning Guide
No immediate action required from Alison.
First implementation sprint likely includes:
Build content database + ingestion pipeline


Define initial workflows


Set scope per sprint (avoid mega-project)



1/20 Marketing Console Kickoff Meeting:
main project - content engine is bigger one and can add meeting transcripts as part of this, technically 5 workflows here, giant hub to be able to ask questions against
secondary - finding influencers that can be put into trigify, then from there it is pushing people who engage into clay, and then also using hypothesis generator as other entry point to get leads into clay and reaching out to them
see where we can fit in reddit program as well
starting thursday 830 - 9am stand ups

1/20 Marketing GL – AI Console Kickoff
Date: January 20, 2026
Attendees: Alison Bulmer, Nicolas Sementilli, Katie Young
Purpose: Align on priority workflows to build into the AI Console this quarter and establish execution plan

Objectives of the Meeting
Identify top 3 priority workflows to build into the AI Console this quarter
Align on scope, sequencing, and timelines
Define working cadence and next steps

Key Decisions & Priorities
1. Primary Priority: Content Engine (Top Focus)
Status: Confirmed as #1 priority
Rationale:
Core to Alison’s role and critical for continuity while she’s away
Enables others (e.g., Sophia, Katie, Tim) to step in and operate effectively
Opportunity to consolidate and replace an existing $200/month content platform
Scope includes:
Centralized content hub / knowledge base
Content ideation (new + refresh)
Brief Builder with highly specific requirements:
Internal links
FAQs
Structured outlines
Repurposing engine:
Long-form → short-form
LinkedIn posts, newsletters, etc.
Refresh finder for decaying content
Ability to query content (e.g., “Do we have content on X?”)
NEW ADDITION: Meeting Insights Generator
Pull insights from internal/client meetings
Feed learnings directly into the content engine
Surface FAQs, themes, and content ideas from transcripts
Estimated effort: ~3–4 weeks
Major lift: Aggregating, structuring, and centralizing existing content into a database

2. Secondary Priority: GTM / Lead Generation Workflows
Purpose: Support lead flow and pipeline momentum while Alison is away
Likely components:
Influencer discovery (primary automation focus)
Approving influencers → pushing into TriggerFi
Existing stack (TriggerFi + Clay) continues to handle:
ICP filtering
Enrichment
Routing
Hypothesis-driven GTM ideas:
Generate and score ideas based on wins/losses
Build/enrich lists once ideas are approved
Draft first-touch outreach (manual or automated)
Approach:
Worked on in parallel when blocked on Content Engine
Or tackled immediately after primary workflow stabilizes

3. Stretch / Tertiary Priority: Reddit Program
Status: Desired but not guaranteed this quarter
Notes:
High interest from Alison
Potentially quick win if time allows
Includes:
Subreddit discovery
Drafting compliant, non-spam responses
Approval before posting

Deprioritized / Out of Scope (for now)
Event-based workflows (landing pages, attendee tracking)
Weekly analytics scorecard automation (currently deprioritized)

Execution Plan
Working Model
Start with visual framing of the Content Engine (structure + workflows)
Then build databases and automation
Iterate quickly via frequent feedback loops
Cadence
Daily standups starting Thursday
30 minutes
8:30–9:00 AM PT / 11:30–12:00 PM ET
Adjust as needed

Action Items
Nicolas
Finalize Tim-related work (by end of next day)
Prepare initial visual structure for the Content Engine
Identify required inputs, integrations (e.g., Semrush API), and data structure
Kick off daily standups starting Thursday
Alison
Begin organizing and identifying:
Most valuable existing content to seed the Content Engine
Desired draft specifications (FAQs, links, formatting, etc.)
Think through ideal “future-state” vision for the content hub
Katie
Support prioritization and resourcing
Stay aligned on quarterly goal: 3 priority workflows live in the console

Overall Outcome
Clear agreement to start with the Content Engine, despite its size
Alignment that this foundational work unlocks long-term leverage
Shared excitement and clarity on next steps and collaboration model
Here are concise, structured notes coming out of the meeting, focused on decisions, priorities, and next steps rather than small talk.

1/22 Marketing Console Standup — Meeting Notes
Date: Jan 22, 2026
Attendees: Nicolas Sementilli, Alison Bulmer
Purpose: Initial standup to align on scope, priorities, and structure of the Marketing Console’s Content Engine.

Key Objective
Define the Content Engine as the first major priority of the Marketing Console, including:
What data it should be trained on
How it should function (agent vs workflows)
How it stays up to date over time

Content Engine – Core Priorities
1. Internal Content Database (High Priority)
Goal: Centralize all existing content so the engine can learn brand voice, gaps, and best practices.
Content to ingest:
LinkedIn posts (Dan + company profiles)
Blogs
Case studies
Website pages (services, about, etc. — critical for interlinking)
YouTube videos (via transcripts)
Potentially internal meeting transcripts (sales, reviews, customer calls)
Notes:
Website content will likely be the largest source.
Manual uploads are not ideal long-term.
Automation (web scraping or native integrations) should:
Backfill historical content
Continuously ingest new content going forward

2. What the Console Should Do First
Primary use case once knowledge exists:
Generate new long-form content (blogs, case studies) based on:
Given keywords or ideas
Existing site content (for internal linking)
FAQs
SEO best practices
Secondary use case:
Topic discovery & gap analysis
Identify missing or under-covered topics
Explain why they are valuable
Generate content aligned with brand voice

Agent vs Workflow Discussion
Two potential approaches were discussed:
Option A: Conversational “Main Agent” (Preferred Direction)
One primary chat interface
Delegates tasks to specialized sub-agents:
Topic ideation
Brief creation
Long-form writing
Repurposing (LinkedIn, short-form, etc.)
Refreshing existing content
Pros:
Better user experience
Flexible entry points (start anywhere in the workflow)
Scales well as capabilities grow
Option B: Separate, Structured Workflows
Individual tools (Blog Generator, Repurpose Factory, Refresh Finder, etc.)
Pros:
Easier to fine-tune specific tasks
Cons:
More rigid, potentially worse UX
Next step: Nicolas to test technically which approach performs better.

Repurposing & Refreshing Content
Repurpose Factory
Convert existing content into:
LinkedIn posts
Short-form content
Other formats
Likely based on text or transcripts rather than raw video
Refresh Finder
Identify which content should be updated based on:
Traffic trends
Keyword rankings
Declining performance
Data sources discussed:
Google Analytics (traffic)
SEMrush (rankings)
URLs will be the primary identifier linking content to analytics data.

SEMrush & Analytics Integration
SEMrush API not strictly required initially.
SEO checklists and best practices can be hardcoded into the system.
Future state:
Use rankings + traffic data to prioritize refresh opportunities.
Example: Flag blogs losing rankings or traffic month-over-month.

Use of Meeting Transcripts
Sales calls, review calls, and other internal meetings could:
Surface common questions and objections
Inform content gaps
Enable automated case study creation
Compliance and data permissions will need review.

Decisions & Agreements
Start by focusing on content ingestion and structure, not full analytics integration.
Automations should handle both historical and future content.
Nicolas will own initial structure and UX decisions.
Alison will provide guidance and feedback rather than defining technical architecture.

Next Steps
Nicolas
Build a visual mockup of the Content Engine and Console experience
Explore:
Web scraping / automation options
Agent vs workflow architecture
Present initial concept in the next meeting
Alison
No immediate action required
Available to provide content or clarification as needed


