-- OurBook: una fila JSON (mismo patrón que Esencia Infinita: cliente anon en el navegador).
-- Ejecuta esto en Supabase → SQL Editor (una vez).

create table if not exists public.ourbook_state (
  id text primary key default 'default',
  story jsonb not null default '{}'::jsonb,
  gallery jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.ourbook_state enable row level security;

-- Lectura pública (cualquiera con la URL del sitio y la anon key puede leer/escribir).
-- Aceptable para un libro personal de un solo sitio; no uses esto para datos multi-inquilino sensibles.

create policy "ourbook_state_select"
  on public.ourbook_state for select
  to anon, authenticated
  using (true);

create policy "ourbook_state_insert"
  on public.ourbook_state for insert
  to anon, authenticated
  with check (id = 'default');

create policy "ourbook_state_update"
  on public.ourbook_state for update
  to anon, authenticated
  using (id = 'default')
  with check (id = 'default');
