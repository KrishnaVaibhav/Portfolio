-- Create user_visits table for portfolio analytics tracking
create table if not exists public.user_visits (
  id               uuid        not null default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  page_path        text        not null,
  user_agent       text        null,
  ip_address       text        null,
  city             text        null,
  country          text        null,
  region           text        null,
  isp              text        null,
  device_type      text        null,
  screen_resolution text       null,
  window_size      text        null,
  language         text        null,
  referrer         text        null,
  timezone         text        null,
  connection_type  text        null,
  cpu_cores        int         null,
  gpu_renderer     text        null,
  meta             jsonb       null,
  constraint user_visits_pkey primary key (id)
);

-- Enable Row Level Security
alter table public.user_visits enable row level security;

-- INSERT: allow anonymous visitors to log their visit
create policy "anon_insert" on public.user_visits
  for insert to anon with check (true);

-- SELECT: allow reading (used by admin dashboard via anon key)
create policy "anon_select" on public.user_visits
  for select to anon using (true);

-- UPDATE: allow heartbeat / exit-time updates
create policy "anon_update" on public.user_visits
  for update to anon using (true) with check (true);

-- DELETE: allow admin dashboard to clear logs
create policy "anon_delete" on public.user_visits
  for delete to anon using (true);
