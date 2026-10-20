-- Relay: authenticated, explicitly shared project documents.
create table public.relay_projects (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 100),
 payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 1500000),
 version integer not null default 1 check (version > 0),
 updated_at timestamptz not null default now()
);
create index relay_projects_owner_idx on public.relay_projects(owner_id);
create table public.relay_members (
 project_id uuid not null references public.relay_projects(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check (role in ('viewer','editor')),
 primary key(project_id,user_id)
);
create index relay_members_user_idx on public.relay_members(user_id);
create table public.relay_comments (
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.relay_projects(id) on delete cascade,
 author_id uuid not null references auth.users(id) on delete cascade,
 body text not null check (char_length(body) between 1 and 4000),
 created_at timestamptz not null default now()
);
create index relay_comments_project_idx on public.relay_comments(project_id,created_at);
-- Narrow helper avoids recursive RLS. No client-supplied user identity.
create function public.relay_role(target uuid) returns text
 language sql stable security definer set search_path = ''
 as $$
 select case when p.owner_id = (select auth.uid()) then 'owner'
 else (select m.role from public.relay_members m where m.project_id = p.id and m.user_id = (select auth.uid())) end
 from public.relay_projects p where p.id = target
 $$;
revoke all on function public.relay_role(uuid) from public, anon;
grant execute on function public.relay_role(uuid) to authenticated;
create function public.relay_version_guard() returns trigger
 language plpgsql security invoker set search_path = ''
 as $$
 begin
 if new.owner_id <> old.owner_id or new.id <> old.id then raise exception 'Project identity cannot be changed'; end if;
 if new.version <> old.version + 1 then raise exception 'Save requires the next project version'; end if;
 new.updated_at = now();
 return new;
 end
 $$;
revoke all on function public.relay_version_guard() from public, anon, authenticated;
create trigger relay_version_guard before update on public.relay_projects for each row execute function public.relay_version_guard();
alter table public.relay_projects enable row level security;
alter table public.relay_members enable row level security;
alter table public.relay_comments enable row level security;
revoke all on public.relay_projects,public.relay_members,public.relay_comments from anon, authenticated;
grant select,insert,delete on public.relay_projects to authenticated;
grant update(name,payload,version) on public.relay_projects to authenticated;
grant select,insert,delete on public.relay_members to authenticated;
grant select,insert,delete on public.relay_comments to authenticated;
create policy projects_read on public.relay_projects for select to authenticated using (public.relay_role(id) is not null);
create policy projects_create on public.relay_projects for insert to authenticated with check (owner_id = (select auth.uid()) and version = 1);
create policy projects_edit on public.relay_projects for update to authenticated using (public.relay_role(id) in ('owner','editor')) with check (public.relay_role(id) in ('owner','editor'));
create policy projects_delete on public.relay_projects for delete to authenticated using (owner_id = (select auth.uid()));
create policy members_read on public.relay_members for select to authenticated using (user_id = (select auth.uid()) or public.relay_role(project_id) = 'owner');
create policy members_create on public.relay_members for insert to authenticated with check (public.relay_role(project_id) = 'owner' and user_id <> (select auth.uid()));
create policy members_remove on public.relay_members for delete to authenticated using (public.relay_role(project_id) = 'owner' or user_id = (select auth.uid()));
create policy comments_read on public.relay_comments for select to authenticated using (public.relay_role(project_id) is not null);
create policy comments_create on public.relay_comments for insert to authenticated with check (author_id = (select auth.uid()) and public.relay_role(project_id) in ('owner','editor'));
create policy comments_remove on public.relay_comments for delete to authenticated using (author_id = (select auth.uid()) or public.relay_role(project_id) = 'owner');
