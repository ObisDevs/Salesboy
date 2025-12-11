# n8n Workflow Templates for Salesboy AI

## 🔧 Setup Instructions

### 1. Import Workflows into n8n

1. Open your n8n instance
2. Click **Workflows** → **Import from File**
3. Import each JSON template:
   - `create_order_template.json`
   - `send_email_template.json`
   - `book_meeting_template.json`

### 2. Configure Webhook URLs

Each workflow uses a specific webhook path:

- **Create Order**: `https://your-n8n-domain.com/webhook/create_order`
- **Send Email**: `https://your-n8n-domain.com/webhook/send_email`
- **Book Meeting**: `https://your-n8n-domain.com/webhook/book_meeting`

### 3. Update Environment Variables

In your **Salesboy Core** `.env.local`:

```env
N8N_WEBHOOK_URL=https://your-n8n-domain.com
```

### 4. Activate Workflows

In n8n, activate each workflow by clicking the toggle switch.

---

## 🐛 Fixed Issues

### 1. "Unused Respond to Webhook" Error
**Problem**: Using `responseMode: "responseNode"` without proper response nodes.
**Solution**: All templates use `responseMode: "lastNode"` - auto-responds with last node output.

### 2. Empty Payload Arrays
**Problem**: Intent classifier sending empty `payload: {}` objects.
**Solution**: 
- Added payload validation in webhook handler
- Improved LLM prompt to store data as key-value pairs
- Fallback to `{raw_message: message}` if payload is empty

### 3. Missing Customer Names
**Problem**: Tasks executed without collecting customer names.
**Solution**:
- Added `customer_name` as REQUIRED field for ALL task types
- AI now asks "May I have your name?" before collecting other details
- Extracts names from conversation (e.g., "I'm John" → customer_name: "John")

**Key Changes:**
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "create_order",
    "responseMode": "lastNode",  // Changed from "responseNode"
    "options": {}
  }
}
```

---

## 📋 Workflow Details

### 1. Create Order Workflow

**Trigger**: `POST /webhook/create_order`

**Input Payload**:
```json
{
  "task_type": "create_order",
  "user_id": "uuid",
  "from_number": "1234567890@c.us",
  "original_message": "I want to order 5 laptops",
  "payload": {
    "customer_name": "John Doe",
    "items": "laptops",
    "quantity": 5,
    "price": 100000,
    "customer_phone": "1234567890@c.us"
  }
}
```

**Output**:
```json
{
  "success": true,
  "order_id": "ORD-1234567890",
  "customer_name": "John Doe",
  "product": "laptops",
  "quantity": 5,
  "total": 500000,
  "message": "Order ORD-1234567890 created for John Doe. Product: laptops (Qty: 5)"
}
```

**Customization**:
- Replace the "Create Order" code node with actual database insertion
- Add Supabase node to insert into `orders` table
- Add email notification node
- Add payment link generation

---

### 2. Send Email Workflow

**Trigger**: `POST /webhook/send_email`

**Input Payload**:
```json
{
  "task_type": "send_email",
  "user_id": "uuid",
  "from_number": "1234567890@c.us",
  "original_message": "Email me the product catalog",
  "email_content": "Here is the product catalog...",
  "payload": {
    "customer_name": "Jane Smith",
    "customer_email": "customer@example.com",
    "reason": "Product catalog request"
  }
}
```

**Customization**:
- Add Gmail node or SendGrid node
- Replace code node with actual email sending
- Add email templates
- Add attachments support

---

### 3. Book Meeting Workflow

**Trigger**: `POST /webhook/book_meeting`

**Input Payload**:
```json
{
  "task_type": "book_meeting",
  "user_id": "uuid",
  "from_number": "1234567890@c.us",
  "original_message": "I want to schedule a meeting tomorrow at 2pm",
  "payload": {
    "customer_name": "Mike Johnson",
    "reason": "Product demo",
    "preferred_date": "2024-01-15",
    "preferred_time": "14:00"
  }
}
```

**Customization**:
- Add Google Calendar node
- Add Calendly integration
- Add email confirmation
- Add calendar invite generation

---

## 🔐 Security

All webhooks receive HMAC signatures in the `X-Signature` header:

```
X-Signature: sha256=<hmac_hash>
```

To verify (optional):
1. Add a Code node after Webhook
2. Verify HMAC signature
3. Reject if invalid

---

## 🚀 Advanced Usage

### Adding More Task Types

1. Create new workflow in n8n
2. Set webhook path to match task type (e.g., `/webhook/place_order`)
3. Use `responseMode: "lastNode"`
4. The Salesboy Core will automatically route tasks based on `task_type`

### Sending Response Back to Customer

To send a WhatsApp message back to the customer after task completion:

```javascript
// In your final n8n node
const response = await fetch('https://your-salesboy-domain.com/api/actions/send-message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    user_id: $input.item.json.user_id,
    to: $input.item.json.from_number,
    message: 'Your order has been confirmed! Order ID: ORD-123'
  })
});

return { json: { success: true } };
```

---

## 📝 Testing

Test workflows using curl:

```bash
curl -X POST https://your-n8n-domain.com/webhook/create_order \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "create_order",
    "user_id": "test-user-id",
    "from_number": "1234567890@c.us",
    "payload": {
      "items": "laptop",
      "quantity": 2
    }
  }'
```

---

## 🆘 Troubleshooting

### Error: "Unused Respond to Webhook node"
- **Solution**: Use `responseMode: "lastNode"` instead of `"responseNode"`
- All templates have been updated with this fix

### Error: "Workflow not found"
- **Solution**: Make sure workflow is activated in n8n
- Check webhook path matches task_type

### Error: "HMAC validation failed"
- **Solution**: Ensure `HMAC_SECRET` matches between Core and n8n
- Or disable HMAC validation in development

---

## 📚 Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Webhook Node Docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [Code Node Docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/)
