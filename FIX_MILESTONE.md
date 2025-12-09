# Fix Milestone - Complete Salesboy AI

**Status**: Ready to Execute  
**Estimated Time**: 8-12 hours  
**Priority**: High

---

## 🚨 CRITICAL ISSUE #1: Gateway Auto-Restoring Test User Sessions

### Problem
**Location**: `salesboy-gateway/src/lib/session-manager.js`

The `restoreExistingSessions()` function automatically restores ALL sessions on gateway startup:

```javascript
restoreExistingSessions() {
  const sessions = fs.readdirSync(authDir);
  sessions.forEach(sessionDir => {
    if (sessionDir.startsWith('session-')) {
      const userId = sessionDir.replace('session-', '');
      this.createSession(userId); // ❌ Restores ALL sessions including test users
    }
  });
}
```

**Impact**:
- Old test user sessions (`session-current-user`, `session-test-user-123`) are auto-restored
- Each restored session initializes WhatsApp client
- Continuous QR code generation for non-existent users
- VPS CPU/memory overload
- Gateway becomes slow/unresponsive

**Root Cause**:
- No validation of userId format before restoration
- No check if user still exists in database
- No authentication required for session restoration

### Fix Required

**Option A: Validate UUID Format** (Recommended)
```javascript
restoreExistingSessions() {
  try {
    const authDir = '.wwebjs_auth';
    if (!fs.existsSync(authDir)) return;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const sessions = fs.readdirSync(authDir);
    
    sessions.forEach(sessionDir => {
      if (sessionDir.startsWith('session-')) {
        const userId = sessionDir.replace('session-', '');
        
        // Only restore valid UUID sessions
        if (uuidRegex.test(userId)) {
          logger.info(`Restoring session for user ${userId}`);
          this.createSession(userId).catch(err => 
            logger.error(`Failed to restore session for ${userId}:`, err)
          );
        } else {
          logger.warn(`Skipping invalid session: ${sessionDir}`);
        }
      }
    });
  } catch (error) {
    logger.error('Error restoring sessions:', error);
  }
}
```

**Option B: Disable Auto-Restore** (Simpler)
```javascript
restoreExistingSessions() {
  // Disabled - sessions must be started explicitly via API
  logger.info('Auto-restore disabled. Sessions must be started via /session/start');
}
```

**Immediate Action Required**:
1. SSH to VPS: `ssh root@srv892192.hstgr.cloud`
2. Delete old test sessions:
   ```bash
   cd /root/salesboy-gateway/.wwebjs_auth
   rm -rf session-current-user session-test-user*
   ```
3. Restart gateway: `pm2 restart salesboy-gateway`
4. Apply code fix (Option A recommended)

---

## 🐛 BUG #2: Placeholder Whitelist Creation

### Problem
**Location**: `salesboy-core/app/api/auth/on-signup/route.ts`

```typescript
await supabaseAdmin.from('whitelists').insert({
  user_id: userId,
  phone_number: 'placeholder',  // ❌ Creates useless data
  name: 'System Placeholder',
  notes: 'Auto-created on signup'
})
```

**Impact**:
- Creates fake whitelist entry on every signup
- Blocks user from adding real whitelist with same number
- Confuses users in dashboard
- Violates data integrity

### Fix
Remove placeholder creation entirely:

```typescript
// DELETE THIS ENTIRE BLOCK (lines ~70-85)
// Users will add whitelists via dashboard when needed
```

---

## 🐛 BUG #3: Missing KB Embed Route

### Problem
**Location**: `salesboy-core/app/api/kb/trigger-embed/route.ts` - **DOES NOT EXIST**

KB page calls this route but it's missing:
```typescript
// dashboard/kb/page.tsx line 95
const res = await fetch('/api/kb/trigger-embed', {
  method: 'POST',
  body: JSON.stringify({ file_id: fileId })
})
```

**Impact**:
- Users can upload files but cannot embed them
- Pinecone remains empty
- RAG pipeline has no context
- AI responses are generic

### Fix
Create `/api/kb/trigger-embed/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/server-auth'
import { generateEmbedding } from '@/lib/embeddings'
import { upsertVectors } from '@/lib/pinecone'
import mammoth from 'mammoth'
import pdfParse from 'pdf-parse'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    if (authError) return authError

    const { userId } = auth!
    const { file_id } = await request.json()

    if (!file_id) {
      return NextResponse.json({ error: 'file_id required' }, { status: 400 })
    }

    // Get file metadata
    const { data: file } = await supabaseAdmin
      .from('knowledge_base')
      .select('*')
      .eq('id', file_id)
      .eq('user_id', userId)
      .single()

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('knowledge-base')
      .download(file.file_path)

    if (downloadError) throw downloadError

    // Extract text based on file type
    const buffer = Buffer.from(await fileData.arrayBuffer())
    let text = ''

    if (file.mime_type === 'application/pdf') {
      const pdfData = await pdfParse(buffer)
      text = pdfData.text
    } else if (file.mime_type?.includes('word')) {
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else {
      text = buffer.toString('utf-8')
    }

    // Chunk text (500 chars per chunk with 50 char overlap)
    const chunks = chunkText(text, 500, 50)

    // Generate embeddings for each chunk
    const vectors = []
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i])
      vectors.push({
        id: `${file_id}_chunk_${i}`,
        values: embedding,
        metadata: {
          text: chunks[i],
          filename: file.filename,
          file_id: file_id,
          chunk_index: i
        }
      })
    }

    // Upsert to Pinecone
    await upsertVectors(userId, vectors)

    // Update KB record
    await supabaseAdmin
      .from('knowledge_base')
      .update({
        status: 'embedded',
        chunks_count: chunks.length
      })
      .eq('id', file_id)

    return NextResponse.json({
      success: true,
      chunks: chunks.length,
      vectors: vectors.length
    })
  } catch (error: any) {
    console.error('Embed error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks = []
  let start = 0
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))
    start += chunkSize - overlap
  }
  
  return chunks
}
```

---

## 🐛 BUG #4: Missing Environment Variables

### Problem
**Location**: `.env.example`

Missing API keys that are actually used:
```bash
# Used in llm-client.ts but not documented
MISTRAL_API_KEY=
GROQ_API_KEY=
```

Documented but NOT used:
```bash
# These are in .env.example but code uses Mistral/Groq instead
GEMINI_API_KEY=
OPENAI_API_KEY=
```

### Fix
Update `.env.example`:

```bash
# LLM Providers (at least one required)
MISTRAL_API_KEY=your_mistral_api_key  # Primary - fast & cheap
GROQ_API_KEY=your_groq_api_key        # Fallback - ultra fast & free

# Legacy (not currently used)
# GEMINI_API_KEY=
# OPENAI_API_KEY=
```

---

## 🐛 BUG #5: Duplicate Middleware Files

### Problem
Two middleware files exist:
- `/salesboy-core/middleware.ts` - Does nothing
- `/salesboy-core/app/middleware.ts` - Also does nothing

### Fix
Delete `/salesboy-core/app/middleware.ts` (wrong location for Next.js 14)

Keep `/salesboy-core/middleware.ts` but it can remain minimal since auth is handled per-route.

---

## 📄 INCOMPLETE: Dashboard Pages

### Status Check Required

Need to review and complete these pages:

1. **`/dashboard/whitelist/page.tsx`**
   - ✅ Exists
   - ❓ Needs testing
   - Required features: Add, list, delete whitelisted numbers

2. **`/dashboard/logs/page.tsx`**
   - ✅ Exists
   - ❓ Needs testing
   - Required features: View chat logs, filter, search

3. **`/dashboard/bot-config/page.tsx`**
   - ✅ Exists
   - ❓ Needs testing
   - Required features: Edit system prompt, temperature, model

4. **`/dashboard/settings/page.tsx`**
   - ✅ Exists
   - ❓ Needs testing
   - Required features: Webhook URL, profile settings

5. **`/dashboard/groups/page.tsx`**
   - ✅ Exists
   - ❓ Needs testing
   - Required features: List WhatsApp groups, toggle auto-reply

**Action**: Review each page, test functionality, fix any bugs

---

## 🔧 IMPLEMENTATION PLAN

### Phase 1: Critical Fixes (2 hours)

**Priority 1: Fix Gateway Session Restore** ⚠️ URGENT
- [ ] SSH to VPS
- [ ] Delete old test sessions: `rm -rf .wwebjs_auth/session-current-user .wwebjs_auth/session-test-user*`
- [ ] Update `session-manager.js` with UUID validation
- [ ] Restart gateway: `pm2 restart salesboy-gateway`
- [ ] Verify: Check PM2 logs for "Skipping invalid session" messages

**Priority 2: Remove Placeholder Whitelist**
- [ ] Edit `/api/auth/on-signup/route.ts`
- [ ] Delete whitelist placeholder creation block
- [ ] Test signup flow

**Priority 3: Create KB Embed Route**
- [ ] Create `/api/kb/trigger-embed/route.ts`
- [ ] Implement text extraction (PDF, DOCX, TXT)
- [ ] Implement chunking logic
- [ ] Implement embedding generation
- [ ] Implement Pinecone upsert
- [ ] Test with sample file

**Priority 4: Fix Environment Variables**
- [ ] Update `.env.example`
- [ ] Document Mistral/Groq keys
- [ ] Remove unused Gemini/OpenAI references

**Priority 5: Remove Duplicate Middleware**
- [ ] Delete `/app/middleware.ts`
- [ ] Keep root `/middleware.ts`

---

### Phase 2: Dashboard Completion (4 hours)

**Review Each Page**:
- [ ] `/dashboard/whitelist/page.tsx` - Test add/delete
- [ ] `/dashboard/logs/page.tsx` - Test filtering
- [ ] `/dashboard/bot-config/page.tsx` - Test config updates
- [ ] `/dashboard/settings/page.tsx` - Test webhook settings
- [ ] `/dashboard/groups/page.tsx` - Test group listing

**For Each Page**:
1. Load page in browser
2. Test all buttons/forms
3. Check API calls in Network tab
4. Fix any errors
5. Verify data persistence

---

### Phase 3: End-to-End Testing (2 hours)

**Test Flow 1: New User Signup**
- [ ] Sign up with new email
- [ ] Verify profile created
- [ ] Verify bot_config created
- [ ] Verify NO placeholder whitelist
- [ ] Login successful

**Test Flow 2: WhatsApp Session**
- [ ] Start session from dashboard
- [ ] Verify QR code appears
- [ ] Scan QR code
- [ ] Verify "Connected" status
- [ ] Disconnect session
- [ ] Verify session stopped

**Test Flow 3: Knowledge Base**
- [ ] Upload PDF file
- [ ] Click "Embed" button
- [ ] Verify embedding logs appear
- [ ] Check Pinecone dashboard for vectors
- [ ] Verify file status = "embedded"

**Test Flow 4: WhatsApp Message**
- [ ] Send message to connected WhatsApp
- [ ] Check gateway logs for message received
- [ ] Check core logs for webhook processing
- [ ] Verify AI response sent back
- [ ] Check chat_logs table for records

**Test Flow 5: Whitelist**
- [ ] Add phone number to whitelist
- [ ] Send message from whitelisted number
- [ ] Verify message is ignored
- [ ] Remove from whitelist
- [ ] Verify message is processed

---

### Phase 4: Documentation (2 hours)

**Update Documentation**:
- [ ] Update README.md with current status
- [ ] Create USER_GUIDE.md
- [ ] Document all API endpoints
- [ ] Create DEPLOYMENT.md
- [ ] Update MILESTONES.md

**Create User Guide**:
- [ ] How to sign up
- [ ] How to connect WhatsApp
- [ ] How to upload knowledge base
- [ ] How to manage whitelists
- [ ] How to configure bot
- [ ] Troubleshooting section

---

## ✅ SUCCESS CRITERIA

### Gateway
- ✅ No auto-restore of invalid sessions
- ✅ Only UUID-format sessions restored
- ✅ VPS CPU/memory normal
- ✅ PM2 logs clean

### Authentication
- ✅ Signup creates profile + bot_config only
- ✅ No placeholder data created
- ✅ Login/logout works
- ✅ Session persists across refreshes

### Knowledge Base
- ✅ Upload works
- ✅ Embed works
- ✅ Vectors appear in Pinecone
- ✅ RAG retrieves context
- ✅ AI uses context in responses

### Dashboard
- ✅ All 7 pages load without errors
- ✅ All forms submit successfully
- ✅ All data displays correctly
- ✅ Mobile responsive

### End-to-End
- ✅ WhatsApp message → AI response works
- ✅ Whitelist filtering works
- ✅ Chat logs recorded
- ✅ Bot config applied

---

## 🚀 DEPLOYMENT CHECKLIST

After all fixes:

**VPS (Gateway)**
- [ ] Pull latest code
- [ ] Install dependencies
- [ ] Update .env
- [ ] Restart PM2
- [ ] Check logs

**Vercel (Core)**
- [ ] Push to GitHub
- [ ] Verify build succeeds
- [ ] Check environment variables
- [ ] Test production URL

**Database**
- [ ] Run any new migrations
- [ ] Verify RLS policies
- [ ] Check storage buckets

**Monitoring**
- [ ] Check error logs
- [ ] Monitor API response times
- [ ] Verify webhook delivery
- [ ] Check Pinecone usage

---

## 📊 ESTIMATED TIMELINE

| Phase | Tasks | Time |
|-------|-------|------|
| Phase 1: Critical Fixes | 5 bugs | 2 hours |
| Phase 2: Dashboard | 5 pages | 4 hours |
| Phase 3: Testing | 5 flows | 2 hours |
| Phase 4: Documentation | 4 docs | 2 hours |
| **TOTAL** | | **10 hours** |

---

## 🎯 PRIORITY ORDER

1. **URGENT**: Fix gateway session restore (VPS slowdown)
2. **HIGH**: Create KB embed route (core feature broken)
3. **HIGH**: Remove placeholder whitelist (data integrity)
4. **MEDIUM**: Complete dashboard pages (UX)
5. **MEDIUM**: Update documentation (usability)
6. **LOW**: Clean up environment variables (maintenance)

---

## 📝 NOTES

- All fixes are backward compatible
- No database migrations required
- No breaking changes to API
- Can be deployed incrementally
- Gateway fix should be deployed FIRST

---

**Ready to execute?** Start with Phase 1, Priority 1 (Gateway fix) immediately.
