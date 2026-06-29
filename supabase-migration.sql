-- Supabase migration for content_sections, blog_posts, notes, and metrics
-- Run this in your Supabase SQL editor or via supabase CLI.

create table if not exists content_sections (
  id bigint generated always as identity primary key,
  type text not null unique,
  title text not null,
  body text not null,
  created_at timestamp with time zone default now()
);

create unique index if not exists content_sections_type_key on content_sections(type);

create table if not exists blog_posts (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  body text not null,
  published boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists notes (
  id bigint generated always as identity primary key,
  title text not null,
  body text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  body text not null,
  created_at timestamp with time zone default now()
);

create table if not exists page_metrics (
  id bigint generated always as identity primary key,
  page text not null unique,
  views bigint not null default 0,
  updated_at timestamp with time zone default now()
);

insert into content_sections (type, title, body)
values
  ('site_name', 'Divyanshu Rauniyar', 'The name shown in the sidebar and hero section.'),
  ('home', 'Hello, I''m Divyanshu.', 'I build thoughtful software, AI products, and studio-led tooling from Nepal. This section is managed from Supabase.'),
  ('about', 'About me', 'I''m a full-stack developer and AI engineer building deliberate digital experiences. The About page content is controlled by the admin panel.'),
  ('blog', 'Blog', 'A new long-form series on shipping AI products is being drafted. Update this landing copy from the admin dashboard.'),
  ('notes', 'Notes', 'Snippets, commands, cheatsheets, and reading notes will live here. Building the editor first.'),
  ('projects', 'Projects', 'A selection of work and experiments. The introduction text here is controlled by content managed in Supabase.')
on conflict (type) do nothing;

insert into page_metrics (page, views)
values
  ('home', 0),
  ('about', 0),
  ('blog', 0),
  ('notes', 0),
  ('projects', 0)
on conflict (page) do nothing;

-- Create a default admin auth user in Supabase Auth.
-- This cannot be run from the Supabase SQL editor because auth admin functions
-- are not exposed as regular SQL functions in that environment.
-- Instead, create the user via the Supabase dashboard or a service-role API call.
-- Example using supabase-js in a trusted server environment:
--
-- const supabaseAdmin = createClient(
--   process.env.SUPABASE_URL,
--   process.env.SUPABASE_SERVICE_ROLE_KEY
-- );
-- await supabaseAdmin.auth.admin.createUser({
--   email: 'yanshudiv22@gmail.com',
--   password: 'iwillnot_share2008',
--   email_confirm: true,
-- });
