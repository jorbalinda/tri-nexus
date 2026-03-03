-- Consent records — append-only audit table for legal proof of privacy policy acceptance
-- Stores IP address, user agent, policy version, and SHA-256 hash of the policy text
-- No UPDATE or DELETE RLS policies = immutable records

create table if not exists public.consent_records (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete set null,
  policy_version text      not null,
  policy_hash  text        not null,
  consent_type text        not null default 'privacy_policy',
  agreed_at    timestamptz not null default now(),
  ip_address   text,
  user_agent   text
);

alter table public.consent_records enable row level security;

create policy "Users can insert own consent"
  on public.consent_records for insert
  with check (auth.uid() = user_id);

create policy "Users can read own consent"
  on public.consent_records for select
  using (auth.uid() = user_id);
