create extension if not exists "pgcrypto";

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  customer_name text not null,
  phone text not null,
  email text not null,
  vehicle_brand text not null default 'No informado',
  vehicle_model text not null default 'No informado',
  license_plate text not null default 'No informada',
  vehicle_type text not null,
  service_id text not null,
  service_name text not null,
  booking_date date not null,
  booking_time text not null,
  notes text,
  internal_notes text,
  status text not null default 'pendiente' check (status in ('pendiente', 'confirmada', 'rechazada', 'completada', 'cancelada')),
  payment_status text not null default 'no_solicitado' check (payment_status in ('pendiente', 'pagado', 'no_solicitado')),
  payment_link_sent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_date_idx on public.bookings (booking_date);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_service_idx on public.bookings (service_id);
create index if not exists bookings_search_idx on public.bookings (customer_name, phone, license_plate);

alter table public.bookings enable row level security;

create policy "service role can manage bookings"
on public.bookings
for all
using (true)
with check (true);
