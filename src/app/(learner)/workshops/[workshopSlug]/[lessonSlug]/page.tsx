import { notFound, redirect } from "next/navigation";
import { demoLearningExperience } from "@/modules/learning-experience/data/demo-learning-experience";
import { LearningWorkspace } from "@/modules/learning-experience/components/learning-workspace";
import { LessonFourPreview } from "@/modules/learning-experience/components/lesson-4-preview";
import { enterpriseAiFoundations } from "@/modules/workshops/enterprise-ai-foundations";
import { getDevelopmentAuthContext } from "@/modules/auth/development-auth";
import { part1Lesson1, part1Lesson2, part1Lesson3, part1Lesson4, productionPart1Lessons } from "@/modules/learning-experience/data/part-1-lessons";
import { getCurrentUser } from "@/modules/auth/current-user";
import { getDashboardData, getLessonResume } from "@/modules/dashboard/dashboard-data";

const lessons = [demoLearningExperience, ...productionPart1Lessons];

export default async function LessonPage({ params }: { params: Promise<{ workshopSlug: string; lessonSlug: string }> }) {
  const { workshopSlug, lessonSlug } = await params;
  if (workshopSlug === enterpriseAiFoundations.slug && lessonSlug === "from-ai-solution-to-enterprise-ai-architecture") redirect(`/workshops/${workshopSlug}/${part1Lesson1.slug}`);
  const lesson = lessons.find((item) => item.slug === lessonSlug);
  if (workshopSlug !== enterpriseAiFoundations.slug || !lesson) notFound();
  const developmentAuth = getDevelopmentAuthContext();
  const user = await getCurrentUser();
  const productionLesson = productionPart1Lessons.some((item) => item.id === lesson.id);
  const dashboardData = user && productionLesson ? await getDashboardData(user) : undefined;
  const resume = user && productionLesson ? await getLessonResume(user.id, lesson.id, lesson.experiences.map((item) => item.id)) : { completedExperienceIds: [], currentExperienceId: null, hasActivity: false };
  if (lesson.id === part1Lesson4.id) return <LessonFourPreview learnerName={dashboardData?.learnerName} persistenceEnabled={Boolean(user && user.id !== "dev-user")} initialCompletedExperienceIds={resume.completedExperienceIds} initialCurrentExperienceId={resume.currentExperienceId} />;
  const nextLesson = lesson.id === part1Lesson1.id ? { href: `/workshops/${workshopSlug}/${part1Lesson2.slug}`, label: "Continue to Lesson 2", takeaway: ["You have established the first architectural principle:", "A working AI capability is only one part of an enterprise AI workload.", "Next, you will examine how the major architecture domains work together."] } : lesson.id === part1Lesson2.id ? { href: `/workshops/${workshopSlug}/${part1Lesson3.slug}`, label: "Continue to Lesson 3", takeaway: ["You can now identify the major concerns an Enterprise AI Architect must consider and reason about their relationships and trade-offs.", "Next, you will apply these ideas by designing an enterprise AI workload."] } : lesson.id === part1Lesson3.id ? { href: `/workshops/${workshopSlug}/${part1Lesson4.slug}`, label: "Continue to Lesson 4", takeaway: ["You have designed your first enterprise AI workload.", "Next, build the intelligence layer with foundation models, instructions and enterprise context."] } : undefined;
  return <LearningWorkspace key={lesson.id} lesson={lesson} workshopTitle={enterpriseAiFoundations.title} developmentLearnerName={developmentAuth.user?.name} nextLesson={nextLesson} dashboardData={dashboardData} persistenceEnabled={Boolean(user && user.id !== "dev-user" && productionLesson)} initialCompletedExperienceIds={resume.completedExperienceIds} initialCurrentExperienceId={resume.currentExperienceId} hasPersistedActivity={resume.hasActivity} />;
}
