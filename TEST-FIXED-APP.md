# Testing the Fixed App

## What Changed
All hardcoded user ID references have been removed. The app now works without forcing data through a single test user.

## How to Test

### 1. Verify Build
```bash
cd /workspaces/Salesboy/salesboy-core
npm run build
```
✓ Should complete successfully with no TypeScript errors

### 2. Start Dev Server
```bash
npm run dev
```
Visit: http://localhost:3000

### 3. Test API Routes Directly

**Upload a Knowledge Base File**
```bash
curl -X POST http://localhost:3000/api/kb/upload \
  -F "file=@yourfile.pdf"
```

**List All Files** (no user filtering)
```bash
curl http://localhost:3000/api/kb/list
```

**Get Bot Config** (returns first config, no user filter)
```bash
curl http://localhost:3000/api/bot-config
```

**Get Chat Logs** (all logs)
```bash
curl http://localhost:3000/api/logs
```

**Get Whitelists** (all whitelists)
```bash
curl http://localhost:3000/api/whitelist
```

**Get Profile** (first profile)
```bash
curl http://localhost:3000/api/profile
```

**Get Stats**
```bash
curl http://localhost:3000/api/stats
```

### 4. Test with User Parameter (for groups)
```bash
curl http://localhost:3000/api/groups
curl http://localhost:3000/api/groups?user_id=my-user-id
curl http://localhost:3000/api/sessions/status?user_id=my-user-id
```

### 5. Verify Database Behavior
After deleting all users in Supabase:
- Files list should be empty OR show files with `user_id = null`
- Bot config should be empty
- Whitelists should be empty
- But the app should NOT crash - just return empty arrays

## Expected Behavior Changes

### Before Fix
- Only showed data for user `00000000-0000-0000-0000-000000000001`
- Deleted test user = broken app
- All new uploads forced to that user

### After Fix
- Shows ALL data in database (no user filtering)
- Works with any/no users
- Prepared for future multi-user support
- Each insert uses `user_id: null` (compatible with auth)

## Future Auth Integration
When you add authentication:
1. Extract `user_id` from JWT token
2. Update middleware to set `request.user = { id: extractedUserId }`
3. Modify API routes to use this user_id in queries
4. Change `.limit(1)` back to `.eq('user_id', userId)`

No major refactoring needed - just add user_id extraction to existing code.
