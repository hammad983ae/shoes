-- 1) Ensure profiles has required columns first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_creator'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_creator BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add check constraint for allowed roles (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_role_allowed_values'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_allowed_values
      CHECK (role IN ('user','creator','admin'));
  END IF;
END $$;

-- 2) Helper functions & admin check
CREATE OR REPLACE FUNCTION public.get_profile_role(_user_id uuid)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_profile_is_creator(_user_id uuid)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(is_creator, false) FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  );
$$;

-- 3) Tighten update policy for profiles & add admin override
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND role = public.get_profile_role(auth.uid())
  AND is_creator = public.get_profile_is_creator(auth.uid())
);

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4) Create messages table & policies
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
CREATE POLICY "Anyone can insert messages"
ON public.messages
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can read messages" ON public.messages;
CREATE POLICY "Only admins can read messages"
ON public.messages
FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can update messages" ON public.messages;
CREATE POLICY "Only admins can update messages"
ON public.messages
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5) Seed the admin account
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'stxrfo@gmail.com' LIMIT 1;
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (user_id, display_name, role, is_creator)
    VALUES (v_user_id, 'Santino', 'admin', false)
    ON CONFLICT (user_id) DO UPDATE SET role='admin', display_name='Santino';
  END IF;
END $$;

-- 6) RPCs for admin actions
CREATE OR REPLACE FUNCTION public.promote_to_creator(target_user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.profiles SET is_creator = true, updated_at = now() WHERE user_id = target_user_id;
  RETURN TRUE;
END;$$;

CREATE OR REPLACE FUNCTION public.demote_from_creator(target_user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.profiles SET is_creator = false, updated_at = now() WHERE user_id = target_user_id;
  RETURN TRUE;
END;$$;

CREATE OR REPLACE FUNCTION public.set_user_role(target_user_id uuid, new_role text)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF new_role NOT IN ('user','creator') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;
  UPDATE public.profiles SET role = new_role, updated_at = now() WHERE user_id = target_user_id;
  RETURN TRUE;
END;$$;