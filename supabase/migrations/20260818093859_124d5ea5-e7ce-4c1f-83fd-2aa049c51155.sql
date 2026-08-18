CREATE TABLE IF NOT EXISTS public.ai_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  feature text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ai_usage TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
ON public.ai_usage FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage"
ON public.ai_usage FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS ai_usage_user_created_idx ON public.ai_usage (user_id, created_at DESC);

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE lower(email) = 'pratyush3604@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

DELETE FROM public.user_roles ur
WHERE ur.role = 'admin'
  AND ur.user_id NOT IN (SELECT id FROM auth.users WHERE lower(email) = 'pratyush3604@gmail.com');