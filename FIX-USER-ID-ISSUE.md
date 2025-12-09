# 🔴 CRITICAL: Hardcoded USER_ID Issue

## Problem Discovered

ALL API routes use a hardcoded test USER_ID:
```typescript
const USER_ID = '00000000-0000-0000-0000-000000000001'
```

## Affected Files:
- `app/api/kb/list/route.ts` - Only shows files for test user
- `app/api/kb/upload/route.ts` - Uploads to test user
- `app/api/kb/delete/route.ts` - Deletes from test user
- `app/api/profile/route.ts`
- `app/api/stats/route.ts`
- `app/api/whitelist/route.ts`
- `app/api/bot-config/route.ts`
- `app/api/logs/route.ts`
- `app/api/settings/webhooks/route.ts`

## Why This Happens

The app was built for multi-user but authentication wasn't implemented yet. The hardcoded USER_ID is a placeholder for development.

## Impact

1. ❌ All users see the same data
2. ❌ No user isolation
3. ❌ Files appear/disappear based on test user's data
4. ❌ Not production-ready for multiple users

## Immediate Fix (Single User Mode)

Since you're the only user, ensure all your files use the hardcoded USER_ID:

```sql
-- Run in Supabase SQL Editor

-- Check current user_ids
SELECT DISTINCT user_id, COUNT(*) as file_count
FROM knowledge_base
GROUP BY user_id;

-- If you have files with different user_ids, update them:
UPDATE knowledge_base 
SET user_id = '00000000-0000-0000-0000-000000000001'
WHERE user_id IS NULL OR user_id != '00000000-0000-0000-0000-000000000001';

-- Verify
SELECT id, user_id, filename, status 
FROM knowledge_base 
ORDER BY created_at DESC;
```

## Proper Fix (Multi-User Support)

Implement Supabase Auth:

1. **Add auth to middleware:**
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  return res
}
```

2. **Get user ID from session in API routes:**
```typescript
// Instead of:
const USER_ID = '00000000-0000-0000-0000-000000000001'

// Use:
const { data: { session } } = await supabase.auth.getSession()
const userId = session?.user?.id
```

3. **Implement login/signup pages** (already exist but not functional)

## Current Workaround

For single-user production use:

1. ✅ Keep using the hardcoded USER_ID
2. ✅ Ensure all data uses this ID
3. ✅ Add password protection at infrastructure level (nginx, Vercel password protection)
4. ⏳ Plan to implement proper auth in Milestone 4

## Check Your Data

Run this SQL to see what's happening:

```sql
-- See all files and their user_ids
SELECT 
  id,
  user_id,
  filename,
  status,
  chunks_count,
  created_at
FROM knowledge_base 
ORDER BY created_at DESC;

-- Count files per user
SELECT 
  user_id,
  COUNT(*) as total_files,
  SUM(CASE WHEN status = 'embedded' THEN 1 ELSE 0 END) as embedded_files
FROM knowledge_base 
GROUP BY user_id;
```

## Why Files "Reset"

They don't actually reset. The API only shows files where:
```sql
user_id = '00000000-0000-0000-0000-000000000001'
```

If your files have a different `user_id`, they won't show up!

## Action Required

1. Run the SQL check above
2. Update all files to use the hardcoded USER_ID
3. Plan for proper auth implementation

---

**This is a known limitation for MVP. Full auth coming in Milestone 4.**
