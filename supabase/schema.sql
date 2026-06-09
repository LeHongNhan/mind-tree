-- ================================================
-- Mind Tree - Supabase Schema
-- Chạy file này trong Supabase SQL Editor
-- ================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------
-- PROFILES (Admin role)
-- ------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'viewer');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------
-- TREES
-- ------------------------------------------------
create table if not exists public.trees (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  owner_id uuid references auth.users on delete set null,
  is_public boolean not null default true,
  color text default '#6366f1',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ------------------------------------------------
-- NODES
-- ------------------------------------------------
create table if not exists public.nodes (
  id uuid primary key default uuid_generate_v4(),
  tree_id uuid references public.trees on delete cascade not null,
  parent_id uuid references public.nodes on delete cascade,
  title text not null,
  note_content jsonb,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  position_x float default 0,
  position_y float default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ------------------------------------------------
-- CROSS-TREE LINKS
-- ------------------------------------------------
create table if not exists public.node_links (
  id uuid primary key default uuid_generate_v4(),
  source_node_id uuid references public.nodes on delete cascade not null,
  target_node_id uuid references public.nodes on delete cascade not null,
  label text,
  created_at timestamptz default now(),
  unique(source_node_id, target_node_id)
);

-- ------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------

-- Profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Trees
alter table public.trees enable row level security;
create policy "Public trees visible to all" on public.trees for select using (is_public = true);
create policy "Admins can do all on trees" on public.trees for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Nodes
alter table public.nodes enable row level security;
create policy "Nodes of public trees visible to all" on public.nodes for select using (
  exists (select 1 from public.trees t where t.id = tree_id and t.is_public = true)
);
create policy "Admins can do all on nodes" on public.nodes for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Node links
alter table public.node_links enable row level security;
create policy "Links visible if source node is public" on public.node_links for select using (
  exists (
    select 1 from public.nodes n
    join public.trees t on t.id = n.tree_id
    where n.id = source_node_id and t.is_public = true
  )
);
create policy "Admins can do all on node_links" on public.node_links for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ------------------------------------------------
-- REALTIME
-- ------------------------------------------------
drop publication if exists supabase_realtime;
create publication supabase_realtime for table public.trees, public.nodes, public.node_links;

-- ------------------------------------------------
-- HELPER: Set admin role
-- Run this after creating your admin account:
-- update public.profiles set role = 'admin' where id = '<your-user-uuid>';
-- ------------------------------------------------
