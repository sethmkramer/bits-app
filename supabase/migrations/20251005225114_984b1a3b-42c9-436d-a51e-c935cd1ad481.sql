-- Create storage bucket for child photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('child-photos', 'child-photos', true);

-- Create storage policies for child photos
CREATE POLICY "Users can view child photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'child-photos');

CREATE POLICY "Users can upload their own child photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'child-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own child photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'child-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own child photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'child-photos' AND auth.uid()::text = (storage.foldername(name))[1]);