# Get Free Voyage AI API Key

## Quick Setup (2 minutes)

### 1. Go to Voyage AI
https://www.voyageai.com/

### 2. Sign Up (Free)
- Click "Get Started" or "Sign Up"
- Use your email
- Verify email

### 3. Get API Key
- Go to Dashboard
- Click "API Keys"
- Click "Create New Key"
- Copy the key (starts with `pa-...`)

### 4. Add to Vercel
Go to: https://vercel.com/dashboard
- Select your project
- Go to Settings → Environment Variables
- Add new variable:
  - Name: `VOYAGE_API_KEY`
  - Value: `pa-your-key-here`
- Click "Save"
- Redeploy

## Alternative: Use Gemini Only

If you don't want to get Voyage API key, the system will automatically fall back to Gemini (which you already have configured).

Gemini produces 768-dimensional embeddings which will be padded to 1536 dimensions with zeros.

## Current Fallback Chain

1. **Voyage AI** (1536 dims) - Primary, free
2. **Gemini** (768 dims → padded to 1536) - Fallback, already configured

Both will work with your Pinecone index!

## For Now

The system will use Gemini automatically since Voyage key is not configured yet. This will work fine!
