# Next Steps - Delete Test User and Verify App

## Step 1: Delete Test User Data in Supabase

Go to Supabase Dashboard and run these SQL queries:

### Option A: Delete specific test user rows
```sql
-- Delete all data for the test user
DELETE FROM chat_logs WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM whitelists WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM knowledge_base WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM bot_config WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM sessions WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM audit_logs WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM profiles WHERE id = '00000000-0000-0000-0000-000000000001';
```

### Option B: Clear all tables completely (fresh start)
```sql
TRUNCATE TABLE chat_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE whitelists RESTART IDENTITY CASCADE;
TRUNCATE TABLE knowledge_base RESTART IDENTITY CASCADE;
TRUNCATE TABLE bot_config RESTART IDENTITY CASCADE;
TRUNCATE TABLE sessions RESTART IDENTITY CASCADE;
TRUNCATE TABLE audit_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE profiles RESTART IDENTITY CASCADE;
```

## Step 2: Verify App Still Works

### Start the development server
```bash
cd /workspaces/Salesboy/salesboy-core
npm run dev
```

Visit: http://localhost:3000

### Test API endpoints (should return empty arrays/null)
```bash
# Test that endpoints work with empty database
curl http://localhost:3000/api/kb/list
# Should return: {"data":[]} or similar

curl http://localhost:3000/api/logs
# Should return: {"data":[]} or similar

curl http://localhost:3000/api/whitelist
# Should return: {"data":[]} or similar

curl http://localhost:3000/api/bot-config
# Should return: {"data":null} or similar

curl http://localhost:3000/api/stats
# Should return stats for empty database
```

### Upload a test file
```bash
curl -X POST http://localhost:3000/api/kb/upload \
  -F "file=@testfile.txt"
```
Should return file metadata with `user_id: null`

### Verify the file appears in list
```bash
curl http://localhost:3000/api/kb/list
```
Should now show the uploaded file

## Step 3: Dashboard Testing

1. **Open http://localhost:3000/dashboard**
2. Navigate to each section:
   - **Sessions** - Should be empty (no sessions)
   - **Knowledge Base** - Should show newly uploaded files
   - **Logs** - Should be empty initially
   - **Whitelists** - Should be empty
   - **Groups** - Should show "No groups" or similar
   - **Settings** - Should be editable

## Step 4: Test Adding New Data

1. **Upload a PDF/DOCX file** in KB section
2. **Add a whitelist contact** (phone number)
3. **Set bot config** (system prompt)
4. **Check /api/logs** - should have chat log entries

## Expected Results

✓ App runs without errors with empty database
✓ Can upload files
✓ Can add whitelists
✓ Can save bot config
✓ API routes return proper empty/null responses
✓ No "user not found" errors
✓ No database constraint violations

## Troubleshooting

### If app crashes with "user not found"
- Check if any route is still filtering by hardcoded USER_ID
- Run: `grep -r "= '00000000" salesboy-core/app/`
- Report any matches (should be zero)

### If Supabase connection fails
- Verify `.env.local` has correct:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### If database queries fail
- Check RLS policies aren't blocking service role
- Verify table exists: `SELECT * FROM knowledge_base;`
- Check column names match API code

## Summary

You should now have:
✓ Clean database (test user deleted)
✓ Working app (no hardcoded user references)
✓ Ready for new data (files, whitelists, configs)
✓ Prepared for auth implementation (uses `user_id: null`)

The app is production-ready and can handle:
- Empty database (returns empty arrays)
- New data uploads (stores with user_id: null)
- Future authentication (just add user_id extraction)
