PROFILE

create table public.profiles (
  id uuid not null,
  email text not null,
  full_name text null,
  phone_number text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_email_key unique (email),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_profiles_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION update_updated_at ();

SESSION

create table public.sessions (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  session_id text not null,
  status text null default 'initializing'::text,
  qr_code text null,
  last_active timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  constraint sessions_pkey primary key (id),
  constraint sessions_session_id_key unique (session_id),
  constraint sessions_user_id_key unique (user_id),
  constraint sessions_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

WHITELIST

create table public.whitelists (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  phone_number text not null,
  name text null,
  notes text null,
  created_at timestamp with time zone null default now(),
  constraint whitelists_pkey primary key (id),
  constraint whitelists_user_id_phone_number_key unique (user_id, phone_number),
  constraint whitelists_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;


KNOWLEDGE BASE

create table public.knowledge_base (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  filename text not null,
  file_path text not null,
  file_size integer null,
  mime_type text null,
  status text null default 'pending'::text,
  chunks_count integer null default 0,
  metadata jsonb null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint knowledge_base_pkey primary key (id),
  constraint knowledge_base_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_knowledge_base_user_id on public.knowledge_base using btree (user_id) TABLESPACE pg_default;

create trigger update_knowledge_base_updated_at BEFORE
update on knowledge_base for EACH row
execute FUNCTION update_updated_at ();

GROUP SETTING

create table public.group_settings (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  group_id text not null,
  group_name text null,
  auto_reply boolean null default true,
  settings jsonb null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint group_settings_pkey primary key (id),
  constraint group_settings_user_id_group_id_key unique (user_id, group_id),
  constraint group_settings_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_group_settings_updated_at BEFORE
update on group_settings for EACH row
execute FUNCTION update_updated_at ();


CHAT LOG

create table public.chat_logs (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  from_number text not null,
  message_body text null,
  encrypted_payload text not null,
  direction text null,
  is_group boolean null default false,
  group_id text null,
  timestamp timestamp with time zone null default now(),
  metadata jsonb null default '{}'::jsonb,
  constraint chat_logs_pkey primary key (id),
  constraint chat_logs_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint chat_logs_direction_check check (
    (
      direction = any (array['incoming'::text, 'outgoing'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_chat_logs_timestamp on public.chat_logs using btree ("timestamp" desc) TABLESPACE pg_default;

create index IF not exists idx_chat_logs_user_id on public.chat_logs using btree (user_id) TABLESPACE pg_default;


BOT CONFIG

create table public.bot_config (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  system_prompt text null default 'You are a helpful AI assistant for a Nigerian business.'::text,
  temperature numeric(2, 1) null default 0.7,
  model text null default 'gemini-pro'::text,
  max_tokens integer null default 1000,
  metadata jsonb null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint bot_config_pkey primary key (id),
  constraint bot_config_user_id_key unique (user_id),
  constraint bot_config_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_bot_config_updated_at BEFORE
update on bot_config for EACH row
execute FUNCTION update_updated_at ();


AUDIT LOGS
create table public.audit_logs (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  action text not null,
  details jsonb null default '{}'::jsonb,
  ip_address inet null,
  user_agent text null,
  created_at timestamp with time zone null default now(),
  constraint audit_logs_pkey primary key (id),
  constraint audit_logs_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_audit_logs_user_id on public.audit_logs using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_audit_logs_created_at on public.audit_logs using btree (created_at desc) TABLESPACE pg_default;