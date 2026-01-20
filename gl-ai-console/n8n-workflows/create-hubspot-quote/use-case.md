# Create HubSpot Quote Workflow

## Purpose

This workflow creates a HubSpot quote from the Create Quote stage of the RevOps Sales Pipeline. It:
1. Reads line items from Supabase (stored by the UI)
2. Creates line items in HubSpot
3. Creates a quote and associates it with the deal, contact, company, and line items
4. Publishes the quote to generate a shareable link
5. Updates Supabase with HubSpot sync status and quote URL
6. Returns the quote link to the UI

**Note**: HubSpot Quotes API does not return a PDF download URL for API-created quotes. Only the shareable quote link is available.

## Trigger

**Webhook**: `POST /create-hubspot-quote`

## Input Payload

```json
{
  "deal_id": "uuid-of-revops-deal"
}
```

**Note**: Line items are read directly from Supabase (`revops_pipeline_stage_data` table), not from the webhook payload. The UI saves line items to Supabase as they are created/modified.

## Output

```json
{
  "success": true,
  "quote_id": "12345678",
  "quote_link": "https://growthlabfinancial-4723689.hs-sites.com/quote-12345678"
}
```

## Workflow Steps

1. **Receive Webhook** - POST /create-hubspot-quote with `deal_id`
2. **Validate deal_id** - Check for valid UUID format
3. **Get Deal from Supabase** - Fetch from `revops_pipeline_deals` table to get `hs_deal_id` and `company_name`
4. **Check HubSpot Deal ID** - Ensure deal has HubSpot association
5. **Get Line Items from Supabase** - Fetch from `revops_pipeline_stage_data` where `stage_id='create-quote'` and `data_key='line_items'`
6. **Get HubSpot Deal** - Fetch deal to get associated contact/company IDs
7. **Get Default Quote Template** - Fetch first available quote template
8. **Prepare Quote Data** - Transform line items from Supabase format to HubSpot format
9. **Create Line Items** - Loop through line items and create each in HubSpot
10. **Collect Line Item IDs** - Gather all created HubSpot line item IDs
11. **Create Quote** - Create draft quote with title, expiration date (30 days), and `hs_language: "en"`
12. **Associate Quote** - Link to deal, contact, company, template using default associations
13. **Associate Line Items** - Link each line item to the quote
14. **Publish Quote** - Set status to `APPROVAL_NOT_NEEDED` with `hs_domain` and `hs_slug`
15. **Get Quote Details** - Fetch published quote to get `hs_quote_link`
16. **Update Supabase** - Store HubSpot sync data in `revops_pipeline_stage_data`:
    - `hubspot_synced`: true
    - `hubspot_synced_at`: ISO timestamp
    - `hubspot_quote_link`: HubSpot quote URL
17. **Respond** - Return success with quote link

## Supabase Data Flow

### Reading Line Items
The workflow reads from `revops_pipeline_stage_data` table:
- `deal_id`: The RevOps deal UUID
- `stage_id`: `"create-quote"`
- `data_key`: `"line_items"`
- `data_value`: JSONB array of line items

**Line Item Format in Supabase:**
```json
[
  {
    "id": "uuid",
    "service": "Accounting Services",
    "description": "Monthly accounting services - Cash Basis, Monthly Cadence",
    "monthlyPrice": 1250,
    "isCustom": false
  }
]
```

### Writing HubSpot Sync Data
After successful quote creation, the workflow writes to `revops_pipeline_stage_data`:
| data_key | data_value |
|----------|------------|
| `hubspot_synced` | `true` |
| `hubspot_synced_at` | ISO timestamp |
| `hubspot_quote_link` | HubSpot quote URL |

## Error Handling

- **Invalid deal_id**: Return 400 with error message
- **No HubSpot deal ID**: Return 400 asking user to sync deal first
- **No line items**: Workflow will create quote without line items
- **HubSpot API errors**: Return 500 with error details

## Prerequisites

- HubSpot OAuth credentials with scopes:
  - `crm.objects.quotes.write`, `crm.objects.quotes.read`
  - `crm.objects.line_items.write`, `crm.objects.line_items.read`
  - `crm.objects.deals.read`, `crm.objects.contacts.read`, `crm.objects.companies.read`
- Supabase credentials for table access:
  - `revops_pipeline_deals` - Read deal info
  - `revops_pipeline_stage_data` - Read line items, write sync status
- At least one quote template in HubSpot

## Related Workflows

- `move-deal-to-create-quote` - Moves deal to Create Quote stage
- `create-hubspot-deal` - Creates initial HubSpot deal with contact/company associations

## Version History

- **v2.1.0** - Removed PDF URL handling (not available from HubSpot Quotes API). Added `hs_language`, `hs_domain`, and `hs_slug` properties for quote creation/publishing.
- **v2.0.0** - Migrated to read line items from Supabase instead of webhook payload. Added Supabase updates for HubSpot sync status.
- **v1.0.0** - Initial version with line items passed in webhook payload.
