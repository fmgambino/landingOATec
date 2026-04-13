-- ============================================
-- OATec 2026 · GitHub Pages + Supabase
-- Formulario público + panel admin autenticado
-- ============================================

create table if not exists public.inscripciones_oatec (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  age integer not null check (age between 12 and 21),
  birth_date date not null,
  dni varchar(8) not null,
  course varchar(2) not null check (course in ('4', '5', '6', '7')),
  division varchar(1) not null check (division in ('A', 'B', 'C')),
  institution text not null default 'Instituto San Miguel',
  competition text not null default 'OATec ITBA 2026',
  theme text not null default 'Desafío Espacial',
  submitted_at_iso text not null,
  source text not null default 'github-pages',
  status text not null default 'pendiente' check (status in ('pendiente', 'aprobado', 'rechazado'))
);

create index if not exists idx_inscripciones_oatec_created_at
  on public.inscripciones_oatec (created_at desc);

create unique index if not exists uq_inscripciones_oatec_dni_competition
  on public.inscripciones_oatec (dni, competition);

alter table public.inscripciones_oatec enable row level security;

-- Limpieza previa
drop policy if exists "insert_anon_inscripciones_oatec" on public.inscripciones_oatec;
drop policy if exists "select_authenticated_inscripciones_oatec" on public.inscripciones_oatec;
drop policy if exists "update_authenticated_inscripciones_oatec" on public.inscripciones_oatec;
drop policy if exists "delete_authenticated_inscripciones_oatec" on public.inscripciones_oatec;
drop policy if exists "deny_select_anon_inscripciones_oatec" on public.inscripciones_oatec;
drop policy if exists "deny_update_anon_inscripciones_oatec" on public.inscripciones_oatec;
drop policy if exists "deny_delete_anon_inscripciones_oatec" on public.inscripciones_oatec;

-- Formulario público: insertar con anon key
create policy "insert_anon_inscripciones_oatec"
on public.inscripciones_oatec
for insert
to anon
with check (true);

-- Admin autenticado: puede ver y actualizar
create policy "select_authenticated_inscripciones_oatec"
on public.inscripciones_oatec
for select
to authenticated
using (true);

create policy "update_authenticated_inscripciones_oatec"
on public.inscripciones_oatec
for update
to authenticated
using (true)
with check (true);

-- Opcional: permitir borrar a usuarios autenticados
create policy "delete_authenticated_inscripciones_oatec"
on public.inscripciones_oatec
for delete
to authenticated
using (true);

-- Bloqueos explícitos para anon
create policy "deny_select_anon_inscripciones_oatec"
on public.inscripciones_oatec
for select
to anon
using (false);

create policy "deny_update_anon_inscripciones_oatec"
on public.inscripciones_oatec
for update
to anon
using (false)
with check (false);

create policy "deny_delete_anon_inscripciones_oatec"
on public.inscripciones_oatec
for delete
to anon
using (false);

-- ============================================
-- IMPORTANTE
-- ============================================
-- 1) Ejecutá este SQL en Supabase SQL Editor.
-- 2) Después andá a Authentication > Users > Add user
-- 3) Creá este usuario admin:
--    Email: admin@oatec.local
--    Password: admin0342$$
-- 4) En config.js dejá:
--    ADMIN_USERNAME: "admin"
--    ADMIN_EMAIL: "admin@oatec.local"
