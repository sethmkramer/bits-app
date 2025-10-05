-- Create RLS policies for bit-photos bucket
CREATE POLICY "Users can view their own bit photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'bit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own bit photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'bit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own bit photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'bit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own bit photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'bit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);