create type public.app_role as enum ('admin', 'user');
create type public.article_status as enum ('review', 'published', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant select on public.profiles to anon;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Profiles are public" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.admin_exists()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where role = 'admin')
$$;
grant execute on function public.admin_exists() to anon, authenticated;

create or replace function public.claim_first_admin()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  perform pg_advisory_xact_lock(4242);
  if exists (select 1 from public.user_roles where role = 'admin') then return false; end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin');
  return true;
end $$;
revoke execute on function public.claim_first_admin() from anon, public;
grant execute on function public.claim_first_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  body text not null default '',
  category text not null default 'World',
  cover_url text,
  status article_status not null default 'review',
  featured boolean not null default false,
  author_id uuid,
  author_name text,
  created_at timestamptz not null default now(),
  published_at timestamptz
);
create index articles_status_pub on public.articles (status, published_at desc);
grant select on public.articles to anon;
grant select, insert, update, delete on public.articles to authenticated;
grant all on public.articles to service_role;
alter table public.articles enable row level security;
create policy "Published articles are public" on public.articles for select using (status = 'published');
create policy "Authors read own" on public.articles for select to authenticated using (auth.uid() = author_id);
create policy "Admins read all" on public.articles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Authors insert own in review" on public.articles for insert to authenticated
  with check (auth.uid() = author_id and (status = 'review' or public.has_role(auth.uid(), 'admin')));
create policy "Authors update own in review" on public.articles for update to authenticated
  using (auth.uid() = author_id and status <> 'published')
  with check (auth.uid() = author_id and status = 'review');
create policy "Admins update all" on public.articles for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Authors delete own" on public.articles for delete to authenticated using (auth.uid() = author_id);
create policy "Admins delete all" on public.articles for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

insert into public.articles (slug, title, summary, body, category, cover_url, status, featured, author_name, published_at) values
('city-council-approves-green-transit-plan', 'City council approves sweeping green transit plan', 'A ten-year plan will add 40 km of tram lines and electrify every bus by 2032.', E'The city council voted 31 to 9 on Tuesday to approve a ten-year transit plan.\n\nThe plan adds 40 kilometres of new tram lines and replaces the diesel bus fleet with electric vehicles by 2032.\n\nOpponents questioned the cost, estimated at 2.1 billion euros.', 'Politics', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&q=80', 'published', true, 'Newsroom', now() - interval '1 hour'),
('markets-rally-as-inflation-cools', 'Markets rally as inflation cools for third month', 'Stocks climbed across Europe after new figures showed prices rising at the slowest pace in two years.', E'European markets closed higher on Wednesday.\n\nAnalysts said the figures make a rate cut more likely before the end of the year.', 'Business', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80', 'published', true, 'Newsroom', now() - interval '3 hours'),
('researchers-unveil-low-cost-battery', 'Researchers unveil low-cost sodium battery', 'A university team says its new cell could cut home storage costs by half.', E'The team published its results in a peer-reviewed journal this week.\n\nThe battery uses sodium instead of lithium, which is cheaper and easier to source.', 'Science', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1600&q=80', 'published', true, 'Newsroom', now() - interval '6 hours'),
('national-team-books-final-spot', 'National team books its place in the final', 'A late header sealed a 2–1 win in front of a sold-out stadium.', E'The winning goal came in the 88th minute.\n\nThe final will be played on Sunday.', 'Sports', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&q=80', 'published', true, 'Newsroom', now() - interval '9 hours'),
('summit-ends-with-climate-pledge', 'Summit ends with new regional climate pledge', 'Leaders agreed to shared targets for cutting emissions by 2035.', E'The two-day summit closed with a joint statement.\n\nCampaigners welcomed the pledge but said details were missing.', 'World', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80', 'published', false, 'Newsroom', now() - interval '1 day'),
('film-festival-announces-lineup', 'Film festival announces its biggest lineup yet', 'More than 200 films from 60 countries will screen over ten days.', E'Organisers revealed the programme on Monday.\n\nTickets go on sale next week.', 'Culture', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=80', 'published', false, 'Newsroom', now() - interval '2 days');