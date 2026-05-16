-- Adds a per-user role flag that lets selected non-admin users perform
-- bulk opt-ins from the regular user flow. Admins assign this from
-- Manage Users → "Assign Bulk Opt-In Role".

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS can_self_opt_in boolean NOT NULL DEFAULT true;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS can_bulk_opt_in boolean NOT NULL DEFAULT false;
