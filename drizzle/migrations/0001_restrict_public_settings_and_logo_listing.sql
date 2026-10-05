DROP POLICY IF EXISTS "Anyone reads settings" ON public.app_settings;
CREATE POLICY "Anyone reads public settings" ON public.app_settings
  FOR SELECT TO anon, authenticated
  USING (key IN ('upi_id', 'announcement'));

DROP POLICY IF EXISTS "Public View Logo" ON storage.objects;