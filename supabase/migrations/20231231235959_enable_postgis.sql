-- Local Supabase Postgres bundles postgis but doesn't enable it by default; the original
-- docker-compose setup used the postgis/postgis image which installs it into public automatically.
create extension if not exists postgis with schema public;
