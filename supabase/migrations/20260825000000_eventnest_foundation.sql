-- EventNest database foundation.
-- Identity is owned by Supabase Auth. Application user data lives in profiles.

create extension if not exists pgcrypto;

create type public.app_role as enum (
  'ADMIN',
  'ORGANIZER',
  'COMPETITION_MEMBER',
  'VOLUNTEER',
  'PARTICIPANT'
);

create type public.event_status as enum (
  'DRAFT',
  'PUBLISHED',
  'CANCELLED',
  'COMPLETED'
);

create type public.competition_status as enum (
  'DRAFT',
  'PUBLISHED',
  'ONGOING',
  'COMPLETED',
  'CANCELLED'
);

create type public.competition_assignment_role as enum (
  'ORGANIZER',
  'COMPETITION_MEMBER'
);

create type public.volunteer_task_status as enum (
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

create type public.volunteer_assignment_source as enum (
  'MANUAL',
  'AI'
);

create type public.volunteer_task_assignment_status as enum (
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

create type public.registration_status as enum (
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'REJECTED'
);

create type public.ticket_status as enum (
  'ACTIVE',
  'USED',
  'CANCELLED',
  'EXPIRED'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'PARTICIPANT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length check (char_length(btrim(full_name)) between 2 and 120)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date not null,
  end_date date not null,
  registration_deadline date not null,
  venue text not null,
  event_image text,
  status public.event_status not null default 'DRAFT',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_name_length check (char_length(btrim(name)) between 2 and 160),
  constraint events_venue_length check (char_length(btrim(venue)) between 2 and 200),
  constraint events_date_order check (end_date >= start_date),
  constraint events_registration_deadline_order check (registration_deadline <= start_date)
);

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  description text,
  start_date date not null,
  end_date date not null,
  venue text not null,
  registration_deadline date not null,
  max_participants integer,
  status public.competition_status not null default 'DRAFT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint competitions_name_length check (char_length(btrim(name)) between 2 and 160),
  constraint competitions_venue_length check (char_length(btrim(venue)) between 2 and 200),
  constraint competitions_date_order check (end_date >= start_date),
  constraint competitions_registration_deadline_order check (registration_deadline <= start_date),
  constraint competitions_max_participants_positive check (max_participants is null or max_participants > 0),
  constraint competitions_event_name_unique unique (event_id, name)
);

create table public.competition_assignments (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assignment_role public.competition_assignment_role not null,
  created_at timestamptz not null default now(),
  constraint competition_assignments_competition_user_unique unique (competition_id, user_id)
);

create table public.volunteer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.volunteer_skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  constraint volunteer_skills_name_length check (char_length(btrim(name)) between 2 and 80),
  constraint volunteer_skills_name_unique unique (name)
);

create table public.volunteer_profile_skills (
  volunteer_profile_id uuid not null references public.volunteer_profiles(id) on delete cascade,
  skill_id uuid not null references public.volunteer_skills(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (volunteer_profile_id, skill_id)
);

create table public.volunteer_tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  description text,
  location text not null,
  start_time timestamptz,
  end_time timestamptz,
  required_volunteers integer not null default 1,
  status public.volunteer_task_status not null default 'OPEN',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint volunteer_tasks_title_length check (char_length(btrim(title)) between 2 and 160),
  constraint volunteer_tasks_location_length check (char_length(btrim(location)) between 2 and 200),
  constraint volunteer_tasks_required_volunteers_positive check (required_volunteers > 0),
  constraint volunteer_tasks_time_order check (start_time is null or end_time is null or end_time > start_time)
);

create table public.volunteer_task_assignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.volunteer_tasks(id) on delete cascade,
  volunteer_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  assignment_source public.volunteer_assignment_source not null default 'MANUAL',
  status public.volunteer_task_assignment_status not null default 'ASSIGNED',
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint volunteer_task_assignments_task_volunteer_unique unique (task_id, volunteer_id),
  constraint volunteer_task_assignments_completed_state check (
    (status = 'COMPLETED' and completed_at is not null)
    or (status <> 'COMPLETED')
  )
);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.profiles(id) on delete cascade,
  competition_id uuid not null references public.competitions(id) on delete cascade,
  status public.registration_status not null default 'PENDING',
  registered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint registrations_participant_competition_unique unique (participant_id, competition_id)
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.registrations(id) on delete cascade,
  ticket_code text not null,
  qr_token text not null,
  status public.ticket_status not null default 'ACTIVE',
  issued_at timestamptz not null default now(),
  used_at timestamptz,
  constraint tickets_ticket_code_unique unique (ticket_code),
  constraint tickets_qr_token_unique unique (qr_token),
  constraint tickets_code_length check (char_length(btrim(ticket_code)) between 8 and 128),
  constraint tickets_qr_token_length check (char_length(btrim(qr_token)) between 24 and 256),
  constraint tickets_used_state check (
    (status = 'USED' and used_at is not null)
    or (status <> 'USED')
  )
);

create index profiles_role_idx on public.profiles(role);
create index events_created_by_idx on public.events(created_by);
create index events_status_idx on public.events(status);
create index events_start_date_idx on public.events(start_date);
create index competitions_event_id_idx on public.competitions(event_id);
create index competitions_status_idx on public.competitions(status);
create index competition_assignments_competition_id_idx on public.competition_assignments(competition_id);
create index competition_assignments_user_id_idx on public.competition_assignments(user_id);
create index volunteer_tasks_event_id_idx on public.volunteer_tasks(event_id);
create index volunteer_tasks_status_idx on public.volunteer_tasks(status);
create index volunteer_task_assignments_task_id_idx on public.volunteer_task_assignments(task_id);
create index volunteer_task_assignments_volunteer_id_idx on public.volunteer_task_assignments(volunteer_id);
create index registrations_participant_id_idx on public.registrations(participant_id);
create index registrations_competition_id_idx on public.registrations(competition_id);
create index tickets_registration_id_idx on public.tickets(registration_id);
create index tickets_ticket_code_idx on public.tickets(ticket_code);
create index tickets_qr_token_idx on public.tickets(qr_token);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger competitions_set_updated_at
before update on public.competitions
for each row execute function public.set_updated_at();

create trigger volunteer_profiles_set_updated_at
before update on public.volunteer_profiles
for each row execute function public.set_updated_at();

create trigger volunteer_tasks_set_updated_at
before update on public.volunteer_tasks
for each row execute function public.set_updated_at();

create trigger registrations_set_updated_at
before update on public.registrations
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  metadata_name text;
  fallback_name text;
begin
  metadata_name := nullif(btrim(new.raw_user_meta_data->>'full_name'), '');
  fallback_name := nullif(btrim(split_part(coalesce(new.email, ''), '@', 1)), '');

  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(metadata_name, fallback_name, 'EventNest User'), 'PARTICIPANT');

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public, auth
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(public.current_user_role() = 'ADMIN', false)
$$;

create or replace function public.is_competition_assigned(target_competition_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.competition_assignments ca
    where ca.competition_id = target_competition_id
      and ca.user_id = auth.uid()
  )
$$;

create or replace function public.is_competition_organizer(target_competition_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.competition_assignments ca
    where ca.competition_id = target_competition_id
      and ca.user_id = auth.uid()
      and ca.assignment_role = 'ORGANIZER'
  )
$$;

create or replace function public.can_view_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.competitions c
      join public.competition_assignments ca on ca.competition_id = c.id
      where c.event_id = target_event_id
        and ca.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.volunteer_task_assignments vta
      join public.volunteer_tasks vt on vt.id = vta.task_id
      where vt.event_id = target_event_id
        and vta.volunteer_id = auth.uid()
    )
    or exists (
      select 1
      from public.registrations r
      join public.competitions c on c.id = r.competition_id
      where c.event_id = target_event_id
        and r.participant_id = auth.uid()
    )
$$;

create or replace function public.validate_event_created_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  creator_role public.app_role;
begin
  select role into creator_role from public.profiles where id = new.created_by;

  if creator_role <> 'ADMIN' then
    raise exception 'Only ADMIN profiles can create events.';
  end if;

  return new;
end;
$$;

create trigger validate_event_created_by
before insert or update of created_by on public.events
for each row execute function public.validate_event_created_by();

create or replace function public.validate_competition_inside_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  parent_start date;
  parent_end date;
begin
  select start_date, end_date
    into parent_start, parent_end
  from public.events
  where id = new.event_id;

  if parent_start is null then
    raise exception 'Parent event does not exist.';
  end if;

  if new.start_date < parent_start or new.end_date > parent_end then
    raise exception 'Competition dates must remain inside the parent event period.';
  end if;

  return new;
end;
$$;

create trigger validate_competition_inside_event
before insert or update of event_id, start_date, end_date on public.competitions
for each row execute function public.validate_competition_inside_event();

create or replace function public.validate_competition_assignment_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role public.app_role;
begin
  select role into assigned_role from public.profiles where id = new.user_id;

  if new.assignment_role = 'ORGANIZER' and assigned_role <> 'ORGANIZER' then
    raise exception 'Only ORGANIZER profiles can be assigned as competition organizers.';
  end if;

  if new.assignment_role = 'COMPETITION_MEMBER' and assigned_role <> 'COMPETITION_MEMBER' then
    raise exception 'Only COMPETITION_MEMBER profiles can be assigned as competition members.';
  end if;

  return new;
end;
$$;

create trigger validate_competition_assignment_user_role
before insert or update of user_id, assignment_role on public.competition_assignments
for each row execute function public.validate_competition_assignment_user_role();

create or replace function public.validate_volunteer_profile_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_role public.app_role;
begin
  select role into profile_role from public.profiles where id = new.user_id;

  if profile_role <> 'VOLUNTEER' then
    raise exception 'Only VOLUNTEER profiles can have volunteer profiles.';
  end if;

  return new;
end;
$$;

create trigger validate_volunteer_profile_user_role
before insert or update of user_id on public.volunteer_profiles
for each row execute function public.validate_volunteer_profile_user_role();

create or replace function public.validate_volunteer_task_assignment_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_role public.app_role;
begin
  select role into profile_role from public.profiles where id = new.volunteer_id;

  if profile_role <> 'VOLUNTEER' then
    raise exception 'Only VOLUNTEER profiles can be assigned volunteer tasks.';
  end if;

  return new;
end;
$$;

create trigger validate_volunteer_task_assignment_user_role
before insert or update of volunteer_id on public.volunteer_task_assignments
for each row execute function public.validate_volunteer_task_assignment_user_role();

create or replace function public.validate_registration_participant_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_role public.app_role;
begin
  select role into profile_role from public.profiles where id = new.participant_id;

  if profile_role <> 'PARTICIPANT' then
    raise exception 'Only PARTICIPANT profiles can register for competitions.';
  end if;

  return new;
end;
$$;

create trigger validate_registration_participant_role
before insert or update of participant_id on public.registrations
for each row execute function public.validate_registration_participant_role();

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.competitions enable row level security;
alter table public.competition_assignments enable row level security;
alter table public.volunteer_profiles enable row level security;
alter table public.volunteer_skills enable row level security;
alter table public.volunteer_profile_skills enable row level security;
alter table public.volunteer_tasks enable row level security;
alter table public.volunteer_task_assignments enable row level security;
alter table public.registrations enable row level security;
alter table public.tickets enable row level security;

create policy "profiles_select_self_admin_or_assigned_staff"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.competition_assignments mine
    join public.competition_assignments target
      on target.competition_id = mine.competition_id
    where mine.user_id = auth.uid()
      and target.user_id = profiles.id
  )
);

create policy "profiles_update_self_without_role_change"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = public.current_user_role());

create policy "profiles_admin_insert"
on public.profiles for insert
to authenticated
with check (public.is_admin());

create policy "profiles_admin_update"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "profiles_admin_delete"
on public.profiles for delete
to authenticated
using (public.is_admin());

create policy "events_select_published_or_related"
on public.events for select
to authenticated
using (status = 'PUBLISHED' or public.can_view_event(id));

create policy "events_admin_insert"
on public.events for insert
to authenticated
with check (public.is_admin() and created_by = auth.uid());

create policy "events_admin_update"
on public.events for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "events_admin_delete"
on public.events for delete
to authenticated
using (public.is_admin());

create policy "competitions_select_published_or_related"
on public.competitions for select
to authenticated
using (
  status = 'PUBLISHED'
  or public.is_admin()
  or public.is_competition_assigned(id)
  or exists (
    select 1
    from public.registrations r
    where r.competition_id = competitions.id
      and r.participant_id = auth.uid()
  )
);

create policy "competitions_admin_insert"
on public.competitions for insert
to authenticated
with check (public.is_admin());

create policy "competitions_admin_or_organizer_update"
on public.competitions for update
to authenticated
using (public.is_admin() or public.is_competition_organizer(id))
with check (public.is_admin() or public.is_competition_organizer(id));

create policy "competitions_admin_delete"
on public.competitions for delete
to authenticated
using (public.is_admin());

create policy "competition_assignments_select_admin_or_same_competition_staff"
on public.competition_assignments for select
to authenticated
using (
  public.is_admin()
  or user_id = auth.uid()
  or public.is_competition_assigned(competition_id)
);

create policy "competition_assignments_admin_insert"
on public.competition_assignments for insert
to authenticated
with check (public.is_admin());

create policy "competition_assignments_admin_update"
on public.competition_assignments for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "competition_assignments_admin_delete"
on public.competition_assignments for delete
to authenticated
using (public.is_admin());

create policy "volunteer_profiles_select_self_or_admin"
on public.volunteer_profiles for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "volunteer_profiles_admin_insert"
on public.volunteer_profiles for insert
to authenticated
with check (public.is_admin());

create policy "volunteer_profiles_admin_update"
on public.volunteer_profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "volunteer_profiles_admin_delete"
on public.volunteer_profiles for delete
to authenticated
using (public.is_admin());

create policy "volunteer_skills_select_authenticated"
on public.volunteer_skills for select
to authenticated
using (true);

create policy "volunteer_skills_admin_insert"
on public.volunteer_skills for insert
to authenticated
with check (public.is_admin());

create policy "volunteer_skills_admin_update"
on public.volunteer_skills for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "volunteer_skills_admin_delete"
on public.volunteer_skills for delete
to authenticated
using (public.is_admin());

create policy "volunteer_profile_skills_select_self_or_admin"
on public.volunteer_profile_skills for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.volunteer_profiles vp
    where vp.id = volunteer_profile_skills.volunteer_profile_id
      and vp.user_id = auth.uid()
  )
);

create policy "volunteer_profile_skills_admin_insert"
on public.volunteer_profile_skills for insert
to authenticated
with check (public.is_admin());

create policy "volunteer_profile_skills_admin_update"
on public.volunteer_profile_skills for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "volunteer_profile_skills_admin_delete"
on public.volunteer_profile_skills for delete
to authenticated
using (public.is_admin());

create policy "volunteer_tasks_select_admin_or_assigned_volunteer"
on public.volunteer_tasks for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.volunteer_task_assignments vta
    where vta.task_id = volunteer_tasks.id
      and vta.volunteer_id = auth.uid()
  )
);

create policy "volunteer_tasks_admin_insert"
on public.volunteer_tasks for insert
to authenticated
with check (public.is_admin() and created_by = auth.uid());

create policy "volunteer_tasks_admin_update"
on public.volunteer_tasks for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "volunteer_tasks_admin_delete"
on public.volunteer_tasks for delete
to authenticated
using (public.is_admin());

create policy "volunteer_task_assignments_select_admin_or_self"
on public.volunteer_task_assignments for select
to authenticated
using (public.is_admin() or volunteer_id = auth.uid());

create policy "volunteer_task_assignments_admin_insert"
on public.volunteer_task_assignments for insert
to authenticated
with check (public.is_admin());

create policy "volunteer_task_assignments_admin_update"
on public.volunteer_task_assignments for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "volunteer_task_assignments_volunteer_status_update"
on public.volunteer_task_assignments for update
to authenticated
using (volunteer_id = auth.uid())
with check (
  volunteer_id = auth.uid()
  and status in ('IN_PROGRESS', 'COMPLETED', 'CANCELLED')
);

create policy "volunteer_task_assignments_admin_delete"
on public.volunteer_task_assignments for delete
to authenticated
using (public.is_admin());

create policy "registrations_select_admin_staff_or_self"
on public.registrations for select
to authenticated
using (
  public.is_admin()
  or participant_id = auth.uid()
  or public.is_competition_assigned(competition_id)
);

create policy "registrations_participant_insert_self"
on public.registrations for insert
to authenticated
with check (
  participant_id = auth.uid()
  and public.current_user_role() = 'PARTICIPANT'
);

create policy "registrations_participant_cancel_self"
on public.registrations for update
to authenticated
using (participant_id = auth.uid())
with check (
  participant_id = auth.uid()
  and status = 'CANCELLED'
);

create policy "registrations_admin_or_organizer_update"
on public.registrations for update
to authenticated
using (public.is_admin() or public.is_competition_organizer(competition_id))
with check (public.is_admin() or public.is_competition_organizer(competition_id));

create policy "registrations_admin_delete"
on public.registrations for delete
to authenticated
using (public.is_admin());

create policy "tickets_select_admin_staff_or_owner"
on public.tickets for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.registrations r
    where r.id = tickets.registration_id
      and (
        r.participant_id = auth.uid()
        or public.is_competition_assigned(r.competition_id)
      )
  )
);

create policy "tickets_admin_insert"
on public.tickets for insert
to authenticated
with check (public.is_admin());

create policy "tickets_admin_or_assigned_staff_update"
on public.tickets for update
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.registrations r
    where r.id = tickets.registration_id
      and public.is_competition_assigned(r.competition_id)
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.registrations r
    where r.id = tickets.registration_id
      and public.is_competition_assigned(r.competition_id)
  )
);

create policy "tickets_admin_delete"
on public.tickets for delete
to authenticated
using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "event_images_public_read"
on storage.objects for select
to public
using (bucket_id = 'images');

create policy "event_images_admin_upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'images'
  and owner = auth.uid()
  and public.is_admin()
);

create policy "event_images_admin_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'images'
  and owner = auth.uid()
  and public.is_admin()
)
with check (
  bucket_id = 'images'
  and owner = auth.uid()
  and public.is_admin()
);

create policy "event_images_admin_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'images'
  and owner = auth.uid()
  and public.is_admin()
);
