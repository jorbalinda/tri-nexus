-- Prevent duplicate race registrations: same user can't add the same race name on the same date twice.
-- Remove existing duplicates first (keep the earliest created record).
DELETE FROM target_races
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, race_name, race_date) id
  FROM target_races
  ORDER BY user_id, race_name, race_date, created_at ASC
);

ALTER TABLE target_races
  ADD CONSTRAINT unique_race_per_user UNIQUE (user_id, race_name, race_date);
