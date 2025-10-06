-- Make photo buckets private for better security
UPDATE storage.buckets 
SET public = false 
WHERE id IN ('child-photos', 'bit-photos');