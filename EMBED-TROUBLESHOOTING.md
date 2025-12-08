# Knowledge Base Embed Troubleshooting

## Important: Embed Does NOT Use n8n

The `/api/kb/embed` endpoint has **nothing to do with n8n**. It only:

1. ✅ Downloads file from Supabase Storage
2. ✅ Chunks the text
3. ✅ Generates embeddings using Gemini/OpenAI
4. ✅ Uploads vectors to Pinecone

**n8n is only used for task automation** (like sending emails, booking calendar, etc.), NOT for knowledge base operations.

---

## How to Embed Your Files

### Step 1: Get Your File IDs

Go to Supabase Dashboard:
1. Open your project: https://supabase.com/dashboard
2. Go to Table Editor
3. Open `knowledge_base` table
4. Copy the `id` (UUID) of your uploaded files

### Step 2: Process Each File

```bash
curl -X POST https://salesboy-lilac.vercel.app/api/kb/process \
  -H "Content-Type: application/json" \
  -d '{"file_id": "YOUR_FILE_ID_HERE"}'
```

This extracts and chunks the text.

### Step 3: Embed Each File

```bash
curl -X POST https://salesboy-lilac.vercel.app/api/kb/embed \
  -H "Content-Type: application/json" \
  -d '{"file_id": "YOUR_FILE_ID_HERE"}'
```

This generates embeddings and uploads to Pinecone.

### Step 4: Verify in Pinecone

1. Go to Pinecone dashboard: https://app.pinecone.io/
2. Select your index: `salesboy-vectors`
3. Check the namespace (e.g., `user_YOUR_USER_ID`)
4. You should see vectors with metadata

---

## Using the Test Script

```bash
# Get file_id from Supabase, then run:
./test-embed-direct.sh YOUR_FILE_ID_HERE
```

---

## Common Errors and Solutions

### Error: "File not found or not processed"

**Cause:** File hasn't been processed yet, or wrong file_id

**Solution:**
```bash
# First process
curl -X POST https://salesboy-lilac.vercel.app/api/kb/process \
  -H "Content-Type: application/json" \
  -d '{"file_id": "YOUR_FILE_ID"}'

# Then embed
curl -X POST https://salesboy-lilac.vercel.app/api/kb/embed \
  -H "Content-Type: application/json" \
  -d '{"file_id": "YOUR_FILE_ID"}'
```

### Error: "Failed to download file"

**Cause:** File not in Supabase Storage, or wrong path

**Solution:**
1. Check Supabase Storage bucket `knowledge-base`
2. Verify file exists at the path in `knowledge_base.file_path`
3. Check storage permissions

### Error: "All embedding providers failed"

**Cause:** Gemini and OpenAI API keys invalid or rate limited

**Solution:**
1. Check Vercel environment variables:
   - `GEMINI_API_KEY`
   - `OPENAI_API_KEY`
2. Verify API keys are valid
3. Check API quotas/billing

### Error: Pinecone connection failed

**Cause:** Pinecone API key or index name incorrect

**Solution:**
1. Check Vercel environment variables:
   - `PINECONE_API_KEY`
   - `PINECONE_INDEX_NAME` (should be `salesboy-vectors`)
2. Verify index exists in Pinecone dashboard
3. Check API key permissions

---

## Why You Might See n8n Errors

If you're seeing n8n errors, it's likely from:

1. **WhatsApp message processing** - When a message is classified as a "Task", it tries to forward to n8n
2. **Manual n8n testing** - If you called `/api/actions/forward-to-n8n` directly

**The embed endpoint does NOT call n8n.**

---

## Complete Flow for 2 Files

Assuming your file IDs are:
- File 1: `abc123-def456-ghi789`
- File 2: `xyz789-uvw456-rst123`

```bash
# File 1
curl -X POST https://salesboy-lilac.vercel.app/api/kb/process \
  -H "Content-Type: application/json" \
  -d '{"file_id": "abc123-def456-ghi789"}'

curl -X POST https://salesboy-lilac.vercel.app/api/kb/embed \
  -H "Content-Type: application/json" \
  -d '{"file_id": "abc123-def456-ghi789"}'

# File 2
curl -X POST https://salesboy-lilac.vercel.app/api/kb/process \
  -H "Content-Type: application/json" \
  -d '{"file_id": "xyz789-uvw456-rst123"}'

curl -X POST https://salesboy-lilac.vercel.app/api/kb/embed \
  -H "Content-Type: application/json" \
  -d '{"file_id": "xyz789-uvw456-rst123"}'
```

---

## Check Vercel Logs

To see what's actually happening:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Logs" tab
4. Filter by `/api/kb/embed`
5. Look for errors

---

## Expected Success Response

```json
{
  "message": "Embeddings generated successfully",
  "vectors": 5
}
```

This means 5 vectors were uploaded to Pinecone.

---

## Verify Embeddings Work

After embedding, test a query:

```bash
# This will use the RAG pipeline to search your knowledge base
# (You'll need to implement a test query endpoint or send a WhatsApp message)
```

---

## Summary

1. ✅ Upload files via `/api/kb/upload`
2. ✅ Process files via `/api/kb/process`
3. ✅ Embed files via `/api/kb/embed`
4. ✅ Verify in Pinecone dashboard
5. ❌ n8n is NOT involved in this process

If you're seeing n8n errors, they're from a different part of the system (message processing or task forwarding).
