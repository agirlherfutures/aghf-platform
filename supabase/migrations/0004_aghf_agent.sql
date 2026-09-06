-- 0004_aghf_agent.sql — A Girl & Her Futures™
--
-- Adds the AGHF Agent conversational-AI feature: agent_conversations,
-- agent_messages, agent_attachments, agent_memory, agent_actions.
-- Purely additive — does not alter, rename, or drop any existing table
-- (including all 6 psychology_* tables from 0003, which stay exactly as
-- they are and back the agent's contextually-launched tools: Pre-Trade
-- Check, Post-Loss Reset, Cooldown Timer, Scenario Lab, Playbook).
-- psychology_patterns needs NO schema change here — its existing columns
-- already are the pattern-card data model this feature needs; the new
-- pattern engine just starts writing rows into it (see
-- agihf/api/_lib/agent-pattern-engine.js) and populating the
-- previously-always-null ai_interpretation column.
--
-- HOW TO APPLY: this sandbox has no Supabase credentials, so this file
-- could not be run automatically. Paste into the Supabase SQL editor (or
-- `supabase db push`) alongside 0001-0003 before the AGHF Agent's
-- persistence will work. Until applied, the new agent-*.js API endpoints
-- fail with a clear "relation does not exist" error surfaced in the UI,
-- same pattern as every existing endpoint.

create table if not exists agent_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  response_mode text not null default 'coach_me'
    check (response_mode in ('quick_answer', 'coach_me', 'analyze_data', 'challenge_me', 'teach_me', 'build_plan')),
  save_status text not null default 'saved' check (save_status in ('saved', 'one_time')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists agent_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references agent_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,   -- denormalized so tools can scope directly without a join
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null default '',
  structured_component_data jsonb,             -- belief_check/urge_check/etc. payload + the member's saved answer, if any
  attached_record_refs jsonb not null default '[]',   -- [{type:'trade', id:'...'}]
  tool_calls jsonb not null default '[]',
  tool_results jsonb not null default '[]',
  sources jsonb not null default '[]',          -- [{type:'lesson'|'concept', id, title}]
  feedback text check (feedback in ('up', 'down')),
  created_at timestamptz not null default now()
);

create table if not exists agent_attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references agent_conversations(id) on delete cascade,
  message_id uuid references agent_messages(id) on delete cascade,
  type text not null check (type in ('trade', 'journal', 'checklist', 'screenshot', 'week', 'date_range')),
  trade_id uuid references journal_entries(id) on delete set null,
  journal_id uuid references journal_entries(id) on delete set null,
  checklist_id uuid references trade_checklists(id) on delete set null,
  secure_file_ref text,        -- storage path (screenshot only) — never a public URL
  metadata jsonb not null default '{}',   -- {from,to} for date_range, filename/size/mime for screenshot, etc.
  created_at timestamptz not null default now()
);

create table if not exists agent_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in
    ('coaching_style', 'current_focus', 'confirmed_trigger', 'walk_away_rule', 'if_then_rule',
     'reset_routine', 'playbook_reference', 'confirmed_pattern', 'goal')),
  content text not null,
  source_conversation_id uuid references agent_conversations(id) on delete set null,
  member_approved boolean not null default false,
  active boolean not null default true,    -- soft "disable this memory" toggle without deleting it
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references agent_conversations(id) on delete cascade,
  action_type text not null check (action_type in
    ('create_if_then_rule', 'add_playbook_insight', 'update_current_focus', 'create_practice_plan', 'save_conversation_summary')),
  preview_payload jsonb not null default '{}',
  approval_status text not null default 'preview'
    check (approval_status in ('preview', 'approved', 'declined', 'executed', 'expired')),
  execution_result jsonb,
  created_at timestamptz not null default now(),
  executed_at timestamptz
);

create index if not exists idx_agent_conversations_user_updated on agent_conversations(user_id, updated_at desc);
create index if not exists idx_agent_messages_conversation_created on agent_messages(conversation_id, created_at asc);
create index if not exists idx_agent_messages_user_created on agent_messages(user_id, created_at desc);
create index if not exists idx_agent_attachments_user_created on agent_attachments(user_id, created_at desc);
create index if not exists idx_agent_attachments_conversation on agent_attachments(conversation_id);
create index if not exists idx_agent_memory_user_active on agent_memory(user_id, active);
create index if not exists idx_agent_actions_user_created on agent_actions(user_id, created_at desc);

-- RLS as defense-in-depth, same rationale as 0001/0003: every API endpoint
-- already scopes queries to the JWT-verified user.id via the service-role
-- key, so this is a second layer, not the only enforcement.
alter table agent_conversations enable row level security;
alter table agent_messages enable row level security;
alter table agent_attachments enable row level security;
alter table agent_memory enable row level security;
alter table agent_actions enable row level security;

create policy "Users manage their own agent conversations" on agent_conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own agent messages" on agent_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own agent attachments" on agent_attachments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own agent memory" on agent_memory
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own agent actions" on agent_actions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
