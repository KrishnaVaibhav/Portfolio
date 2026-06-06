create table public.user_visits (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  page_path text not null,
  user_agent text null,
  ip_address text null,
  city text null,
  country text null,
  region text null,
  isp text null,
  device_type text null,
  screen_resolution text null,
  window_size text null,
  language text null,
  referrer text null,
  timezone text null,
  connection_type text null,
  cpu_cores int null,
  gpu_renderer text null,
  meta jsonb null,
  constraint user_visits_pkey primary key (id)
);

alter table public.user_visits enable row level security;

create policy "Enable insert for all users" on public.user_visits
  for insert with check (true);

-- Enable select for all users (relies on client-side password for simplified access)
create policy "Enable select for all users" on public.user_visits
  for select using (true);
