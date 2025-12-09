-- Fix chunks_count for ADEOLABUSINESS.pdf
-- Run this in Supabase SQL Editor

UPDATE knowledge_base 
SET chunks_count = 6
WHERE filename = 'ADEOLABUSINESS.pdf';

-- Verify
SELECT id, filename, status, chunks_count 
FROM knowledge_base 
WHERE filename = 'ADEOLABUSINESS.pdf';
