-- Make bit-photos bucket public so photos can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'bit-photos';