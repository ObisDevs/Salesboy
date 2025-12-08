# Salesboy AI - Quick Reference Card

## 🎯 Your Current Issues

### 1. Pinecone Shows 0 Records
**Why:** Files uploaded but not embedded yet  
**Fix:** Run embed for each file (see below)

### 2. n8n Error When Embedding
**Why:** Embed doesn't use n8n - error is from something else  
**Fix:** Check Vercel logs to see actual error

---

## 📝 How to Embed Your 2 Files

### Option 1: Manual (Recommended)

1. **Get file IDs from Supabase:**
   - Go to https://supabase.com/dashboard
   - Open `knowledge_base` table
   - Copy the `id` column values

2. **Process and embed each file:**
   ```bash
   # Replace FILE_ID with actual UUID
   
   # File 1
   curl -X POST https://salesboy-lilac.vercel.app/api/kb/process \
     -H "Content-Type: application/json" \
     -d '{"file_id": "FILE_ID_1"}'
   
   curl -X POST https://salesboy-lilac.vercel.app/api/kb/embed \
     -H "Content-Type: application/json" \
     -d '{"file_id": "FILE_ID_1"}'
   
   # File 2
   curl -X POST https://salesboy-lilac.vercel.app/api/kb/process \
     -H "Content-Type: application/json" \
     -d '{"file_id": "FILE_ID_2"}'
   
   curl -X POST https://salesboy-lilac.vercel.app/api/kb/embed \
     -H "Content-Type: application/json" \
     -d '{"file_id": "FILE_ID_2"}'
   ```

3. **Check Pinecone:**
   - Go to https://app.pinecone.io/
   - Select `salesboy-vectors` index
   - Look for namespace `user_YOUR_USER_ID`
   - Should see vectors now

### Option 2: Using Script

```bash
./embed-all-files.sh
# Then paste your file IDs (one per line)
# Press Ctrl+D when done
```

---

## 🔍 Check What Went Wrong

### View Vercel Logs
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Logs" tab
4. Look for errors in `/api/kb/embed`

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "File not found" | Wrong file_id | Check Supabase for correct ID |
| "Not processed" | Skipped process step | Run `/api/kb/process` first |
| "Embedding failed" | API key issue | Check Gemini/OpenAI keys in Vercel |
| "Pinecone error" | Connection issue | Check Pinecone API key |

---

## 🚀 Quick Commands

```bash
# Check system status
./check-system-status.sh

# Get WhatsApp QR code
./reset-and-get-qr.sh

# Embed single file
./test-embed-direct.sh FILE_ID

# Embed multiple files
./embed-all-files.sh

# Upload and embed test data
./test-kb-simple.sh
```

---

## 📊 Verify Everything Works

### 1. Check Supabase
```sql
-- View uploaded files
SELECT id, filename, status, user_id 
FROM knowledge_base;
```

### 2. Check Pinecone
- Dashboard: https://app.pinecone.io/
- Index: `salesboy-vectors`
- Should see vectors in namespace

### 3. Test RAG Query
Send a WhatsApp message to your connected number asking about your business info.

---

## ⚠️ Important Notes

1. **Embed ≠ n8n**  
   The embed endpoint does NOT use n8n. If you see n8n errors, they're from message processing, not embedding.

2. **Process before Embed**  
   Always run `/api/kb/process` before `/api/kb/embed`

3. **One file at a time**  
   Process and embed each file individually

4. **Check file status**  
   In Supabase, status should go: `uploaded` → `processed` → `embedded`

---

## 🆘 Still Not Working?

1. **Check Vercel logs** for actual error
2. **Verify environment variables** in Vercel:
   - GEMINI_API_KEY
   - OPENAI_API_KEY
   - PINECONE_API_KEY
   - PINECONE_INDEX_NAME
   - SUPABASE_SERVICE_ROLE_KEY
3. **Test API keys** individually
4. **Check Supabase Storage** - files should be in `knowledge-base` bucket

---

## 📞 Next Steps After Embedding

1. ✅ Verify vectors in Pinecone
2. ✅ Connect WhatsApp (get QR code)
3. ✅ Add phone numbers to whitelist
4. ✅ Send test message
5. ✅ Verify AI response uses your knowledge base

---

**Quick Start:** Get your file IDs from Supabase, then run the curl commands above!
