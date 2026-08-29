create table if not exists public.experience_progress (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  experience_id text not null,
  status text not null check (status in ('in_progress', 'completed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id, experience_id),
  check ((status = 'completed' and completed_at is not null) or status = 'in_progress')
);

create table if not exists public.learner_course_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  workshop_id text not null,
  current_lesson_id text not null,
  current_experience_id text not null,
  last_activity_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, workshop_id)
);

create index if not exists experience_progress_user_updated_idx
  on public.experience_progress(user_id, updated_at desc);

alter table public.experience_progress enable row level security;
alter table public.learner_course_progress enable row level security;

create policy "Learners read own experience progress"
  on public.experience_progress for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learners read own course progress"
  on public.learner_course_progress for select to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.record_part1_experience_progress(
  p_lesson_id text,
  p_experience_id text,
  p_completed boolean default false
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_valid boolean;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;

  v_valid := (p_lesson_id, p_experience_id) in (
    ('part-1-lesson-1-why-enterprise-ai-architecture', 'lesson-1-experience-1'),
    ('part-1-lesson-1-why-enterprise-ai-architecture', 'lesson-1-experience-2'),
    ('part-1-lesson-1-why-enterprise-ai-architecture', 'lesson-1-experience-3'),
    ('part-1-lesson-2-understanding-enterprise-ai-architecture', 'lesson-1-experience-4'),
    ('part-1-lesson-2-understanding-enterprise-ai-architecture', 'lesson-1-experience-5'),
    ('part-1-lesson-2-understanding-enterprise-ai-architecture', 'lesson-1-experience-6'),
    ('part-1-lesson-2-understanding-enterprise-ai-architecture', 'lesson-1-experience-7'),
    ('part-1-lesson-2-understanding-enterprise-ai-architecture', 'lesson-1-experience-8'),
    ('part-1-lesson-3-architecting-first-workload', 'lesson-1-experience-9'),
    ('part-1-lesson-3-architecting-first-workload', 'lesson-1-experience-10'),
    ('part-1-lesson-3-architecting-first-workload', 'lesson-1-experience-11'),
    ('part-1-lesson-3-architecting-first-workload', 'lesson-1-experience-12')
  );
  if not v_valid then raise exception 'Unknown Part 1 lesson or experience'; end if;

  insert into public.experience_progress(user_id, lesson_id, experience_id, status, completed_at)
  values (v_user_id, p_lesson_id, p_experience_id,
    case when p_completed then 'completed' else 'in_progress' end,
    case when p_completed then now() else null end)
  on conflict (user_id, lesson_id, experience_id) do update set
    status = case when experience_progress.status = 'completed' or excluded.status = 'completed' then 'completed' else 'in_progress' end,
    completed_at = coalesce(experience_progress.completed_at, excluded.completed_at),
    updated_at = now();

  insert into public.learner_course_progress(user_id, workshop_id, current_lesson_id, current_experience_id, last_activity_at)
  values (v_user_id, 'enterprise-ai-foundations', p_lesson_id, p_experience_id, now())
  on conflict (user_id, workshop_id) do update set
    current_lesson_id = excluded.current_lesson_id,
    current_experience_id = excluded.current_experience_id,
    last_activity_at = excluded.last_activity_at,
    updated_at = now();
end;
$$;

revoke all on function public.record_part1_experience_progress(text, text, boolean) from public, anon;
grant execute on function public.record_part1_experience_progress(text, text, boolean) to authenticated;
