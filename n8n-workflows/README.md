# n8n Workflow Templates for Salesboy AI

These workflow templates handle task execution for the Salesboy AI system.

## Workflows

### 1. Create Order Workflow (`create_order.json`)
Handles customer order placement:
- Receives order details from AI
- Validates order information
- Creates order in your system
- Sends confirmation back to customer

### 2. Book Calendar Workflow (`book_calendar.json`)
Handles appointment scheduling:
- Receives booking request
- Checks availability
- Creates calendar event
- Sends confirmation

### 3. Send Email Workflow (`send_email.json`)
Handles email sending:
- Receives email request
- Formats email content
- Sends via SMTP/SendGrid
- Confirms delivery

### 4. Human Handoff Workflow (`human_handoff.json`)
Routes complex requests to human agents:
- Receives handoff request
- Notifies team via Slack/Email
- Creates ticket in support system
- Acknowledges to customer

## Setup Instructions

### 1. Import Workflows to n8n

1. Open your n8n instance: `https://n8n.srv892192.hstgr.cloud`
2. Click "Workflows" → "Import from File"
3. Select each JSON file and import
4. Activate each workflow

### 2. Configure Webhook URLs

Each workflow has a webhook trigger. The URLs should be:
- Create Order: `https://n8n.srv892192.hstgr.cloud/webhook/create_order`
- Book Calendar: `https://n8n.srv892192.hstgr.cloud/webhook/book_calendar`
- Send Email: `https://n8n.srv892192.hstgr.cloud/webhook/send_email`
- Human Handoff: `https://n8n.srv892192.hstgr.cloud/webhook/human_handoff`

### 3. HMAC Validation

Each workflow includes HMAC signature validation for security.

The validation node checks:
```javascript
const crypto = require('crypto');
const secret = 'YOUR_HMAC_SECRET';
const signature = $node["Webhook"].json["headers"]["x-signature"];
const body = JSON.stringify($node["Webhook"].json["body"]);
const expectedSignature = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');

return signature === expectedSignature;
```

### 4. Customize Actions

Each workflow has placeholder nodes that you need to configure:
- **Email nodes**: Add your SMTP credentials or SendGrid API key
- **Calendar nodes**: Connect to Google Calendar or other calendar service
- **Database nodes**: Connect to your order management system
- **Notification nodes**: Add Slack webhook or email for team notifications

## Workflow Structure

All workflows follow this pattern:

```
Webhook Trigger
    ↓
HMAC Validation
    ↓
Extract Data
    ↓
Execute Action (customize this)
    ↓
Send Response
```

## Testing Workflows

Use the test script to verify workflows:

```bash
cd salesboy-core
node test-ai-pipeline.js
```

Or test individual workflows with curl:

```bash
# Test create_order workflow
curl -X POST https://n8n.srv892192.hstgr.cloud/webhook/create_order \
  -H "Content-Type: application/json" \
  -H "X-Signature: sha256=YOUR_HMAC_SIGNATURE" \
  -d '{
    "task_type": "create_order",
    "payload": {
      "product": "iPhone 14 Pro",
      "quantity": 2
    },
    "user_id": "00000000-0000-0000-0000-000000000001",
    "from_number": "2349058653283@c.us",
    "original_message": "I want to buy 2 iPhone 14 Pro"
  }'
```

## Next Steps

1. Import all workflows
2. Configure your specific integrations (email, calendar, database)
3. Test each workflow
4. Monitor execution logs in n8n
5. Customize responses and actions as needed

## Support

For issues or questions:
- Check n8n execution logs
- Review Salesboy AI logs: `/workspaces/Salesboy/salesboy-core`
- Check webhook endpoint connectivity
