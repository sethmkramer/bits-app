-- Fix storage security issues

-- 1. Fix child-photos SELECT policy to require authenticated user-scoped access
DROP POLICY IF EXISTS "Users can view own child photos" ON storage.objects;
CREATE POLICY "Users can view own child photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'child-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2. Update bit-photos policies to use authenticated role instead of public
DROP POLICY IF EXISTS "Users can upload own bit photos" ON storage.objects;
CREATE POLICY "Users can upload own bit photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update own bit photos" ON storage.objects;
CREATE POLICY "Users can update own bit photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'bit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own bit photos" ON storage.objects;
CREATE POLICY "Users can delete own bit photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'bit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Update child-photos policies to use authenticated role instead of public
DROP POLICY IF EXISTS "Users can upload own child photos" ON storage.objects;
CREATE POLICY "Users can upload own child photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'child-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update own child photos" ON storage.objects;
CREATE POLICY "Users can update own child photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'child-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own child photos" ON storage.objects;
CREATE POLICY "Users can delete own child photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'child-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Fix update_updated_at_column function to include search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;