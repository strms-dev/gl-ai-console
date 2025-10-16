# n8n Node Research: Fireflies Transcript Processing Workflow

**Research Date**: 2025-10-09
**Use Case**: Automated Fireflies transcript processing with AI extraction and Supabase storage
**Workflow Steps**: Trigger → Fireflies API → AI Extraction → Supabase DB → File Storage

---

## Executive Summary

### Available Nodes
✅ **All required functionality is available** through n8n nodes
⚠️ **No dedicated Fireflies node** - will use HTTP Request node with Fireflies API
✅ **Multiple AI options** - OpenAI and Anthropic both supported
✅ **Full Supabase integration** - database operations and storage via HTTP Request

### Authentication Required
- 🔑 **Fireflies.ai**: API Key authentication
- 🔑 **OpenAI or Anthropic**: API Key authentication
- 🔑 **Supabase**: Service Role Key (for database) + Storage API Key

### Recommended Node Stack
1. **Trigger**: Schedule Trigger (polling approach)
2. **Fireflies API**: HTTP Request node
3. **Filtering**: IF node or Switch node
4. **AI Extraction**: OpenAI Chat Completion node (GPT-5-nano model)
5. **Data Transformation**: Code node (JavaScript)
6. **Database Insert**: Supabase node
7. **File Storage**: HTTP Request node (Supabase Storage API)
8. **File Record**: Supabase node

---

## Detailed Node Documentation

---

## 1. WORKFLOW TRIGGER

### Option A: Schedule Trigger (RECOMMENDED)
**Node Type**: `nodes-base.scheduleTrigger`
**Package**: `n8n-nodes-base`
**Category**: Trigger
**Authentication**: None required

#### Description
Triggers the workflow at fixed intervals to poll the Fireflies API for new transcripts. Best for reliable, predictable polling.

#### Configuration
```json
{
  "triggerRules": [
    {
      "interval": "minutes",
      "minutesBetweenTriggers": 15
    }
  ]
}
```

#### Key Properties
- **Trigger Interval**: Choose from Seconds, Minutes, Hours, Days, Weeks, Months, or Custom (Cron)
- **Minutes Between Triggers**: Set polling frequency (recommended: 10-15 minutes)
- **Timezone**: Defaults to workflow timezone setting

#### Example: Poll every 15 minutes
```json
{
  "parameters": {
    "rule": {
      "interval": [
        {
          "triggerAtMinute": 15
        }
      ]
    }
  }
}
```

#### Best Practices
- **Recommended interval**: 10-15 minutes (balances timeliness with API rate limits)
- **Rate limiting**: Be aware of Fireflies API limits
- **Activation required**: Workflow must be active for trigger to work

---

### Option B: Webhook Trigger (Alternative)
**Node Type**: `nodes-base.webhook`
**Package**: `n8n-nodes-base`
**Category**: Trigger
**Authentication**: Optional (Basic Auth, Header Auth, JWT)

#### Description
Receives webhook calls from Fireflies (if Fireflies supports webhooks). Provides real-time processing but requires Fireflies webhook configuration.

#### Configuration
```json
{
  "httpMethod": "POST",
  "path": "fireflies-transcript",
  "responseMode": "onReceived",
  "authentication": "headerAuth"
}
```

#### Key Properties
- **HTTP Method**: POST (most common for webhooks)
- **Path**: Custom webhook URL path (e.g., `fireflies-transcript`)
- **Respond**: Choose "Immediately" for webhook acknowledgment
- **Authentication**: Recommended for security (Header Auth or Basic Auth)

#### Webhook URLs
- **Test URL**: For development testing
- **Production URL**: For live webhook integration

#### Security Options
- **IP Whitelist**: Restrict access to Fireflies IP addresses
- **Authentication**: Header auth, Basic auth, or JWT
- **Raw Body**: Enable to receive exact payload from Fireflies

⚠️ **Note**: Check Fireflies API documentation to confirm webhook support. If not available, use Schedule Trigger.

---

## 2. FIREFLIES API INTEGRATION

### HTTP Request Node
**Node Type**: `nodes-base.httpRequest`
**Package**: `n8n-nodes-base`
**Category**: Output
**Authentication**: Generic Credential Type (Header Auth)

#### Description
Makes HTTP requests to the Fireflies API to retrieve meeting transcripts. No dedicated Fireflies node exists, so this is the standard approach.

#### Required Configuration
```json
{
  "method": "GET",
  "url": "https://api.fireflies.ai/graphql",
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth",
  "sendHeaders": true,
  "sendQuery": false,
  "sendBody": true
}
```

#### Fireflies API Authentication
**Type**: API Key (Header Authentication)

**Header Configuration**:
```json
{
  "name": "Authorization",
  "value": "Bearer {{$credentials.apiKey}}"
}
```

**Credential Setup in n8n**:
1. Create "Header Auth" credential
2. Header Name: `Authorization`
3. Header Value: `Bearer YOUR_FIREFLIES_API_KEY`

#### API Endpoint Details

**GraphQL Endpoint**: `https://api.fireflies.ai/graphql`

**Query to Fetch Recent Transcripts**:
```graphql
query {
  transcripts(limit: 10) {
    id
    title
    date
    transcript_url
    sentences {
      text
      speaker_name
    }
  }
}
```

**Request Body Configuration**:
```json
{
  "contentType": "json",
  "specifyBody": "json",
  "jsonBody": {
    "query": "query { transcripts(limit: 10) { id title date transcript_url sentences { text speaker_name } } }"
  }
}
```

#### Response Data Structure
```json
{
  "data": {
    "transcripts": [
      {
        "id": "transcript_id_123",
        "title": "STRMS Demo - Acme Corp",
        "date": "2025-01-15T14:30:00Z",
        "transcript_url": "https://...",
        "sentences": [
          {
            "text": "Hello, welcome to the demo",
            "speaker_name": "Sales Rep"
          }
        ]
      }
    ]
  }
}
```

#### Key Features
- **Method**: GET or POST (GraphQL typically uses POST)
- **URL**: Fireflies GraphQL API endpoint
- **Authentication**: Header Auth with Bearer token
- **Pagination**: Use GraphQL `limit` and `cursor` parameters
- **Response Format**: JSON (automatically detected)

#### Options to Enable
- **Send Headers**: Yes (for Authorization header)
- **Send Body**: Yes (for GraphQL query)
- **Response > Never Error**: Optional (helpful for handling API errors gracefully)

#### Error Handling
- **401 Unauthorized**: Check API key validity
- **429 Rate Limit**: Implement exponential backoff
- **Network timeout**: Set timeout option (recommended: 30000ms)

---

## 3. FILTERING TRANSCRIPTS

### IF Node (RECOMMENDED for simple filtering)
**Node Type**: `nodes-base.if`
**Package**: `n8n-nodes-base`
**Category**: Transform
**Authentication**: None required

#### Description
Routes workflow based on whether meeting title contains "STRMS Demo". Simple boolean logic with two outputs: True and False branches.

#### Configuration
```json
{
  "conditions": {
    "string": [
      {
        "value1": "={{ $json.title }}",
        "operation": "contains",
        "value2": "STRMS Demo"
      }
    ]
  },
  "combineOperation": "all"
}
```

#### Key Properties
- **Data Type**: String (for title matching)
- **Operation**: "contains" (case-insensitive matching)
- **Value 1**: `{{ $json.title }}` (expression to get meeting title)
- **Value 2**: `"STRMS Demo"` (filter string)

#### Filter Logic
- **True branch**: Meeting title contains "STRMS Demo" → Continue processing
- **False branch**: Meeting title doesn't match → Stop workflow or log

#### Advanced Pattern Matching
For case-insensitive or regex matching, use expression:
```javascript
={{ $json.title.toLowerCase().includes('strms demo') }}
```

---

### Switch Node (Alternative for multiple filters)
**Node Type**: `nodes-base.switch`
**Package**: `n8n-nodes-base`
**Category**: Transform
**Authentication**: None required

#### Description
Routes items to different branches based on multiple conditions. Use when you need to handle different meeting types differently.

#### Configuration
```json
{
  "mode": "rules",
  "rules": {
    "values": [
      {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.title }}",
              "operation": "contains",
              "value2": "STRMS Demo"
            }
          ]
        },
        "renameOutput": true,
        "outputKey": "strms_demo"
      },
      {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.title }}",
              "operation": "contains",
              "value2": "Product Demo"
            }
          ]
        },
        "renameOutput": true,
        "outputKey": "product_demo"
      }
    ]
  },
  "fallbackOutput": "extra"
}
```

#### Key Properties
- **Mode**: "Rules" (condition-based) or "Expression" (programmatic)
- **Routing Rules**: Define multiple conditions with named outputs
- **Fallback Output**: Handle items that don't match any rule

#### Options
- **Ignore Case**: Turn on for case-insensitive matching
- **Send data to all matching outputs**: Turn on if item can match multiple rules

#### Use Cases
- Multiple meeting types (STRMS, Product, Support)
- Different processing paths based on metadata
- Error routing based on data quality

---

## 4. AI DATA EXTRACTION

### OpenAI Chat Completion Node (REQUIRED)
**Node Type**: `nodes-base.openAi`
**Package**: `n8n-nodes-base`
**Category**: Transform
**Authentication**: OpenAI API credentials required

#### Description
Uses OpenAI Chat Completion API with GPT-5-nano model to extract structured data from unstructured transcript text. Excellent for parsing company names, contact info, and project details.

#### Authentication
**Type**: API Key
**Setup**:
1. Create OpenAI API credential in n8n
2. Add your OpenAI API key
3. Select credential in node

#### Configuration
```json
{
  "resource": "chat",
  "operation": "message",
  "model": "gpt-5-nano",
  "messages": [
    {
      "role": "system",
      "content": "You are a data extraction assistant."
    },
    {
      "role": "user",
      "content": "Extract the following from this sales demo transcript..."
    }
  ],
  "maxTokens": 500,
  "temperature": 0.3
}
```

#### Required Model
- **GPT-5-nano**: Specified model for this workflow

#### Chat Completion Messages Template
**System Message**:
```
You are a data extraction assistant specializing in sales call analysis.
```

**User Message**:
```javascript
Extract the following information from this STRMS demo transcript and return ONLY valid JSON:

{
  "project_name": "extracted project name or generate one",
  "company": "company name or 'Unknown Company'",
  "contact_name": "primary contact name or 'Unknown Contact'",
  "email": "email address or 'no-email@pending.com'"
}

Rules:
1. If project name not mentioned, generate one like "{Company} STRMS Implementation"
2. If any field cannot be found, use the default placeholder shown above
3. Return ONLY the JSON object, no explanation

Transcript:
{{ $json.transcript_text }}
```

#### Key Parameters
- **maxTokens**: 500-1000 (sufficient for extraction response)
- **temperature**: 0.2-0.3 (lower = more deterministic, better for extraction)
- **topP**: 1 (default, keep for structured extraction)

#### Response Processing
OpenAI Chat Completion returns JSON string in `choices[0].message.content`. Parse with Code node:
```javascript
const aiResponse = JSON.parse($input.first().json.choices[0].message.content);
return {
  project_name: aiResponse.project_name,
  company: aiResponse.company,
  contact_name: aiResponse.contact_name,
  email: aiResponse.email
};
```

#### Cost Considerations
- **GPT-5-nano**: Pricing TBD (check OpenAI pricing page for latest rates)
- Expected to be cost-effective for high-volume extraction tasks
- Average transcript (~5K tokens) + response (200 tokens) processing cost: TBD

#### Error Handling
- **Invalid JSON response**: Validate and retry with adjusted prompt
- **Token limit exceeded**: Truncate transcript or use GPT-4 Turbo (32K context)
- **API timeout**: Increase node timeout setting

---

## 5. DATA TRANSFORMATION

### Code Node (JavaScript)
**Node Type**: `nodes-base.code`
**Package**: `n8n-nodes-base`
**Category**: Transform
**Authentication**: None required

#### Description
Executes custom JavaScript to transform, validate, and prepare data for database insertion and file operations.

#### Configuration
```json
{
  "language": "javaScript",
  "mode": "runOnceForAllItems",
  "jsCode": "// JavaScript code here"
}
```

#### Key Properties
- **Language**: JavaScript or Python (Beta)
- **Mode**:
  - "Run Once for All Items" (processes all items together)
  - "Run Once for Each Item" (processes items individually)

#### Use Cases in This Workflow

##### 1. Parse AI Response
```javascript
// Parse AI extraction results
const aiResponse = $input.first().json;
const extractedData = JSON.parse(aiResponse.choices[0].message.content);

return [{
  json: {
    project_name: extractedData.project_name,
    company: extractedData.company,
    contact_name: extractedData.contact_name,
    email: extractedData.email,
    current_stage: 'demo',
    project_status: 'active'
  }
}];
```

##### 2. Sanitize Filename
```javascript
// Create filesystem-safe filename
const projectName = $input.first().json.project_name;
const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];

const sanitizedFilename = projectName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

const filename = `${sanitizedFilename}_demo_transcript_${timestamp}.txt`;

return [{
  json: {
    ...($input.first().json),
    filename: filename,
    timestamp: timestamp
  }
}];
```

##### 3. Generate File Path
```javascript
// Generate Supabase storage path
const projectId = $input.first().json.project_id;
const filename = $input.first().json.filename;

const storagePath = `${projectId}/transcripts/${filename}`;

return [{
  json: {
    ...($input.first().json),
    storage_path: storagePath
  }
}];
```

##### 4. Convert Transcript to Text File
```javascript
// Convert transcript text to binary data for file upload
const transcriptText = $input.first().json.transcript_text;
const filename = $input.first().json.filename;

// Create binary buffer
const buffer = Buffer.from(transcriptText, 'utf-8');

return [{
  json: {
    ...($input.first().json),
  },
  binary: {
    data: {
      data: buffer.toString('base64'),
      mimeType: 'text/plain',
      fileName: filename
    }
  }
}];
```

##### 5. Validate Extracted Data
```javascript
// Validate AI extraction results before database insert
const data = $input.first().json;

// Ensure required fields exist
if (!data.project_name || data.project_name === '') {
  // Generate fallback project name
  data.project_name = `STRMS Demo - ${new Date().toISOString().split('T')[0]}`;
}

// Ensure placeholders for optional fields
data.company = data.company || 'Unknown Company';
data.contact_name = data.contact_name || 'Unknown Contact';
data.email = data.email || 'no-email@pending.com';

// Validate email format (basic)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(data.email)) {
  data.email = 'no-email@pending.com';
}

return [{ json: data }];
```

##### 6. Calculate File Size
```javascript
// Calculate file size in bytes for storage metadata
const transcriptText = $input.first().json.transcript_text;
const fileSizeBytes = Buffer.byteLength(transcriptText, 'utf-8');

return [{
  json: {
    ...($input.first().json),
    file_size: fileSizeBytes
  }
}];
```

##### 7. Generate Human-Readable File Name
```javascript
// Create user-friendly file name for database record
const company = $input.first().json.company;
const date = new Date($input.first().json.meeting_date);
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const humanReadableName = `${company} STRMS Demo Call - ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

return [{
  json: {
    ...($input.first().json),
    human_readable_file_name: humanReadableName
  }
}];
```

#### Built-in Variables Available
- `$input`: Access to input data
- `$json`: Current item JSON data
- `$binary`: Current item binary data
- `$node`: Node information
- `$workflow`: Workflow information
- `$now`: Current timestamp
- `$today`: Today's date (Luxon DateTime)

#### Error Handling Pattern
```javascript
try {
  // Your code here
  const result = processData($input.first().json);
  return [{ json: result }];
} catch (error) {
  // Log error and return error state
  console.error('Processing error:', error.message);
  return [{
    json: {
      error: true,
      errorMessage: error.message,
      originalData: $input.first().json
    }
  }];
}
```

#### Best Practices
- **Always validate input data** before processing
- **Use try-catch blocks** for error handling
- **Return consistent data structure** for downstream nodes
- **Log important steps** for debugging
- **Test with sample data** before production

---

## 6. SUPABASE DATABASE OPERATIONS

### Supabase Node
**Node Type**: `nodes-base.supabase`
**Package**: `n8n-nodes-base`
**Category**: Input
**Authentication**: Supabase API credentials required

#### Description
Performs CRUD operations on Supabase PostgreSQL tables. Handles project creation and file record insertion.

#### Authentication
**Type**: Supabase API credentials
**Required Fields**:
- **Host**: Your Supabase project URL (e.g., `https://abcdefgh.supabase.co`)
- **Service Role Secret**: Supabase service role key (for bypassing RLS)

**Where to find credentials**:
1. Go to Supabase Dashboard
2. Navigate to Project Settings > API
3. Copy "Project URL" and "service_role" key

#### Configuration for Creating Project Record

**Operation**: Create Row
**Resource**: Row

```json
{
  "resource": "row",
  "operation": "create",
  "tableId": "strms_projects",
  "dataMode": "defineBelow",
  "fieldsUi": {
    "fieldValues": [
      {
        "fieldId": "project_name",
        "fieldValue": "={{ $json.project_name }}"
      },
      {
        "fieldId": "company",
        "fieldValue": "={{ $json.company }}"
      },
      {
        "fieldId": "contact_name",
        "fieldValue": "={{ $json.contact_name }}"
      },
      {
        "fieldId": "email",
        "fieldValue": "={{ $json.email }}"
      },
      {
        "fieldId": "current_stage",
        "fieldValue": "demo"
      },
      {
        "fieldId": "project_status",
        "fieldValue": "active"
      }
    ]
  },
  "options": {
    "returnFields": "id"
  }
}
```

#### Key Properties
- **Table Name**: Select from dropdown or use expression
- **Data Mode**: "Define Below" (field-by-field) or "Auto-map" (map JSON)
- **Fields**: Map each database column to input data

#### Options
- **Return Fields**: Specify which fields to return (e.g., `id` to get the new project UUID)
- **Use Custom Schema**: Enable if using schema other than `public`

#### Response Data
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "project_name": "Acme Corp STRMS Implementation",
  "company": "Acme Corp",
  "contact_name": "John Smith",
  "email": "john.smith@acmecorp.com",
  "current_stage": "demo",
  "project_status": "active",
  "created_at": "2025-01-15T14:30:00Z"
}
```

**Important**: Store the returned `id` for use in subsequent steps (file storage and file record creation).

---

#### Configuration for Creating File Record

**Operation**: Create Row
**Table**: `strms_project_files`

```json
{
  "resource": "row",
  "operation": "create",
  "tableId": "strms_project_files",
  "dataMode": "defineBelow",
  "fieldsUi": {
    "fieldValues": [
      {
        "fieldId": "project_id",
        "fieldValue": "={{ $('Create Project').item.json.id }}"
      },
      {
        "fieldId": "file_type_id",
        "fieldValue": "demo-call-transcript"
      },
      {
        "fieldId": "file_name",
        "fieldValue": "={{ $json.human_readable_file_name }}"
      },
      {
        "fieldId": "file_path",
        "fieldValue": "={{ $json.storage_path }}"
      },
      {
        "fieldId": "file_size",
        "fieldValue": "={{ $json.file_size }}"
      },
      {
        "fieldId": "uploaded_by",
        "fieldValue": "fireflies-integration"
      },
      {
        "fieldId": "storage_bucket",
        "fieldValue": "strms-project-files"
      },
      {
        "fieldId": "storage_path",
        "fieldValue": "={{ $json.storage_path }}"
      }
    ]
  }
}
```

#### Referencing Data from Previous Nodes
Use expressions to reference data from earlier nodes:
- `{{ $('NodeName').item.json.fieldName }}` - Get field from specific node
- `{{ $json.fieldName }}` - Get field from current item

Example: Get project ID from "Create Project" node:
```javascript
={{ $('Create Project').item.json.id }}
```

#### Available Operations
- **Create**: Insert new rows
- **Get**: Retrieve single row by ID
- **Get Many**: Query multiple rows with filters
- **Update**: Modify existing rows
- **Delete**: Remove rows

#### Error Handling
- **Duplicate key errors**: Use try-catch in Code node before insert
- **Foreign key violations**: Ensure project_id exists before creating file record
- **NOT NULL constraints**: Validate all required fields are populated

---

## 7. SUPABASE STORAGE (File Upload)

### HTTP Request Node (Supabase Storage API)
**Node Type**: `nodes-base.httpRequest`
**Package**: `n8n-nodes-base`
**Category**: Output
**Authentication**: Generic Credential Type (Header Auth)

#### Description
Uploads transcript files to Supabase Storage bucket using the Storage REST API. No dedicated Supabase Storage node exists.

#### Authentication
**Type**: Header Authentication
**Setup**:
1. Create "Header Auth" credential
2. Header Name: `Authorization`
3. Header Value: `Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY`

Additionally add these headers:
- **apikey**: `YOUR_SUPABASE_SERVICE_ROLE_KEY` (same key, without "Bearer")
- **Content-Type**: `text/plain`

#### Configuration
```json
{
  "method": "POST",
  "url": "https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/strms-project-files/{{ $json.storage_path }}",
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "apikey",
        "value": "={{ $credentials.apiKey }}"
      },
      {
        "name": "Content-Type",
        "value": "text/plain"
      }
    ]
  },
  "sendBody": true,
  "contentType": "binaryData",
  "binaryPropertyName": "data"
}
```

#### API Endpoint Structure
```
POST https://{PROJECT_REF}.supabase.co/storage/v1/object/{BUCKET_NAME}/{FILE_PATH}
```

Example:
```
POST https://abcdefgh.supabase.co/storage/v1/object/strms-project-files/a1b2c3d4-e5f6-7890-abcd-ef1234567890/transcripts/acme_corp_demo_transcript_2025-01-15T14-30-00.txt
```

#### Required Headers
```json
{
  "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY",
  "apikey": "YOUR_SERVICE_ROLE_KEY",
  "Content-Type": "text/plain"
}
```

#### Request Body
Send the file as **binary data** from the Code node that converted transcript text to binary.

**Binary Property Name**: `data` (matches the binary property created in Code node)

#### Response Data
```json
{
  "Key": "a1b2c3d4-e5f6-7890-abcd-ef1234567890/transcripts/acme_corp_demo_transcript_2025-01-15T14-30-00.txt",
  "Id": "unique-file-id",
  "ETag": "\"etag-value\""
}
```

**Important**: The `Key` field contains the exact storage path. Use this value for the `file_path` and `storage_path` fields in the file record.

#### Path Structure
```
{project_id}/transcripts/{sanitized_filename}_{timestamp}.txt
```

Example:
```
a1b2c3d4-e5f6-7890-abcd-ef1234567890/transcripts/acme_corp_strms_demo_transcript_2025-01-15T14-30-00.txt
```

#### Options to Configure
- **Response > Include Response Headers and Status**: Enable to check upload success (200 status)
- **Timeout**: Set to 30000ms (30 seconds) for large files
- **Retry on Fail**: Enable with exponential backoff

#### Error Handling
- **404 Bucket not found**: Verify bucket name and existence
- **403 Forbidden**: Check service role key permissions
- **413 Payload Too Large**: File exceeds size limit (check bucket settings)
- **Network timeout**: Increase timeout setting

#### Bucket Configuration
Before using, ensure bucket exists:
1. Go to Supabase Dashboard > Storage
2. Create bucket: `strms-project-files`
3. Set to **Private** (requires authentication)
4. Configure file size limits if needed

#### File Size Considerations
- **Max file size**: Configurable per bucket (default often 50MB)
- **Typical transcript**: 50-500 KB
- **Network timeout**: Set timeout proportional to expected file size

---

## 8. UTILITY NODES

### Additional Useful Nodes

#### Set Node
**Node Type**: `nodes-base.set`
**Category**: Transform
**Use Case**: Manually set or rename fields

Not strictly required for this workflow, but useful for:
- Renaming fields for clarity
- Setting constant values
- Reorganizing data structure

---

#### Merge Node
**Node Type**: `nodes-base.merge`
**Category**: Transform
**Use Case**: Combine data from multiple branches

Useful if you split the workflow and need to recombine data later (e.g., parallel AI extraction and file processing).

---

#### Error Trigger Node
**Node Type**: `nodes-base.errorTrigger`
**Category**: Trigger
**Use Case**: Handle workflow errors

Recommended for production:
- Create a separate "error handling" workflow
- Send notifications on failure
- Log errors to monitoring service

---

## CREDENTIAL REQUIREMENTS SUMMARY

### 1. Fireflies API
**Type**: API Key
**Authentication Method**: Bearer Token (Header Auth)
**Where to get**:
- Log into Fireflies.ai
- Go to Settings/API section
- Generate API key

**n8n Setup**:
- Create "Header Auth" credential
- Name: `Authorization`
- Value: `Bearer YOUR_API_KEY`

---

### 2. OpenAI API (REQUIRED)
**Type**: API Key
**Authentication Method**: API Key
**Model**: GPT-5-nano (via Chat Completion)
**Where to get**:
- Create account at platform.openai.com
- Navigate to API Keys section
- Create new secret key

**n8n Setup**:
- Create "OpenAI API" credential
- Paste API key
- Select model: `gpt-5-nano`

**Cost**: Pay-per-use (check OpenAI pricing for GPT-5-nano rates)

---

### 3. Supabase (Database + Storage)
**Type**: Service Role Key
**Authentication Method**: Bearer Token + API Key
**Where to get**:
- Supabase Dashboard > Project Settings > API
- Copy "Project URL"
- Copy "service_role" secret key (NOT anon key)

**n8n Setup for Database**:
- Create "Supabase" credential
- Host: `https://YOUR_PROJECT_REF.supabase.co`
- Service Role Secret: `YOUR_SERVICE_ROLE_KEY`

**n8n Setup for Storage**:
- Create "Header Auth" credential
- Name: `Authorization`
- Value: `Bearer YOUR_SERVICE_ROLE_KEY`
- Create second header parameter:
  - Name: `apikey`
  - Value: `YOUR_SERVICE_ROLE_KEY`

⚠️ **Security Warning**: The service role key bypasses Row Level Security (RLS). Keep it secure and only use in trusted workflows.

---

## RECOMMENDED WORKFLOW STRUCTURE

```
1. [Schedule Trigger] → Runs every 15 minutes
   ↓
2. [HTTP Request] → Fetch transcripts from Fireflies API
   ↓
3. [IF Node] → Filter for "STRMS Demo" in title
   ↓ (True branch)
4. [Code Node] → Extract full transcript text from response
   ↓
5. [OpenAI Chat Completion Node - GPT-5-nano] → AI extraction of structured data
   ↓
6. [Code Node] → Validate and sanitize extracted data
   ↓
7. [Supabase Node] → Create project record (returns project_id)
   ↓
8. [Code Node] → Generate filename and convert to binary
   ↓
9. [HTTP Request] → Upload file to Supabase Storage (returns path)
   ↓
10. [Code Node] → Generate human-readable file name
   ↓
11. [Supabase Node] → Create file record in strms_project_files
   ↓
12. [Complete] ✓
```

---

## NEXT STEPS

1. ✅ **Node research complete** - All required nodes documented
2. 📝 **Create workflow structure** - Build n8n workflow with researched nodes
3. 🔑 **Set up credentials** - Configure all authentication
4. 🧪 **Test with sample data** - Validate each step
5. 🚀 **Deploy to production** - Activate workflow

---

## ADDITIONAL RESOURCES

### n8n Documentation
- [HTTP Request Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [OpenAI Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.openai/)
- [Supabase Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.supabase/)
- [Code Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/)

### API Documentation
- [Fireflies API Docs](https://docs.fireflies.ai/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Anthropic API Reference](https://docs.anthropic.com/api)
- [Supabase Storage API](https://supabase.com/docs/reference/javascript/storage)

### Community Resources
- [n8n Community Forum](https://community.n8n.io/)
- [n8n Workflow Templates](https://n8n.io/workflows/)

---

**Research completed**: 2025-10-09
**Researched by**: Claude Code
**Status**: ✅ Ready for implementation
