create table if not exists public.bot_settings (
  id integer primary key check (id = 1),
  save_enabled boolean not null default true,
  bot_enabled boolean not null default true
);

insert into public.bot_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.bot_settings enable row level security;
