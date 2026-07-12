-- chat_messages: public group chat for roommate seekers
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  sender_name text not null,
  sender_college text not null,
  message text not null check (char_length(message) <= 500),
  room_id text not null default 'general'
);

-- index for fast room queries
create index if not exists chat_messages_room_created on public.chat_messages (room_id, created_at desc);

-- enable row level security
alter table public.chat_messages enable row level security;

-- anyone can read messages
create policy "Anyone can read chat messages"
  on public.chat_messages for select
  using (true);

-- anyone can insert messages (no auth required for students)
create policy "Anyone can send chat messages"
  on public.chat_messages for insert
  with check (char_length(message) > 0 and char_length(sender_name) > 0);

-- enable realtime for this table
alter publication supabase_realtime add table public.chat_messages;
