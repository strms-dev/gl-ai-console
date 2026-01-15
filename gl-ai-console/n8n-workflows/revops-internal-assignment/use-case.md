# Internal Assignment Email Workflow

## Overview
This workflow sends an internal email to the GrowthLab team when the "Send Internal Assignment" button is clicked in the Internal Team Assignment stage of the RevOps Sales Pipeline.

## Trigger
- **Webhook**: `POST /webhook/revops-internal-assignment`
- **Request Body**: `{ "deal_id": "<uuid>" }`

## Workflow Steps

1. **Validate Deal ID** - Ensure deal_id is a valid UUID
2. **Get Deal Details** - Fetch deal info from `revops_pipeline_deals`
3. **Get Stage Data** - Fetch internal review data from `revops_pipeline_stage_data`
4. **Build Email Data** - Transform key-value stage data into email object
5. **Send Gmail** - Send email via Gmail OAuth
   - To: Selected team members
   - CC: `t.scullion@growthlabfinancial.com` (if enabled)
   - Subject: From stage data
   - Body: From stage data
6. **Update Sent At** - Update `sent_at` timestamp in Supabase
7. **Respond Success** - Return success response

## Email Template
```
Subject: General Ledger Review Needed For {Company Name}

Hi Team,

You have just been granted accounting access to the following general ledger:

- {Platform}/{Company Name}

Please submit your General Ledger Review for the above account, and notify Tim when it has been completed.
```

## Configuration Required
1. **Gmail OAuth**: Configure Gmail OAuth credentials in n8n
2. **Supabase API**: Already configured as "GL AI Console Supabase Key"

## Error Responses
- `400` - Invalid deal_id (not a valid UUID)
- `404` - Deal not found
- `404` - No internal assignment data found for this deal
- `500` - Gmail send failure

## Success Response
```json
{
  "success": true,
  "deal_id": "<uuid>",
  "message": "Internal assignment email sent successfully"
}
```
