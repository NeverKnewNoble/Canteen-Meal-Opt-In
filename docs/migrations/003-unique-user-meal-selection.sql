-- Enforces one row per (user, meal) so a user can't end up with
-- contradictory selections (e.g. one row "yes" and another "no" for
-- the same meal). Re-submissions are handled as upserts in the app.

-- Drop existing duplicates, keeping the most recent row per (user, meal).
DELETE FROM public.selections
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY user_id, meal_id
             ORDER BY created_at DESC, id DESC
           ) AS rn
    FROM public.selections
  ) t
  WHERE rn > 1
);

ALTER TABLE public.selections
  ADD CONSTRAINT selections_user_meal_unique UNIQUE (user_id, meal_id);
