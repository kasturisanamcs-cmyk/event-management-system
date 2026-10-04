-- EventNest production workflow additions.
-- Safe to run after the existing foundation and current project migrations.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Current project schema compatibility
-- ------------------------------------------------------------

create table if not exists public.event_organizers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  constraint event_organizers_unique unique (event_id, organizer_id)
);

create table if not exists public.competition_members (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  constraint competition_members_unique unique (competition_id, member_id)
);

create index if not exists event_organizers_event_id_idx on public.event_organizers(event_id);
create index if not exists event_organizers_organizer_id_idx on public.event_organizers(organizer_id);
create index if not exists competition_members_competition_id_idx on public.competition_members(competition_id);
create index if not exists competition_members_member_id_idx on public.competition_members(member_id);

alter table public.competitions add column if not exists registration_fee numeric(12,2) default 0;
alter table public.competitions add column if not exists capacity integer;
alter table public.competitions add column if not exists competition_date date;
alter table public.competitions add column if not exists start_time time;
alter table public.competitions add column if not exists end_time time;
alter table public.competitions add column if not exists check_in_start time;
alter table public.competitions add column if not exists check_in_end time;
alter table public.competitions add column if not exists late_entry_allowed boolean default false;
alter table public.competitions add column if not exists poster_url text;

create table if not exists public.competition_sessions (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  session_name text not null,
  session_date date not null,
  start_time time not null,
  end_time time not null,
  check_in_start time,
  check_in_end time,
  late_entry_allowed boolean not null default false,
  venue text not null,
  capacity integer,
  created_at timestamptz not null default now()
);

alter table public.competition_sessions add column if not exists capacity integer;

alter table public.registrations add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.registrations add column if not exists registration_number text;
alter table public.registrations add column if not exists session_id uuid references public.competition_sessions(id) on delete restrict;
alter table public.registrations add column if not exists updated_at timestamptz default now();
alter table public.registrations add column if not exists participant_name text;
alter table public.registrations add column if not exists participant_email text;
alter table public.registrations add column if not exists phone text;
alter table public.registrations add column if not exists college text;
alter table public.registrations add column if not exists student_id text;
alter table public.registrations add column if not exists participation_type text default 'Individual';
alter table public.registrations add column if not exists team_name text;

-- If an older foundation still has participant_id, keep it for compatibility.
-- New application code uses user_id.

create index if not exists registrations_user_id_idx
  on public.registrations(user_id);

create index if not exists registrations_session_id_idx
  on public.registrations(session_id);

create unique index if not exists registrations_active_user_competition_uidx
  on public.registrations(user_id, competition_id)
  where user_id is not null and status in ('PENDING', 'CONFIRMED');

alter table public.competition_sessions add column if not exists capacity integer;

-- Event organizers can create and manage competitions inside their assigned event.
drop policy if exists "Event organizers can manage competitions" on public.competitions;
create policy "Event organizers can manage competitions"
on public.competitions for all to authenticated
using (public.is_admin() or public.is_event_organizer_of(event_id) or public.is_competition_organizer(id))
with check (public.is_admin() or public.is_event_organizer_of(event_id) or public.is_competition_organizer(id));

-- ------------------------------------------------------------
-- Payment records
-- ------------------------------------------------------------

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.registrations(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  currency text not null default 'INR',
  provider text not null default 'RAZORPAY',
  provider_order_id text,
  provider_payment_id text,
  provider_signature text,
  status text not null default 'PENDING',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments add column if not exists amount numeric(12,2) not null default 0;
alter table public.payments add column if not exists currency text not null default 'INR';
alter table public.payments add column if not exists provider text not null default 'RAZORPAY';
alter table public.payments add column if not exists provider_order_id text;
alter table public.payments add column if not exists provider_payment_id text;
alter table public.payments add column if not exists provider_signature text;
alter table public.payments add column if not exists status text not null default 'PENDING';
alter table public.payments add column if not exists paid_at timestamptz;
alter table public.payments add column if not exists created_at timestamptz not null default now();
alter table public.payments add column if not exists updated_at timestamptz not null default now();

create unique index if not exists payments_registration_uidx on public.payments(registration_id);
create index if not exists payments_registration_id_idx on public.payments(registration_id);
create index if not exists payments_status_idx on public.payments(status);

-- ------------------------------------------------------------
-- Attendance
-- ------------------------------------------------------------

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  session_id uuid references public.competition_sessions(id) on delete set null,
  checked_in_by uuid references public.profiles(id) on delete set null,
  status text not null default 'CHECKED_IN',
  checked_in_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint attendance_registration_unique unique (registration_id)
);

alter table public.attendance add column if not exists session_id uuid references public.competition_sessions(id) on delete set null;
alter table public.attendance add column if not exists checked_in_by uuid references public.profiles(id) on delete set null;
alter table public.attendance add column if not exists status text not null default 'CHECKED_IN';
alter table public.attendance add column if not exists checked_in_at timestamptz not null default now();
alter table public.attendance add column if not exists created_at timestamptz not null default now();

create index if not exists attendance_session_id_idx on public.attendance(session_id);
create index if not exists attendance_checked_in_by_idx on public.attendance(checked_in_by);

-- ------------------------------------------------------------
-- Announcements
-- ------------------------------------------------------------

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  competition_id uuid references public.competitions(id) on delete cascade,
  title text not null,
  message text not null,
  status text not null default 'PUBLISHED',
  created_by uuid not null references public.profiles(id) on delete restrict,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists announcements_event_id_idx on public.announcements(event_id);
create index if not exists announcements_competition_id_idx on public.announcements(competition_id);
create index if not exists announcements_published_at_idx on public.announcements(published_at desc);

-- ------------------------------------------------------------
-- Ticket/registration helpers
-- ------------------------------------------------------------

create or replace function public.is_event_organizer_of(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.event_organizers eo
    where eo.event_id = target_event_id
      and eo.organizer_id = auth.uid()
  );
$$;

grant execute on function public.is_event_organizer_of(uuid) to authenticated;

alter table public.event_organizers enable row level security;
drop policy if exists "Organizers can view their assignments" on public.event_organizers;
create policy "Organizers can view their assignments"
on public.event_organizers for select to authenticated
using (organizer_id = auth.uid() or public.is_admin());

drop policy if exists "Organizers can view assigned events" on public.events;
create policy "Organizers can view assigned events"
on public.events for select to authenticated
using (status = 'PUBLISHED' or public.is_admin() or public.is_event_organizer_of(id));


create or replace function public.get_competition_session_availability(
  target_competition_id uuid
)
returns table (
  id uuid,
  session_name text,
  session_date date,
  start_time time,
  end_time time,
  check_in_start time,
  check_in_end time,
  late_entry_allowed boolean,
  venue text,
  capacity integer,
  registered_count bigint,
  available_seats bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    cs.id,
    cs.session_name,
    cs.session_date,
    cs.start_time,
    cs.end_time,
    cs.check_in_start,
    cs.check_in_end,
    cs.late_entry_allowed,
    cs.venue,
    coalesce(cs.capacity, c.capacity) as capacity,
    count(r.id) filter (where r.status in ('PENDING','CONFIRMED')) as registered_count,
    case
      when coalesce(cs.capacity, c.capacity) is null then null
      else greatest(
        coalesce(cs.capacity, c.capacity)::bigint -
        count(r.id) filter (where r.status in ('PENDING','CONFIRMED')),
        0
      )
    end as available_seats
  from public.competition_sessions cs
  join public.competitions c on c.id = cs.competition_id
  left join public.registrations r on r.session_id = cs.id
  where cs.competition_id = target_competition_id
  group by cs.id, c.capacity
  order by cs.session_date asc, cs.start_time asc;
$$;

grant execute on function public.get_competition_session_availability(uuid) to authenticated;

create or replace function public.create_eventnest_registration(
  target_competition_id uuid,
  target_session_id uuid,
  participant_name_value text,
  participant_email_value text,
  phone_value text,
  college_value text,
  student_id_value text,
  participation_type_value text default 'Individual',
  team_name_value text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  comp public.competitions%rowtype;
  session_row public.competition_sessions%rowtype;
  available bigint;
  reg public.registrations%rowtype;
  reg_number text;
  ticket_code_value text;
  qr_token_value text;
begin
  if current_user_id is null then
    raise exception using errcode = 'P0001', message = 'Authentication required.';
  end if;

  select * into comp
  from public.competitions
  where id = target_competition_id
    and status = 'PUBLISHED';

  if not found then
    raise exception using errcode = 'P0001', message = 'Competition is not available for registration.';
  end if;

  if comp.registration_deadline is not null
     and current_date > comp.registration_deadline then
    raise exception using errcode = 'P0001', message = 'Registration deadline has passed.';
  end if;

  select * into session_row
  from public.competition_sessions
  where id = target_session_id
    and competition_id = target_competition_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'Selected session is invalid.';
  end if;

  select a.available_seats into available
  from public.get_competition_session_availability(target_competition_id) a
  where a.id = target_session_id;

  if available is not null and available <= 0 then
    raise exception using errcode = 'P0001', message = 'Selected session is full. Please choose another session.';
  end if;

  if exists (
    select 1 from public.registrations
    where user_id = current_user_id
      and competition_id = target_competition_id
      and status in ('PENDING','CONFIRMED')
  ) then
    raise exception using errcode = 'P0001', message = 'You already have an active registration for this competition.';
  end if;

  reg_number := 'EVN-' || to_char(current_timestamp, 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));

  insert into public.registrations (
    user_id,
    competition_id,
    session_id,
    registration_number,
    status,
    participant_name,
    participant_email,
    phone,
    college,
    student_id,
    participation_type,
    team_name
  ) values (
    current_user_id,
    target_competition_id,
    target_session_id,
    reg_number,
    case when coalesce(comp.registration_fee,0) = 0 then 'CONFIRMED' else 'PENDING' end,
    btrim(participant_name_value),
    lower(btrim(participant_email_value)),
    btrim(phone_value),
    btrim(college_value),
    btrim(student_id_value),
    coalesce(nullif(btrim(participation_type_value),''),'Individual'),
    nullif(btrim(team_name_value),'')
  )
  returning * into reg;

  if coalesce(comp.registration_fee,0) = 0 then
    ticket_code_value := 'TKT-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
    qr_token_value := encode(gen_random_bytes(32), 'hex');

    insert into public.tickets (registration_id, ticket_code, qr_token, status)
    values (reg.id, ticket_code_value, qr_token_value, 'ACTIVE');
  end if;

  return jsonb_build_object(
    'registration_id', reg.id,
    'registration_number', reg.registration_number,
    'status', reg.status,
    'amount', coalesce(comp.registration_fee,0),
    'competition_id', comp.id,
    'session_id', session_row.id
  );
exception
  when unique_violation then
    raise exception using errcode = 'P0001', message = 'A registration for this competition already exists.';
end;
$$;

grant execute on function public.create_eventnest_registration(uuid,uuid,text,text,text,text,text,text,text) to authenticated;

create or replace function public.finalize_eventnest_paid_registration(
  target_registration_id uuid,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  reg public.registrations%rowtype;
  ticket_code_value text;
  qr_token_value text;
begin
  select * into reg
  from public.registrations
  where id = target_registration_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'Registration not found.';
  end if;

  if reg.status = 'CONFIRMED' then
    return jsonb_build_object('registration_id', reg.id, 'status', reg.status);
  end if;

  update public.registrations
  set status = 'CONFIRMED', updated_at = now()
  where id = target_registration_id;

  insert into public.payments (
    registration_id,
    amount,
    currency,
    provider,
    provider_order_id,
    provider_payment_id,
    provider_signature,
    status,
    paid_at,
    updated_at
  )
  select
    reg.id,
    coalesce(c.registration_fee,0),
    'INR',
    'RAZORPAY',
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    'PAID',
    now(),
    now()
  from public.competitions c
  where c.id = reg.competition_id
  on conflict (registration_id) do update set
    provider_order_id = excluded.provider_order_id,
    provider_payment_id = excluded.provider_payment_id,
    provider_signature = excluded.provider_signature,
    status = 'PAID',
    paid_at = now(),
    updated_at = now();

  if not exists (select 1 from public.tickets where registration_id = reg.id) then
    ticket_code_value := 'TKT-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
    qr_token_value := encode(gen_random_bytes(32), 'hex');

    insert into public.tickets (registration_id, ticket_code, qr_token, status)
    values (reg.id, ticket_code_value, qr_token_value, 'ACTIVE');
  end if;

  return jsonb_build_object('registration_id', reg.id, 'status', 'CONFIRMED');
end;
$$;

-- Do not grant this function to normal users. Server-side service-role code calls it.

-- ------------------------------------------------------------
-- RLS for the newly added tables
-- ------------------------------------------------------------

alter table public.payments enable row level security;
alter table public.attendance enable row level security;
alter table public.announcements enable row level security;

-- Drop/recreate only policies owned by this production migration.
drop policy if exists "payments_owner_or_staff_select" on public.payments;
drop policy if exists "attendance_member_or_staff_select" on public.attendance;
drop policy if exists "attendance_staff_insert" on public.attendance;
drop policy if exists "announcements_authenticated_select" on public.announcements;
drop policy if exists "announcements_staff_insert" on public.announcements;
drop policy if exists "announcements_staff_update" on public.announcements;
drop policy if exists "announcements_staff_delete" on public.announcements;

create policy "payments_owner_or_staff_select"
on public.payments for select to authenticated
using (
  exists (
    select 1 from public.registrations r
    where r.id = payments.registration_id
      and r.user_id = auth.uid()
  )
  or public.is_admin()
  or exists (
    select 1
    from public.registrations r
    join public.competitions c on c.id = r.competition_id
    where r.id = payments.registration_id
      and (
        public.is_competition_organizer(c.id)
        or public.is_competition_assigned(c.id)
      )
  )
);

create policy "attendance_member_or_staff_select"
on public.attendance for select to authenticated
using (
  public.is_admin()
  or checked_in_by = auth.uid()
  or exists (
    select 1
    from public.registrations r
    join public.competitions c on c.id = r.competition_id
    where r.id = attendance.registration_id
      and (public.is_competition_organizer(c.id) or public.is_competition_assigned(c.id))
  )
);

create policy "attendance_staff_insert"
on public.attendance for insert to authenticated
with check (
  public.is_admin()
  or checked_in_by = auth.uid()
  or exists (
    select 1
    from public.registrations r
    join public.competitions c on c.id = r.competition_id
    where r.id = attendance.registration_id
      and (public.is_competition_organizer(c.id) or public.is_competition_assigned(c.id))
  )
);

create policy "announcements_authenticated_select"
on public.announcements for select to authenticated
using (
  status = 'PUBLISHED'
  or created_by = auth.uid()
  or public.is_admin()
);

create policy "announcements_staff_insert"
on public.announcements for insert to authenticated
with check (
  public.is_admin()
  or created_by = auth.uid()
);

create policy "announcements_staff_update"
on public.announcements for update to authenticated
using (public.is_admin() or created_by = auth.uid())
with check (public.is_admin() or created_by = auth.uid());

create policy "announcements_staff_delete"
on public.announcements for delete to authenticated
using (public.is_admin() or created_by = auth.uid());
