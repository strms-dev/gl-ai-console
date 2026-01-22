# Content Engine - Future Implementation Plan

This document captures the Supabase schema and n8n workflow designs for when we're ready to move beyond the hardcoded test data.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CONSOLE UI                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │Topic Radar  │ │Brief Builder│ │Repurpose    │ │Refresh      │   │
│  │   [Run]     │ │  [Create]   │ │  [Transform]│ │  [Analyze]  │   │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘   │
│         │               │               │               │           │
│  ┌──────┴───────────────┴───────────────┴───────────────┴──────┐   │
│  │                    CONTEXTUAL CHAT                           │   │
│  │  (receives pre-loaded context, single LLM call per message)  │   │
│  └──────────────────────────────┬──────────────────────────────┘   │
└─────────────────────────────────┼───────────────────────────────────┘
                                  │ Webhooks
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           n8n WORKFLOWS                              │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │Topic Radar  │  │Brief Builder│  │Repurpose    │  │Refresh     │ │
│  │Workflow     │  │Workflow     │  │Workflow     │  │Workflow    │ │
│  │(1-2 LLM)    │  │(1 LLM)      │  │(1 LLM)      │  │(1 LLM)     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘ │
│         │                │                │                │        │
│  ┌──────┴────────────────┴────────────────┴────────────────┴─────┐ │
│  │                      Chat Workflow (1 LLM per message)        │ │
│  └───────────────────────────────┬───────────────────────────────┘ │
└──────────────────────────────────┼──────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           SUPABASE                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │marketing_content│  │marketing_briefs │  │marketing_chat_  │     │
│  │(content library)│  │                 │  │messages         │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│  ┌─────────────────┐  ┌─────────────────┐                          │
│  │marketing_topic_ │  │marketing_refresh│                          │
│  │ideas            │  │_recommendations │                          │
│  └─────────────────┘  └─────────────────┘                          │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTOMATED SCRAPERS (n8n)                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │
│  │LinkedIn   │  │YouTube    │  │Website    │  │Fireflies  │        │
│  │Scraper    │  │Scraper    │  │Crawler    │  │Webhook    │        │
│  │(daily)    │  │(daily)    │  │(weekly)   │  │(on-demand)│        │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Supabase Schema

### Table: `marketing_content`
Stores all content items in the knowledge base.

```sql
CREATE TABLE marketing_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'blog', 'linkedin', 'youtube', 'case_study', 'website_page', 'meeting_transcript'
  url TEXT,
  content_text TEXT, -- Full text/transcript for AI training
  author TEXT,
  date_created TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'published', -- 'published', 'draft', 'archived'
  keywords TEXT[], -- Array of keywords
  word_count INTEGER,
  description TEXT,
  metadata JSONB, -- Flexible field for type-specific data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_marketing_content_type ON marketing_content(content_type);
CREATE INDEX idx_marketing_content_status ON marketing_content(status);
CREATE INDEX idx_marketing_content_keywords ON marketing_content USING GIN(keywords);
```

### Table: `marketing_topic_ideas`
Stores AI-generated content gap ideas.

```sql
CREATE TABLE marketing_topic_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  gap_score INTEGER, -- 0-100
  rationale TEXT,
  suggested_format TEXT,
  related_content_ids UUID[],
  status TEXT DEFAULT 'new', -- 'new', 'approved', 'in_progress', 'completed', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT -- 'ai' or user name
);

CREATE INDEX idx_marketing_topic_ideas_status ON marketing_topic_ideas(status);
```

### Table: `marketing_briefs`
Stores content briefs.

```sql
CREATE TABLE marketing_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'approved', 'in_progress', 'completed'
  target_format TEXT,
  target_keywords TEXT[],
  outline JSONB, -- Array of section objects
  notes TEXT,
  source_topic_id UUID REFERENCES marketing_topic_ideas(id),
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketing_briefs_status ON marketing_briefs(status);
```

### Table: `marketing_refresh_recommendations`
Stores content refresh suggestions.

```sql
CREATE TABLE marketing_refresh_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES marketing_content(id),
  current_ranking INTEGER,
  previous_ranking INTEGER,
  traffic_change DECIMAL,
  recommended_actions TEXT[],
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'dismissed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketing_refresh_priority ON marketing_refresh_recommendations(priority);
CREATE INDEX idx_marketing_refresh_status ON marketing_refresh_recommendations(status);
```

### Table: `marketing_chat_sessions` & `marketing_chat_messages`
Stores chat history for context.

```sql
CREATE TABLE marketing_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_context TEXT, -- 'topic_radar', 'brief_builder', etc.
  context_data JSONB, -- The data that was loaded when chat started
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE marketing_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES marketing_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketing_chat_messages_session ON marketing_chat_messages(session_id);
```

---

## n8n Workflows

### 1. Content Scraper Workflows (Automated Ingestion)

#### LinkedIn Posts Scraper
- **Trigger**: Schedule (daily)
- **Steps**:
  1. Call LinkedIn API or scraping service for Dan's posts + GrowthLab page
  2. Transform data to match `marketing_content` schema
  3. Upsert to Supabase (check for existing by URL)

#### YouTube Transcripts Scraper
- **Trigger**: Schedule (daily)
- **Steps**:
  1. Fetch YouTube channel videos via API
  2. Get transcripts via YouTube transcript API
  3. Upsert to Supabase

#### Website Content Scraper
- **Trigger**: Schedule (weekly)
- **Steps**:
  1. Crawl GrowthLab website (blogs, case studies, service pages)
  2. Extract text content, metadata
  3. Upsert to Supabase

#### Meeting Transcripts Ingestion
- **Trigger**: Webhook from Fireflies or manual
- **Steps**:
  1. Receive transcript
  2. Classify meeting type
  3. Store in Supabase with appropriate tags

---

### 2. Topic Radar Workflow

**Trigger**: Webhook from Console UI (user clicks "Run Analysis")

**Steps**:
1. **Fetch Content Library**: Query Supabase for all `marketing_content`
2. **Fetch Analytics** (future): Query Google Analytics / Semrush APIs
3. **Single LLM Call**:
   - System prompt: "You are a content strategist for GrowthLab, an outsourced accounting and FP&A firm..."
   - User prompt: "Here is our content library: [summary]. Identify 5 content gaps with gap scores, rationale, and suggested formats..."
4. **Parse Response**: Extract structured topic ideas (JSON)
5. **Save to Supabase**: Insert into `marketing_topic_ideas`
6. **Return to Console**: Webhook response with ideas

**Cost Control**: Single LLM call with summarized context, not raw content.

---

### 3. Brief Builder Workflow

**Trigger**: Webhook from Console UI (user clicks "Create Brief" with topic)

**Input**:
```json
{
  "topic_id": "uuid-or-null",
  "custom_topic": "string-if-no-topic-id",
  "target_format": "blog|linkedin|youtube",
  "target_keywords": ["keyword1", "keyword2"]
}
```

**Steps**:
1. **Receive Input**: Topic idea ID or custom topic
2. **Fetch Related Content**: Query Supabase for related content by keywords
3. **Single LLM Call**:
   - System prompt: "You are a content brief writer for GrowthLab..."
   - User prompt: "Create a detailed brief for: [topic]. Related existing content: [summaries]. Include: title, outline (5-7 sections), target keywords, internal linking opportunities..."
4. **Parse Response**: Extract structured brief (JSON)
5. **Save to Supabase**: Insert into `marketing_briefs`
6. **Return to Console**: Brief data

---

### 4. Repurpose Factory Workflow

**Trigger**: Webhook from Console UI (user selects content + target format)

**Input**:
```json
{
  "content_id": "uuid",
  "target_format": "linkedin|youtube|blog"
}
```

**Steps**:
1. **Receive Input**: Content ID + target format
2. **Fetch Source Content**: Query Supabase for full content text
3. **Single LLM Call**:
   - System prompt: "You are a content repurposing specialist for GrowthLab. Maintain brand voice, key messages, and include appropriate CTAs..."
   - User prompt: "Transform this [blog] into a [LinkedIn post]: [content]..."
4. **Return Draft**: Send back to Console for user review
5. **Optional Save**: User can save final version to `marketing_content`

---

### 5. Refresh Finder Workflow

**Trigger**: Schedule (weekly) or manual webhook

**Steps**:
1. **Fetch All Published Content**: Query Supabase
2. **Fetch Analytics**: Google Analytics traffic data, Semrush rankings (when integrated)
3. **Single LLM Call**:
   - System prompt: "You are an SEO specialist analyzing content performance..."
   - User prompt: "Analyze this content with performance data and recommend which pieces need refresh, with priority levels and specific actions..."
4. **Save Recommendations**: Insert into `marketing_refresh_recommendations`
5. **Return/Notify**: Webhook response or Slack notification

---

### 6. Contextual Chat Workflow

**Trigger**: Webhook from Console UI (user sends chat message)

**Input**:
```json
{
  "message": "Tell me more about idea #3",
  "workflow_context": "topic_radar",
  "context_data": { ... },
  "session_id": "uuid"
}
```

**Steps**:
1. **Receive Message + Context**: No database queries needed - context provided by UI
2. **Single LLM Call**:
   - System prompt: "You are a helpful content assistant for GrowthLab. You are currently helping with [workflow]. Here is the current context: [data]. Answer questions, provide suggestions, and help refine ideas. Do NOT make up information - only reference what's in the context."
   - User prompt: "[user message]"
3. **Save to Chat History**: Insert message + response to `marketing_chat_messages`
4. **Return Response**: Send back to Console

**Cost Control**: Context is pre-loaded by UI, no tool calls, single LLM response per message.

---

## Migration Steps

When ready to move from test data to Supabase:

1. **Create Supabase tables** using the SQL above
2. **Create store file**: `src/lib/marketing-content-store.ts` with CRUD functions
3. **Update types file**: Add Row types for snake_case database fields
4. **Update page**: Replace test data imports with async data fetching
5. **Add loading states**: Handle async data loading in UI
6. **Build n8n workflows**: Start with scrapers, then add workflow triggers
7. **Connect webhooks**: Wire up UI buttons to n8n webhook endpoints

---

## Key Design Decisions

### Why Structured Workflows + Contextual Chat (not Autonomous Agent)

1. **Cost Predictability**: Each workflow is 1-2 LLM calls, not unbounded agent loops
2. **Reliability**: Structured workflows produce consistent results
3. **User Control**: Users click buttons to trigger actions, not waiting for agent to decide
4. **Context Efficiency**: Chat receives pre-loaded context, doesn't query databases
5. **Debuggability**: Easy to trace issues in structured workflow vs agent decision tree

### Chat is Read-Only

The chat assistant can:
- Explain results
- Suggest refinements
- Answer questions about the data

The chat assistant CANNOT:
- Query databases
- Trigger workflows
- Make changes to data

For actions, users click explicit buttons which trigger structured n8n workflows.
