Immediate recommendations (prioritized)

Fix HMAC signing in gateway — replace 'temp-signature' with a real HMAC:
Use same HMAC_SECRET used by core; header name should match core validation (e.g., x-signature with sha256=<hex>).
Ensure payload canonicalization before signing (stringify with stable ordering).
Harden encryption key usage — stop deriving AES key from API_SECRET_KEY.slice(0,32):
Use a dedicated ENCRYPTION_KEY env var (32 bytes base64) or derive via KDF (HKDF) and ensure rotation path.
Make env dependencies explicit — fail fast with clear error messages when required env vars are missing (Pinecone, Supabase service key, HMAC_SECRET, PINECONE_INDEX_NAME).
Replace local embedding or gate it behind config — allow switching between local deterministic embedding (dev) and real embedding provider (OpenAI/Palm) for production.
Add strong null checks around supabaseAdmin and other clients — return meaningful 5xx with logs when service-role client missing.
Implement tests / CI for critical paths — gateway session lifecycle, webhook HMAC validation, KB processing, RAG pipeline.
Secrets & policies — verify all RLS policies in SQL files and ensure supabaseAdmin is used only server-side.
Remove dev defaults — remove userId = 'current-user' in production code or gate it behind dev flag.
Next steps I can take for you (pick one or more)

A. Implement HMAC signing in session-manager.js and corresponding validation in the core (I can patch both and run unit tests).
B. Replace the AES key handling: introduce ENCRYPTION_KEY env var and update encryption.ts.
C. Add runtime env validation at startup (fail fast with clear message when required env missing).
D. Build out kb/embed route to produce embeddings and upsert into Pinecone (if you want KB to be usable).
E. Run the repo's test scripts and report failures & quick fixes (there are test files like test-api.js, test-integration.js).
Which of these should I do next? I can start by implementing (A) HMAC signing in the gateway and its validation in the core — that fixes the core security gap and enables secure webhook traffic.

Claude Haiku 4.5 • 1x
