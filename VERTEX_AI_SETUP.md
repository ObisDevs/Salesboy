# Vertex AI Setup Guide

## Why Vertex AI?
- ✅ More reliable than free Gemini API
- ✅ Higher quotas and rate limits
- ✅ Production-ready with service account auth
- ✅ No API key leaks (uses service account JSON)

## Setup Steps

### 1. Create Google Cloud Project
1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Note your **Project ID** (e.g., `salesboy-ai-123456`)

### 2. Enable Vertex AI API
1. Go to: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com
2. Click **Enable**
3. Wait for activation (~1 minute)

### 3. Create Service Account
1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click **Create Service Account**
3. Name: `salesboy-vertex-ai`
4. Click **Create and Continue**
5. Grant role: **Vertex AI User**
6. Click **Done**

### 4. Create & Download JSON Key
1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON** format
5. Click **Create** (file downloads automatically)
6. Save as: `vertex-ai-key.json`

### 5. Add to Vercel

**Option A: Base64 Encode (Recommended for Vercel)**
```bash
# On Mac/Linux
base64 -i vertex-ai-key.json | tr -d '\n' > vertex-key-base64.txt

# On Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("vertex-ai-key.json")) | Out-File vertex-key-base64.txt
```

Then in Vercel, add:
```
VERTEX_PROJECT_ID=your-project-id
VERTEX_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS_BASE64=<paste base64 content>
```

**Option B: Direct JSON (Alternative)**
```
VERTEX_PROJECT_ID=your-project-id
VERTEX_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"..."}
```

### 6. Update Code to Handle Base64
The code will automatically detect and decode base64 credentials.

## Environment Variables

Add these to Vercel:
```env
VERTEX_PROJECT_ID=your-gcp-project-id
VERTEX_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS_BASE64=<base64_encoded_json_key>
```

## Regions Available
- `us-central1` (Iowa) - Recommended
- `us-east4` (Virginia)
- `europe-west4` (Netherlands)
- `asia-southeast1` (Singapore)

## Cost
- Gemini 1.5 Flash: $0.00001875 per 1K chars input, $0.000075 per 1K chars output
- Very cheap for production use (~$0.01 per 1000 messages)

## Testing Locally

1. Set environment variables in `.env.local`:
```env
VERTEX_PROJECT_ID=your-project-id
VERTEX_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/vertex-ai-key.json
```

2. Test:
```bash
npm run dev
```

## Priority Order (After Setup)
1. ✅ Vertex AI (Most reliable)
2. Mistral (Fast & cheap)
3. Gemini Free API (Fallback)
4. OpenAI (Last resort)
