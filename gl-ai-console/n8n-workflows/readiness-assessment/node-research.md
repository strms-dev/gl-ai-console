# n8n Node Research: Readiness Assessment Automation

## Overview
This document contains detailed research on all n8n nodes required to build the automated readiness assessment document generation workflow. Each node is documented with its purpose, configuration requirements, authentication needs, and example usage.

---

## 1. Webhook Node (Trigger)
**Node Type:** `nodes-base.webhook`
**Category:** Trigger
**Purpose:** Start the workflow when a POST request is received with project_id

### Key Configuration
- **HTTP Method:** POST
- **Path:** Custom path (e.g., `/readiness-assessment` or auto-generated)
- **Authentication:**
  - Options: None, Basic Auth, Header Auth, JWT Auth
  - Recommended: Header Auth for API key validation
- **Respond:** "Using 'Respond to Webhook' Node" (for custom responses)
- **Response Mode:** Wait for workflow completion

### Required Parameters
```json
{
  "method": "POST",
  "path": "/readiness-assessment",
  "authentication": "headerAuth",
  "responseMode": "lastNode"
}
```

### OAuth Required?
No - Uses built-in authentication methods (Basic, Header, JWT)

### Example Usage
The webhook will receive:
```json
{
  "project_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Key Features
- Supports request validation
- Can extract body, query parameters, and headers
- Provides both test and production URLs
- Maximum payload size: 16MB (configurable in self-hosted)

---

## 2. Supabase Node (Database Operations)
**Node Type:** `nodes-base.supabase`
**Category:** Input
**Purpose:** Query database for transcript metadata and insert assessment file records

### Key Configuration
- **Resource:** Row
- **Operations Used:**
  - **Get Many** - Query `strms_project_files` for demo transcript
  - **Create** - Insert new assessment file metadata record

### Required Credentials
- **Credential Type:** Supabase API
- **Required Fields:**
  - Host (Supabase project URL)
  - Service Role Secret (API key)

### OAuth Required?
No - Uses API key authentication

### Query for Transcript (Step 2)
```javascript
// Operation: Get Many
{
  "resource": "row",
  "operation": "getAll",
  "tableId": "strms_project_files",
  "returnAll": false,
  "limit": 1,
  "filters": {
    "conditions": [
      {
        "keyName": "project_id",
        "condition": "equals",
        "keyValue": "={{ $json.project_id }}"
      },
      {
        "keyName": "file_type_id",
        "condition": "equals",
        "keyValue": "demo-transcript"
      }
    ]
  },
  "options": {
    "fields": "id,file_name,storage_path,storage_bucket"
  }
}
```

### Insert Assessment Metadata (Step 8)
```javascript
// Operation: Create
{
  "resource": "row",
  "operation": "create",
  "tableId": "strms_project_files",
  "dataToSend": "defineBelow",
  "fieldsUi": {
    "values": [
      { "key": "project_id", "value": "={{ $json.project_id }}" },
      { "key": "file_type_id", "value": "readiness-assessment" },
      { "key": "file_name", "value": "={{ $json.generated_filename }}" },
      { "key": "file_path", "value": "={{ $json.storage_path }}" },
      { "key": "file_size", "value": "={{ $json.file_size }}" },
      { "key": "uploaded_by", "value": "n8n-workflow" },
      { "key": "storage_bucket", "value": "strms-project-files" },
      { "key": "storage_path", "value": "={{ $json.storage_path }}" }
    ]
  }
}
```

### Key Features
- Supports custom schemas (beyond default "public")
- Can perform CRUD operations on rows
- Returns complete row data including auto-generated fields
- Marked as AI Tool compatible

---

## 3. HTTP Request Node (Supabase Storage)
**Node Type:** `nodes-base.httpRequest`
**Category:** Output
**Purpose:** Download transcript files and upload assessment files to Supabase Storage

### Key Configuration
Since Supabase doesn't have a dedicated storage node, we use HTTP Request node to interact with Supabase Storage API.

### Download Transcript (Step 3)
```javascript
{
  "method": "GET",
  "url": "={{ $json.supabase_url }}/storage/v1/object/public/strms-project-files/{{ $json.storage_path }}",
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth",
  "options": {
    "response": {
      "response": {
        "responseFormat": "text"
      }
    }
  }
}
```

### Upload Assessment File (Step 7)
```javascript
{
  "method": "POST",
  "url": "={{ $json.supabase_url }}/storage/v1/object/strms-project-files/{{ $json.upload_path }}",
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth",
  "sendBody": true,
  "contentType": "raw",
  "rawBody": "={{ $json.formatted_assessment }}",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "Content-Type",
        "value": "text/plain"
      }
    ]
  }
}
```

### Required Credentials
- **Authentication Type:** Header Auth
- **Header Name:** `apikey`
- **Header Value:** Supabase Service Role Key
- **Additional Header:** `Authorization: Bearer <service_role_key>`

### OAuth Required?
No - Uses API key (Bearer token) authentication

### Key Features
- Supports all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Can handle binary and text data
- Supports custom headers and authentication
- Built-in retry logic and error handling options
- Can import cURL commands for quick setup

---

## 4. OpenAI Node (AI Analysis)
**Node Type:** `nodes-base.openAi`
**Category:** Transform
**Purpose:** Analyze demo transcript and generate readiness assessment

### Key Configuration
- **Resource:** Chat
- **Operation:** Complete
- **Model:** gpt-4o (or gpt-4-turbo)

### Required Credentials
- **Credential Type:** OpenAI API
- **Required Field:** API Key from OpenAI platform

### OAuth Required?
No - Uses API key authentication

### Configuration (Step 4)
```javascript
{
  "resource": "chat",
  "operation": "complete",
  "model": "gpt-4o",
  "messages": {
    "values": [
      {
        "role": "system",
        "content": "You are an expert business analyst specializing in automation readiness assessments. Analyze the provided demo call transcript and create a comprehensive readiness assessment document."
      },
      {
        "role": "user",
        "content": `Analyze this demo call transcript and create a readiness assessment with the following sections:

1. CUSTOMER READINESS ASSESSMENT
   - Technical capability to implement proposed automations
   - Organizational readiness (leadership support, change management)
   - Resource availability (time, budget, personnel)
   - Overall readiness score (High/Medium/Low)

2. AUTOMATION FEASIBILITY ANALYSIS
   - Technical complexity of proposed solutions
   - Integration requirements and challenges
   - Timeline expectations and realism
   - Resource requirements
   - Overall feasibility score (High/Medium/Low)

3. RECOMMENDATION
   - Clear go/no-go recommendation
   - Key success factors if proceeding
   - Potential roadblocks to address
   - Suggested next steps

Transcript:
{{ $json.transcript_content }}`
      }
    ]
  },
  "options": {
    "temperature": 0.4,
    "maxTokens": 3000
  }
}
```

### Key Parameters
- **Temperature:** 0.3-0.5 (for consistent analytical output)
- **Max Tokens:** 2000-3000 (for detailed assessments)
- **Model Selection:** Supports gpt-4o, gpt-4-turbo, gpt-3.5-turbo

### Key Features
- Supports chat completions with multi-turn conversations
- Can also handle image generation and text completions
- Marked as AI Tool compatible
- Version 1.1 with improved capabilities

---

## 5. Code Node (Text Formatting & Logic)
**Node Type:** `nodes-base.code`
**Category:** Transform
**Purpose:** Format assessment document, generate filenames, manipulate data

### Key Configuration
- **Language:** JavaScript (Python also supported)
- **Mode:** Run Once for All Items (default)

### OAuth Required?
No - No authentication needed

### Example: Format Assessment Document (Step 5)
```javascript
// JavaScript code in Code node
const projectId = $input.first().json.project_id;
const aiResponse = $input.first().json.message.content;
const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_');

const formattedDocument = `===================================================
READINESS ASSESSMENT DOCUMENT
===================================================
Project ID: ${projectId}
Generated: ${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().split(' ')[0]}
Generated By: AI Automation (GPT-4o)
===================================================

${aiResponse}

===================================================
End of Assessment
Generated automatically by GrowthLab AI Console
===================================================`;

return [{
  json: {
    project_id: projectId,
    formatted_assessment: formattedDocument,
    assessment_content: aiResponse,
    generation_timestamp: timestamp
  }
}];
```

### Example: Generate Filename (Step 6)
```javascript
// JavaScript code in Code node
const projectId = $input.first().json.project_id;
const timestamp = new Date().toISOString()
  .replace(/[-:]/g, '')
  .split('.')[0]
  .replace('T', '_');

const filename = `project_${projectId}_readiness_assessment_${timestamp}.txt`;
const storagePath = `${projectId}/assessments/${filename}`;

return [{
  json: {
    ...($input.first().json),
    generated_filename: filename,
    storage_path: storagePath,
    upload_path: storagePath
  }
}];
```

### Key Features
- Full JavaScript/Python execution environment
- Access to all input items via `$input`
- Can use npm packages (if enabled in self-hosted)
- Supports async/await
- Built-in luxon for date handling
- Can process and transform JSON data

---

## 6. Set Node (Data Preparation)
**Node Type:** `nodes-base.set`
**Category:** Input
**Purpose:** Set and transform field values, prepare data for next nodes

### Key Configuration
- **Mode:** Manual Mapping or JSON Output
- **Keep Only Set Fields:** Optional (useful for cleaning data)

### OAuth Required?
No - No authentication needed

### Example: Prepare Supabase URL (Step 2)
```javascript
{
  "mode": "manual",
  "duplicateItem": false,
  "options": {},
  "values": {
    "string": [
      {
        "name": "supabase_url",
        "value": "={{ $env.SUPABASE_URL }}"
      },
      {
        "name": "project_id",
        "value": "={{ $json.project_id }}"
      }
    ]
  }
}
```

### Example: Calculate File Size (Step 7)
```javascript
{
  "mode": "manual",
  "values": {
    "string": [
      {
        "name": "file_size",
        "value": "={{ $json.formatted_assessment.length }}"
      }
    ]
  },
  "options": {
    "includeOtherFields": true
  }
}
```

### Key Features
- Drag-and-drop interface for field mapping
- Supports expressions and fixed values
- Can remove fields or keep only specified fields
- Supports dot notation for nested objects
- Binary data pass-through option

---

## 7. If Node (Conditional Logic)
**Node Type:** `nodes-base.if`
**Category:** Transform
**Purpose:** Route workflow based on conditions (validation, error checking)

### Key Configuration
- **Conditions:** Define comparison rules
- **Combine:** AND/OR logic for multiple conditions

### OAuth Required?
No - No authentication needed

### Example: Validate project_id (Step 1)
```javascript
{
  "conditions": {
    "string": [
      {
        "value1": "={{ $json.project_id }}",
        "operation": "isNotEmpty"
      },
      {
        "value1": "={{ $json.project_id }}",
        "operation": "regex",
        "value2": "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
      }
    ]
  },
  "combineOperation": "all"
}
```

### Example: Check if Transcript Found (Step 2)
```javascript
{
  "conditions": {
    "number": [
      {
        "value1": "={{ $json.length }}",
        "operation": "largerEqual",
        "value2": 1
      }
    ]
  }
}
```

### Available Comparisons by Data Type
- **String:** equals, not equals, contains, regex, starts with, ends with, is empty, is not empty
- **Number:** equals, not equals, larger, larger equal, smaller, smaller equal
- **Boolean:** true, false
- **Date & Time:** is after, is before, between
- **Other:** exists, does not exist

### Key Features
- Two output branches: True and False
- Supports AND/OR combination of multiple conditions
- Can use expressions in comparisons
- Works with all data types

---

## 8. Respond to Webhook Node (Return Response)
**Node Type:** `nodes-base.respondToWebhook`
**Category:** Transform
**Purpose:** Return custom response to webhook caller

### Key Configuration
- **Respond With:** JSON, Text, Binary File, or No Data
- Works only with Webhook node set to "Using 'Respond to Webhook' Node"

### OAuth Required?
No - No authentication needed

### Example: Success Response (Step 9)
```javascript
{
  "respondWith": "json",
  "responseBody": {
    "success": true,
    "project_id": "={{ $json.project_id }}",
    "assessment_file_id": "={{ $json.id }}",
    "file_name": "={{ $json.file_name }}",
    "message": "Readiness assessment generated successfully"
  },
  "options": {
    "responseCode": 200,
    "responseHeaders": {
      "entries": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    }
  }
}
```

### Example: Error Response (After If node false branch)
```javascript
{
  "respondWith": "json",
  "responseBody": {
    "success": false,
    "error": "No demo transcript found for project",
    "project_id": "={{ $json.project_id }}"
  },
  "options": {
    "responseCode": 404
  }
}
```

### Key Features
- Runs once (uses first data item only)
- Can set custom HTTP status codes
- Supports custom headers
- Can return all items or just first item
- Optional second output branch for response data

---

## 9. Stop and Error Node (Error Handling)
**Node Type:** `nodes-base.stopAndError`
**Category:** Input
**Purpose:** Throw custom errors and stop workflow execution

### Key Configuration
- **Error Type:** Error Message or Error Object
- Used on False branches of If nodes for validation failures

### OAuth Required?
No - No authentication needed

### Example: Missing project_id Error
```javascript
{
  "errorType": "errorObject",
  "errorObject": {
    "message": "Missing or invalid project_id in request",
    "statusCode": 400,
    "project_id": "={{ $json.project_id }}"
  }
}
```

### Example: Transcript Not Found Error
```javascript
{
  "errorType": "errorMessage",
  "errorMessage": "No demo transcript found for project {{ $json.project_id }}"
}
```

### Key Features
- Can trigger error workflows
- Useful for validation failures
- Provides clear error messages in execution logs
- Can include structured error objects with additional data

---

## Additional Useful Nodes

### 10. Merge Node
**Node Type:** `nodes-base.merge`
**Purpose:** Combine data from multiple branches
**Use Case:** Merge results from parallel processing or combine data sources

### 11. Switch Node
**Node Type:** `nodes-base.switch`
**Purpose:** Route to multiple branches based on conditions
**Use Case:** More complex routing than If node (3+ branches)

### 12. Wait Node
**Node Type:** `nodes-base.wait`
**Purpose:** Pause workflow execution
**Use Case:** Rate limiting, waiting for external processes

---

## Workflow Node Sequence Summary

```
1. Webhook (Trigger) → Receive POST with project_id
2. If Node → Validate project_id format
   ├─ False → Stop and Error (400 Bad Request)
   └─ True → Continue
3. Supabase Node → Query strms_project_files for transcript
4. If Node → Check if transcript found
   ├─ False → Respond to Webhook (404 Not Found)
   └─ True → Continue
5. HTTP Request → Download transcript from Supabase Storage
6. Code Node → Extract transcript content
7. OpenAI Node → Generate assessment with GPT-4o
8. Code Node → Format assessment document with headers
9. Code Node → Generate filename and storage path
10. Set Node → Calculate file size
11. HTTP Request → Upload formatted assessment to Supabase Storage
12. Supabase Node → Insert file metadata into strms_project_files
13. Respond to Webhook → Return success response (200 OK)
```

### Error Handling Branches
- Invalid project_id → Stop and Error → 400 response
- No transcript found → Respond to Webhook → 404 response
- OpenAI API failure → Respond to Webhook → 500 response
- Storage upload failure → Respond to Webhook → 500 response

---

## Authentication Summary

| Node | Auth Type | OAuth? | Credentials Required |
|------|-----------|--------|---------------------|
| Webhook | Header/Basic/JWT | No | Optional (webhook secret) |
| Supabase | API Key | No | Supabase URL + Service Role Key |
| HTTP Request (Storage) | Bearer Token | No | Supabase Service Role Key |
| OpenAI | API Key | No | OpenAI API Key |
| Code | None | No | None |
| Set | None | No | None |
| If | None | No | None |
| Respond to Webhook | None | No | None |
| Stop and Error | None | No | None |

---

## Environment Variables Needed

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Optional: Webhook Security
WEBHOOK_SECRET=your-webhook-secret-for-validation
```

---

## Testing Checklist

- [ ] Webhook receives and validates project_id
- [ ] Database query retrieves correct transcript metadata
- [ ] Storage download gets transcript content
- [ ] OpenAI generates well-formatted assessment
- [ ] Document formatting includes all required sections
- [ ] Filename generation follows naming convention
- [ ] Storage upload succeeds
- [ ] Database insert creates metadata record
- [ ] Success response returns correct data
- [ ] Error cases return appropriate status codes
- [ ] Invalid project_id returns 400
- [ ] Missing transcript returns 404
- [ ] API failures return 500

---

## Notes

- All nodes except Webhook, Supabase, HTTP Request, and OpenAI require no credentials
- Code nodes can be replaced with Set nodes for simpler transformations
- Consider using environment variables for all configuration values
- Implement retry logic in HTTP Request nodes for API reliability
- Monitor OpenAI token usage to control costs
- Supabase Storage API follows standard REST patterns
- Maximum file size for assessment should stay under 1MB (typical: 5-15KB)

---

**Document Version:** 1.0
**Last Updated:** 2025-01-14
**Workflow:** Readiness Assessment Automation
**Status:** Ready for Implementation
