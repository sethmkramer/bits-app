-- Make child-photos bucket public so photos can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'child-photos';