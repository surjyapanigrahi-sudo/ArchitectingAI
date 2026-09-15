import "server-only";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { productionPart1Lessons } from "@/modules/learning-experience/data/part-1-lessons";
import type { DashboardData, DashboardLesson } from "./types";
import { calculateProgress } from "@/modules/progress/calculations";

const workshopHref = "/workshops/enterprise-ai-foundations";
const assessmentHref = `${workshopHref}/part-1-assessment`;

type ProgressRow = { lesson_id: string; experience_id: string; status: string };
type AttemptRow = { score_percent: number | null; correct_count: number | null; passed: boolean | null; status: string; submitted_at: string | null; started_at: string };
type CurrentRow = { current_lesson_id: string; current_experience_id: string; last_activity_at: string };
type CertificateRow = { certificate_reference: string; score_percent: number; issued_at: string };

function lessonNumberFromId(id: string) { return Number(id.match(/lesson-(\d+)/)?.[1] ?? 0); }
function experienceNumberFromId(id: string) { return Number(id.match(/experience-(\d+)/)?.[1] ?? 0); }

export async function getDashboardData(user: User | { id: "dev-user"; name: string }): Promise<DashboardData> {
  let progressRows: ProgressRow[] = [];
  let current: CurrentRow | null = null;
  let attempts: AttemptRow[] = [];
  let certificate: CertificateRow | null = null;
  let profileName: string | null = null;

  if (user.id !== "dev-user") {
    const supabase = await createClient();
    const [progressResult, currentResult, attemptsResult, certificateResult, profileResult] = await Promise.all([
      supabase.from("experience_progress").select("lesson_id,experience_id,status").eq("user_id", user.id),
      supabase.from("learner_course_progress").select("current_lesson_id,current_experience_id,last_activity_at").eq("user_id", user.id).eq("workshop_id", "enterprise-ai-foundations").maybeSingle(),
      supabase.from("assessment_attempts").select("score_percent,correct_count,passed,status,submitted_at,started_at").eq("user_id", user.id).eq("part_id", "part-1").order("started_at", { ascending: false }),
      supabase.from("certificates").select("certificate_reference,score_percent,issued_at").eq("user_id", user.id).eq("part_id", "part-1").eq("status", "valid").maybeSingle(),
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    ]);
    progressRows = (progressResult.data ?? []) as ProgressRow[];
    current = currentResult.data as CurrentRow | null;
    attempts = (attemptsResult.data ?? []) as AttemptRow[];
    certificate = certificateResult.data as CertificateRow | null;
    profileName = typeof profileResult.data?.full_name === "string" ? profileResult.data.full_name.trim() || null : null;
  }

  const completedIds = new Set(progressRows.filter((row) => row.status === "completed").map((row) => `${row.lesson_id}:${row.experience_id}`));
  const lessons: DashboardLesson[] = productionPart1Lessons.map((lesson, index) => {
    const completedCount = lesson.experiences.filter((experience) => completedIds.has(`${lesson.id}:${experience.id}`)).length;
    return { id: lesson.id, number: index + 1, title: lesson.title, href: `${workshopHref}/${lesson.slug}`, experienceCount: lesson.experiences.length, ...calculateProgress(completedCount, lesson.experiences.length) };
  });
  const completedCount = lessons.reduce((total, lesson) => total + lesson.completedCount, 0);
  const experienceCount = lessons.reduce((total, lesson) => total + lesson.experienceCount, 0);
  const submitted = attempts.filter((attempt) => attempt.status === "submitted" && attempt.score_percent !== null);
  const passed = submitted.filter((attempt) => attempt.passed === true);
  const assessmentScore = submitted.length ? Math.max(...submitted.map((attempt) => attempt.score_percent!)) : null;
  const assessmentStatus = passed.length ? "Passed" : submitted.length ? "Not Passed" : attempts.length ? "In Progress" : "Not Attempted";
  const currentLesson = current ? lessons.find((lesson) => lesson.id === current.current_lesson_id) : null;
  const currentExperienceValid = currentLesson && productionPart1Lessons.find((lesson) => lesson.id === currentLesson.id)?.experiences.some((experience) => experience.id === current?.current_experience_id);
  const activeLesson = currentLesson?.status === "in-progress" && currentExperienceValid ? currentLesson : lessons.find((lesson) => lesson.status === "in-progress");
  const nextLesson = activeLesson ?? lessons.find((lesson) => lesson.status !== "completed");
  const currentExperienceId = nextLesson && current?.current_lesson_id === nextLesson.id && currentExperienceValid ? current.current_experience_id : nextLesson ? productionPart1Lessons.find((lesson) => lesson.id === nextLesson.id)?.experiences.find((experience) => !completedIds.has(`${nextLesson.id}:${experience.id}`))?.id ?? null : null;
  const currentExperienceNumber = nextLesson && currentExperienceId ? (productionPart1Lessons.find((lesson) => lesson.id === nextLesson.id)?.experiences.findIndex((experience) => experience.id === currentExperienceId) ?? -1) + 1 : 0;
  const continueAction = nextLesson
    ? { label: nextLesson.status === "not-started" ? "Start Learning" : "Continue Learning", href: `/dashboard?lesson=${nextLesson.number}`, detail: `Lesson ${nextLesson.number} · Experience ${Math.max(currentExperienceNumber, 1)}` }
    : assessmentStatus !== "Passed"
      ? { label: "Take Part 1 Assessment", href: assessmentHref, detail: "All Part 1 learning experiences completed" }
      : { label: "View Certificate", href: `${assessmentHref}?view=certificate`, detail: "Part 1 complete · No future Part published" };
  const metadataName = "user_metadata" in user && typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name.trim() : "";
  const learnerName = profileName ?? (("name" in user ? user.name : metadataName) || "Learner");
  const latestSubmitted = submitted[0];

  return {
    learnerName,
    lessons,
    completedCount,
    experienceCount,
    overallPercent: experienceCount ? Math.round((completedCount / experienceCount) * 100) : 0,
    lastActivity: current ? { lessonNumber: lessonNumberFromId(current.current_lesson_id), experienceNumber: experienceNumberFromId(current.current_experience_id), occurredAt: current.last_activity_at } : null,
    continueAction,
    resume: nextLesson ? { kind: "lesson", lessonId: nextLesson.id, experienceId: currentExperienceId } : { kind: "assessment", showCertificate: assessmentStatus === "Passed" && Boolean(certificate) },
    assessment: { status: assessmentStatus, score: assessmentScore, attemptCount: attempts.length, href: assessmentHref, latestResult: latestSubmitted?.submitted_at && latestSubmitted.score_percent !== null && latestSubmitted.correct_count !== null && latestSubmitted.passed !== null ? { scorePercent: latestSubmitted.score_percent, correctCount: latestSubmitted.correct_count, passed: latestSubmitted.passed, submittedAt: latestSubmitted.submitted_at } : null },
    certificate: { earned: Boolean(certificate), reference: certificate?.certificate_reference ?? null, score: certificate?.score_percent ?? null, issuedAt: certificate?.issued_at ?? null, href: `${assessmentHref}?view=certificate`, verifyHref: certificate ? `/verify-certificate?reference=${encodeURIComponent(certificate.certificate_reference)}` : null },
  };
}

export async function getLessonResume(userId: string, lessonId: string, experienceIds: string[]) {
  if (userId === "dev-user") return { completedExperienceIds: [] as string[], currentExperienceId: null as string | null, hasActivity: false };
  const supabase = await createClient();
  const [{ data: rows }, { data: course }] = await Promise.all([
    supabase.from("experience_progress").select("experience_id,status").eq("user_id", userId).eq("lesson_id", lessonId),
    supabase.from("learner_course_progress").select("current_lesson_id,current_experience_id").eq("user_id", userId).eq("workshop_id", "enterprise-ai-foundations").maybeSingle(),
  ]);
  const completedExperienceIds = (rows ?? []).filter((row) => row.status === "completed" && experienceIds.includes(row.experience_id)).map((row) => row.experience_id as string);
  const persistedCurrent = course?.current_lesson_id === lessonId && experienceIds.includes(course.current_experience_id) ? course.current_experience_id as string : null;
  const currentExperienceId = persistedCurrent ?? experienceIds.find((id) => !completedExperienceIds.includes(id)) ?? experienceIds[experienceIds.length - 1] ?? null;
  return { completedExperienceIds, currentExperienceId, hasActivity: Boolean((rows ?? []).length || persistedCurrent) };
}
