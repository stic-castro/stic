-- Supabase SQL Editor script for STIC.
-- Auth users live in auth.users. Application roles/profile data live in public.profiles.
-- Non-destructive: this does not drop existing tables or delete data.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'mechanic', 'trainee')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  plate TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (payment_status IN ('pending_payment', 'paid')),
  mechanic_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  mechanic_review_rating INT CHECK (mechanic_review_rating BETWEEN 1 AND 5),
  mechanic_review_comment TEXT,
  mechanic_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (ended_at IS NULL OR ended_at > started_at)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ NOT NULL,
  checked_out_at TIMESTAMPTZ,
  checked_in_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  checked_out_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (checked_out_at IS NULL OR checked_out_at > checked_in_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS time_entries_one_open_per_user
  ON public.time_entries (user_id)
  WHERE checked_out_at IS NULL;

CREATE TABLE IF NOT EXISTS public.quotation_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  density DOUBLE PRECISION NOT NULL,
  price_per_kg DOUBLE PRECISION NOT NULL,
  price_per_hour_machine DOUBLE PRECISION NOT NULL,
  price_per_hour_operator DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.spacer_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  bolt_count INT NOT NULL,
  bolt_pattern DOUBLE PRECISION NOT NULL,
  thickness_mm DOUBLE PRECISION NOT NULL,
  center_bore DOUBLE PRECISION NOT NULL,
  is_hub_centric BOOLEAN NOT NULL DEFAULT FALSE,
  material_id UUID NOT NULL REFERENCES public.quotation_materials(id),
  price DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pulley_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outer_diameter DOUBLE PRECISION NOT NULL,
  inner_bore_diameter DOUBLE PRECISION NOT NULL,
  width DOUBLE PRECISION NOT NULL,
  groove_count INT NOT NULL,
  groove_type TEXT NOT NULL,
  material_id UUID NOT NULL REFERENCES public.quotation_materials(id),
  price DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gear_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teeth_count INT NOT NULL,
  module DOUBLE PRECISION NOT NULL,
  pitch_diameter DOUBLE PRECISION NOT NULL,
  outer_diameter DOUBLE PRECISION NOT NULL,
  width DOUBLE PRECISION NOT NULL,
  tooth_height DOUBLE PRECISION NOT NULL,
  gear_type TEXT NOT NULL,
  material_id UUID NOT NULL REFERENCES public.quotation_materials(id),
  price DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cars_user_id_idx ON public.cars(user_id);
CREATE INDEX IF NOT EXISTS jobs_car_id_idx ON public.jobs(car_id);
CREATE INDEX IF NOT EXISTS jobs_mechanic_id_idx ON public.jobs(mechanic_id);
CREATE INDEX IF NOT EXISTS progress_logs_job_id_idx ON public.progress_logs(job_id);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_job_id_idx ON public.notifications(job_id);
CREATE INDEX IF NOT EXISTS time_entries_user_id_idx ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS spacer_quotations_material_id_idx ON public.spacer_quotations(material_id);
CREATE INDEX IF NOT EXISTS pulley_quotations_material_id_idx ON public.pulley_quotations(material_id);
CREATE INDEX IF NOT EXISTS gear_quotations_material_id_idx ON public.gear_quotations(material_id);

CREATE OR REPLACE FUNCTION public.current_profile_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role() = 'admin', FALSE)
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role() IN ('admin', 'mechanic', 'trainee'), FALSE)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), split_part(COALESCE(NEW.email, ''), '@', 1), 'New user'),
    COALESCE(NEW.email, ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone', ''), NEW.phone, ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

CREATE OR REPLACE FUNCTION public.prevent_forbidden_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can update roles';
  END IF;

  IF auth.uid() = OLD.id AND OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'Admins cannot change their own role from this page';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_forbidden_update ON public.profiles;
CREATE TRIGGER profiles_prevent_forbidden_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_forbidden_profile_update();

CREATE OR REPLACE FUNCTION public.prevent_forbidden_job_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role TEXT := public.current_profile_role();
  owner_id UUID;
BEGIN
  SELECT c.user_id INTO owner_id FROM public.cars c WHERE c.id = OLD.car_id;

  IF current_role = 'admin' THEN
    RETURN NEW;
  END IF;

  IF current_role = 'mechanic' AND auth.uid() = OLD.mechanic_id THEN
    IF NEW.description IS DISTINCT FROM OLD.description
      OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
      OR NEW.mechanic_id IS DISTINCT FROM OLD.mechanic_id
      OR NEW.car_id IS DISTINCT FROM OLD.car_id
      OR NEW.mechanic_review_rating IS DISTINCT FROM OLD.mechanic_review_rating
      OR NEW.mechanic_review_comment IS DISTINCT FROM OLD.mechanic_review_comment
      OR NEW.mechanic_reviewed_at IS DISTINCT FROM OLD.mechanic_reviewed_at
    THEN
      RAISE EXCEPTION 'Mechanics can only update assigned job status';
    END IF;
    RETURN NEW;
  END IF;

  IF current_role = 'user' AND auth.uid() = owner_id THEN
    IF OLD.status <> 'completed' THEN
      RAISE EXCEPTION 'Reviews can only be added after the job is completed';
    END IF;

    IF NEW.description IS DISTINCT FROM OLD.description
      OR NEW.status IS DISTINCT FROM OLD.status
      OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
      OR NEW.mechanic_id IS DISTINCT FROM OLD.mechanic_id
      OR NEW.car_id IS DISTINCT FROM OLD.car_id
    THEN
      RAISE EXCEPTION 'Users can only update their own review fields';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Not authorized to update this job';
END;
$$;

DROP TRIGGER IF EXISTS jobs_prevent_forbidden_update ON public.jobs;
CREATE TRIGGER jobs_prevent_forbidden_update
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_forbidden_job_update();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spacer_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulley_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gear_quotations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin() OR public.current_profile_role() IN ('mechanic', 'trainee'));

DROP POLICY IF EXISTS profiles_insert ON public.profiles;
CREATE POLICY profiles_insert ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() AND role = 'user');

DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS cars_select ON public.cars;
CREATE POLICY cars_select ON public.cars FOR SELECT TO authenticated
  USING (public.is_staff() OR user_id = auth.uid());

DROP POLICY IF EXISTS cars_insert ON public.cars;
CREATE POLICY cars_insert ON public.cars FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR (
      public.current_profile_role() IN ('admin', 'mechanic')
      AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_id AND p.role = 'user')
    )
  );

DROP POLICY IF EXISTS cars_update ON public.cars;
CREATE POLICY cars_update ON public.cars FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS jobs_select ON public.jobs;
CREATE POLICY jobs_select ON public.jobs FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR mechanic_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.cars c WHERE c.id = car_id AND c.user_id = auth.uid())
  );

DROP POLICY IF EXISTS jobs_insert ON public.jobs;
CREATE POLICY jobs_insert ON public.jobs FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR (public.current_profile_role() = 'mechanic' AND mechanic_id = auth.uid()));

DROP POLICY IF EXISTS jobs_update ON public.jobs;
CREATE POLICY jobs_update ON public.jobs FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR mechanic_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.cars c WHERE c.id = car_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    public.is_admin()
    OR mechanic_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.cars c WHERE c.id = car_id AND c.user_id = auth.uid())
  );

DROP POLICY IF EXISTS progress_logs_select ON public.progress_logs;
CREATE POLICY progress_logs_select ON public.progress_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.cars c ON c.id = j.car_id
      WHERE j.id = job_id
        AND (public.is_admin() OR j.mechanic_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS progress_logs_insert ON public.progress_logs;
CREATE POLICY progress_logs_insert ON public.progress_logs FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id
        AND (public.is_admin() OR (public.current_profile_role() = 'mechanic' AND j.mechanic_id = auth.uid()))
    )
  );

DROP POLICY IF EXISTS progress_logs_update ON public.progress_logs;
CREATE POLICY progress_logs_update ON public.progress_logs FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS notifications_select ON public.notifications;
CREATE POLICY notifications_select ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS notifications_insert ON public.notifications;
CREATE POLICY notifications_insert ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS notifications_update ON public.notifications;
CREATE POLICY notifications_update ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS time_entries_select ON public.time_entries;
CREATE POLICY time_entries_select ON public.time_entries FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR user_id = auth.uid()
    OR (
      public.current_profile_role() = 'mechanic'
      AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_id AND p.role = 'trainee')
    )
  );

DROP POLICY IF EXISTS time_entries_insert ON public.time_entries;
CREATE POLICY time_entries_insert ON public.time_entries FOR INSERT TO authenticated
  WITH CHECK (
    checked_in_by = auth.uid()
    AND (
      public.is_admin()
      OR (
        public.current_profile_role() = 'mechanic'
        AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_id AND p.role = 'trainee')
      )
    )
  );

DROP POLICY IF EXISTS time_entries_update ON public.time_entries;
CREATE POLICY time_entries_update ON public.time_entries FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR (
      public.current_profile_role() = 'mechanic'
      AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_id AND p.role = 'trainee')
    )
  )
  WITH CHECK (
    checked_out_by = auth.uid()
    AND (
      public.is_admin()
      OR (
        public.current_profile_role() = 'mechanic'
        AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_id AND p.role = 'trainee')
      )
    )
  );

DROP POLICY IF EXISTS quotation_materials_select ON public.quotation_materials;
CREATE POLICY quotation_materials_select ON public.quotation_materials FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS quotation_materials_insert ON public.quotation_materials;
CREATE POLICY quotation_materials_insert ON public.quotation_materials FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS spacer_quotations_select ON public.spacer_quotations;
CREATE POLICY spacer_quotations_select ON public.spacer_quotations FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS spacer_quotations_insert ON public.spacer_quotations;
CREATE POLICY spacer_quotations_insert ON public.spacer_quotations FOR INSERT TO anon, authenticated WITH CHECK (TRUE);

DROP POLICY IF EXISTS pulley_quotations_select ON public.pulley_quotations;
CREATE POLICY pulley_quotations_select ON public.pulley_quotations FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS pulley_quotations_insert ON public.pulley_quotations;
CREATE POLICY pulley_quotations_insert ON public.pulley_quotations FOR INSERT TO anon, authenticated WITH CHECK (TRUE);

DROP POLICY IF EXISTS gear_quotations_select ON public.gear_quotations;
CREATE POLICY gear_quotations_select ON public.gear_quotations FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS gear_quotations_insert ON public.gear_quotations;
CREATE POLICY gear_quotations_insert ON public.gear_quotations FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
