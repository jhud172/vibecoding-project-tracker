create schema if not exists relay_private;
revoke all on schema relay_private from public, anon;
grant usage on schema relay_private to authenticated;
alter function public.relay_role(uuid) set schema relay_private;
create index relay_comments_author_idx on public.relay_comments(author_id);
