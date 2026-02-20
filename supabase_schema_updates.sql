-- TUTOR REPORTS TABLE
create table public.tutor_reports (
  id text not null primary key,
  user_id uuid references auth.users not null,
  source text not null, -- 'math-tutor' | 'research-center'
  subject text not null,
  emoji text,
  overall_score integer,
  trend text,
  challenges jsonb, -- Array of objects
  recommendations jsonb, -- Array of strings
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RESEARCH REPORTS TABLE
create table public.research_reports (
  id text not null primary key,
  user_id uuid references auth.users not null,
  title text,
  source_text text,
  paraphrased_text text,
  grade integer,
  language text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES
alter table public.tutor_reports enable row level security;
create policy "Users can view own reports" on public.tutor_reports for select using (auth.uid() = user_id);
create policy "Users can insert own reports" on public.tutor_reports for insert with check (auth.uid() = user_id);

alter table public.research_reports enable row level security;
create policy "Users can view own reports" on public.research_reports for select using (auth.uid() = user_id);
create policy "Users can insert own reports" on public.research_reports for insert with check (auth.uid() = user_id);
create policy "Users can update own reports" on public.research_reports for update using (auth.uid() = user_id);
