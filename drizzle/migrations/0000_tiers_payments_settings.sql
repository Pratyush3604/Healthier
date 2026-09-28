ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier_expires_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bonus_uses integer NOT NULL DEFAULT 0;

-- Only admins (or the backend) may change plan fields.
CREATE OR REPLACE FUNCTION public.protect_profile_tier()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (NEW.tier IS DISTINCT FROM OLD.tier OR NEW.tier_expires_at IS DISTINCT FROM OLD.tier_expires_at OR NEW.bonus_uses IS DISTINCT FROM OLD.bonus_uses)
     AND auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Plan fields can only be changed by the owner';
  END IF;
  IF NEW.tier NOT IN ('free','pro','pro_max') THEN
    RAISE EXCEPTION 'Invalid tier';
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.protect_profile_tier() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER protect_profile_tier BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_tier();

CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan text NOT NULL CHECK (plan IN ('pro_monthly','pro_yearly','pro_max_monthly','pro_max_yearly')),
  amount_inr integer NOT NULL,
  utr_number text NOT NULL UNIQUE CHECK (utr_number ~ '^[0-9]{12}$'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.payment_requests TO authenticated;
GRANT ALL ON public.payment_requests TO service_role;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own payments" ON public.payment_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users submit own pending payments" ON public.payment_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admins review payments" ON public.payment_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Server decides the price, not the browser.
CREATE OR REPLACE FUNCTION public.set_payment_amount()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.amount_inr := CASE NEW.plan WHEN 'pro_monthly' THEN 100 WHEN 'pro_yearly' THEN 1000 WHEN 'pro_max_monthly' THEN 500 ELSE 5000 END;
  RETURN NEW;
END; $$;
CREATE TRIGGER set_payment_amount BEFORE INSERT ON public.payment_requests FOR EACH ROW EXECUTE FUNCTION public.set_payment_amount();

CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins write settings" ON public.app_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
