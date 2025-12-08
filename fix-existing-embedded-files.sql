-- Fix status for files that were embedded but status wasn't updated
-- Run this in Supabase SQL Editor

-- Update ADEOLABUSINESS.pdf to embedded status
UPDATE knowledge_base 
SET status = 'embedded'
WHERE filename = 'ADEOLABUSINESS.pdf' 
AND status != 'embedded';

-- Or update ALL files that have vectors in Pinecone but status is not embedded
-- (This assumes if chunks_count > 0, it was embedded)
UPDATE knowledge_base 
SET status = 'embedded'
WHERE chunks_count > 0 
AND status != 'embedded';

-- Verify the update
SELECT id, filename, status, chunks_count, created_at 
FROM knowledge_base 
ORDER BY created_at DESC;
