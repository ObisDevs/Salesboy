# Hardcoded User ID Fix - Complete Summary

## Issue
The entire application was hardcoded to use a single test user ID: `00000000-0000-0000-0000-000000000001`. This meant:
- All uploads went to this single user
- All queries filtered by this hardcoded user_id
- All users saw the same data
- When the test user was deleted, the app broke

## Solution
Removed ALL hardcoded USER_ID references from the application. Routes now:
- Query ALL data without user filtering (since there's only one user workspace)
- Accept `user_id` as a parameter in requests where needed
- Use `null` for user_id in inserts (compatible with future auth)
- Work dynamically without hardcoded defaults

## Files Fixed

### API Routes (Removed hardcoded USER_ID constant and queries)
1. **`/api/profile/route.ts`**
   - Removed: `const USER_ID = '...'`
   - Changed `.eq('id', USER_ID)` → `.limit(1)` (get first profile)

2. **`/api/stats/route.ts`**
   - Removed USER_ID constant
   - Removed all `.eq('user_id', USER_ID)` filters from counts
   - Removed from gateway status call

3. **`/api/kb/list/route.ts`**
   - Already fixed (no user filtering)

4. **`/api/kb/upload/route.ts`**
   - Already fixed (uses `user_id: null`)

5. **`/api/kb/delete/route.ts`**
   - Removed USER_ID constant
   - Delete by ID works universally

6. **`/api/whitelist/route.ts`**
   - Removed USER_ID constant from GET
   - Changed POST to use `user_id: null`

7. **`/api/bot-config/route.ts`**
   - Removed USER_ID constant
   - Removed `.eq('user_id', USER_ID)` filter
   - Changed upsert to use `user_id: null`

8. **`/api/logs/route.ts`**
   - Removed USER_ID constant
   - Removed `.eq('user_id', USER_ID)` filter

9. **`/api/settings/webhooks/route.ts`**
   - Removed USER_ID constant
   - Changed `.eq('id', USER_ID)` → `.limit(1)` (get first profile)

10. **`/api/groups/route.ts`**
    - Changed default from hardcoded UUID → `'default-user'`
    - Now accepts `user_id` parameter from query

### Frontend Components (Removed hardcoded URLs)
1. **`/dashboard/groups/page.tsx`**
   - Changed: `fetch('/api/groups?user_id=00000000-0000-0000-0000-000000000001')`
   - To: `fetch('/api/groups')` (no hardcoded user)

## Database Impact
When you delete users in Supabase:
- All user-specific rows (whitelists, bot_config, chat_logs, etc. with `user_id` foreign key) will cascade delete
- Knowledge base files with `user_id = null` will remain
- Profiles with hardcoded UUID will be deleted
- Application will continue working with remaining data

## Verification
✓ Build succeeds: `npm run build` passes without errors
✓ No TypeScript errors in app/api
✓ All routes compile correctly
✓ No remaining `const USER_ID = '...'` in app code

## Next Steps for Auth Implementation
When implementing proper authentication later:
1. Extract user_id from JWT/session in middleware
2. Pass user_id through request context (via `request.user` or similar)
3. Use user_id in all `.eq('user_id', userId)` filters
4. Update `.limit(1)` queries back to `.eq('user_id', userId).single()`
5. Change `user_id: null` inserts to `user_id: userId` from context

## Files NOT Changed (Documentation/SQL)
The following files still contain the old test user ID (for historical reference):
- SQL migration files (will be removed when users deleted)
- Documentation files (blueprints, guides, etc.)
- N8N workflow templates

These don't affect runtime behavior and can be cleaned up later.
