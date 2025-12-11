# 🔒 Required Fields Validation Fix

## Problem
AI was sending tasks to n8n with empty/missing required fields:
```json
{
  "customer_name": "Not provided",
  "customer_email": "Not provided"
}
```

This caused workflows to fail or send emails to invalid addresses.

## Root Cause
- Intent classifier was marking tasks as "ready" even with placeholder values
- No validation before executing tasks
- AI wasn't strictly enforcing data collection

## Solution Applied

### 1. Strict Required Fields

**ALL task types now require:**
- ✅ `customer_name` (REQUIRED - no placeholders)
- ✅ `customer_email` (REQUIRED - no placeholders)

**Orders additionally require:**
- ✅ `delivery_address` (REQUIRED for place_order, create_order)

### 2. Updated Intent Classifier Rules

**Before:**
```
IMPORTANT: ALWAYS collect customer_name first for ALL task types.
```

**After:**
```
CRITICAL RULES:
1. NEVER mark task as "ready" if customer_name is "Not provided" or missing
2. NEVER mark task as "ready" if customer_email is "Not provided" or missing
3. For orders: NEVER mark as "ready" if delivery_address is missing
4. ALWAYS ask for missing info explicitly
5. Extract info from conversation history if already provided
6. Do NOT use placeholders - keep status as "collecting" until real data is provided
```

### 3. Added Server-Side Validation

**New validation in webhook handler:**
```typescript
const hasValidName = payload.customer_name && payload.customer_name !== 'Not provided'
const hasValidEmail = payload.customer_email && payload.customer_email !== 'Not provided'
const hasValidAddress = !needsAddress || (payload.delivery_address && payload.delivery_address !== 'Not provided')

if (!hasValidName || !hasValidEmail || !hasValidAddress) {
  // Ask for missing info instead of executing task
  responseMessage = `I need a bit more information before I can proceed...`
}
```

### 4. Collection Order

AI now collects in this order:
1. **customer_name** (FIRST)
2. **customer_email** (SECOND)
3. **delivery_address** (THIRD - only for orders)
4. Other task-specific fields

### 5. Updated n8n Workflows

All workflows now properly extract:
- `customer_name`
- `customer_email`
- `delivery_address` (for orders)

## Example Conversation Flow

### ❌ Before (Broken)
```
Customer: "Send me the payment details"
AI: ✅ Email sent!
n8n: {customer_email: "Not provided"} ❌ FAILS
```

### ✅ After (Fixed)
```
Customer: "Send me the payment details"
AI: "May I have your name?"
Customer: "John"
AI: "What's your email address?"
Customer: "john@example.com"
AI: ✅ Email sent to john@example.com!
n8n: {customer_name: "John", customer_email: "john@example.com"} ✅ SUCCESS
```

## Testing Scenarios

### Test 1: Send Email
```
Customer: "Email me the catalog"
AI: "May I have your name?"
Customer: "Sarah"
AI: "What's your email address?"
Customer: "sarah@example.com"
AI: ✅ Sends email to sarah@example.com
```

### Test 2: Create Order
```
Customer: "I want to order a laptop"
AI: "May I have your name?"
Customer: "Mike"
AI: "What's your email address?"
Customer: "mike@example.com"
AI: "Where should we deliver it?"
Customer: "123 Main St, Lagos"
AI: ✅ Order created with delivery address
```

### Test 3: Extract from History
```
Customer: "Hi, I'm John and my email is john@example.com"
AI: "Hello John! How can I help?"
Customer: "Send me the price list"
AI: ✅ Email sent to john@example.com (extracted from history)
```

## Validation Logs

Check console for:
```
⚠️ Task missing required fields: { hasValidName: false, hasValidEmail: false, hasValidAddress: true }
```

## Files Modified

1. ✅ `salesboy-core/lib/intent-classifier.ts`
   - Added CRITICAL RULES section
   - Made customer_name, customer_email, delivery_address REQUIRED
   - Added validation rules to prevent "Not provided" placeholders

2. ✅ `salesboy-core/app/api/webhook/whatsapp/route.ts`
   - Added server-side validation before task execution
   - Blocks tasks with missing required fields
   - Asks for missing info instead of proceeding

3. ✅ `n8n-workflows/send_email_template.json`
   - Extracts customer_email properly
   - Uses customer_name in subject

4. ✅ `n8n-workflows/create_order_template.json`
   - Added customer_email and delivery_address extraction

5. ✅ `n8n-workflows/book_meeting_template.json`
   - Added customer_email extraction

## Impact

- ✅ No more emails sent to "Not provided"
- ✅ No more orders without delivery addresses
- ✅ All tasks have valid customer contact info
- ✅ Better data quality for CRM/analytics
- ✅ Improved customer experience

## Rollback Plan

If issues occur, revert these commits:
```bash
git revert HEAD~1
```

---

**Status:** ✅ Applied and ready for testing
**Priority:** Critical - prevents data quality issues
