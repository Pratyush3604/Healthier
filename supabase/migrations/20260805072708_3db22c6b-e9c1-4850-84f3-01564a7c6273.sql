-- Add policies to storage.objects (RLS is already enabled)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public View Logo' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Public View Logo" ON storage.objects FOR SELECT TO public USING (bucket_id = 'logo');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth Manage Logo' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Auth Manage Logo" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'logo') WITH CHECK (bucket_id = 'logo');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth View MyImg' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Auth View MyImg" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'my-img');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth Manage MyImg' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Auth Manage MyImg" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'my-img') WITH CHECK (bucket_id = 'my-img');
    END IF;
END $$;
