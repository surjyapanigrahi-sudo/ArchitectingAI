import { notFound, redirect } from "next/navigation";
import { demoLearningExperience } from "@/modules/learning-experience/data/demo-learning-experience";
import { LearningWorkspace } from "@/modules/learning-experience/components/learning-workspace";
import { enterpriseAiFoundations } from "@/modules/workshops/enterprise-ai-foundations";
import { getDevelopmentAuthContext } from "@/modules/auth/development-auth";
import { part1Lesson1, part1Lesson2, part1Lesson3, productionPart1Lessons } from "@/modules/learning-experience/data/part-1-lessons";
import { architectThinkingLesson } from "@/modules/learning-experience/data/architect-thinking-lesson";

const lessons = [demoLearningExperience, ...productionPart1Lessons, architectThinkingLesson];

export default async function LessonPage({ params }: { params: Promise<{ workshopSlug: string; lessonSlug: string }> }) {
  const { workshopSlug, lessonSlug } = await params;
  if (workshopSlug === enterpriseAiFoundations.slug && lessonSlug === "from-ai-solution-to-enterprise-ai-architecture") redirect(`/workshops/${workshopSlug}/${part1Lesson1.slug}`);
  const lesson = lessons.find((item) => item.slug === lessonSlug);
  if (workshopSlug !== enterpriseAiFoundations.slug || !lesson) notFound();
  const developmentAuth = getDevelopmentAuthContext();
  const nextLesson = lesson.id === part1Lesson1.id ? { href: `/workshops/${workshopSlug}/${part1Lesson2.slug}`, label: "Continue to Lesson 2", takeaway: ["You have established the first architectural principle:", "A working AI capability is only one part of an enterprise AI workload.", "Next, you will examine how the major architecture domains work together."] } : lesson.id === part1Lesson2.id ? { href: `/workshops/${workshopSlug}/${part1Lesson3.slug}`, label: "Continue to Lesson 3", takeaway: ["You can now identify the major concerns an Enterprise AI Architect must consider and reason about their relationships and trade-offs.", "Next, you will apply these ideas by designing an enterprise AI workload."] } : lesson.id === part1Lesson3.id ? { href: `/workshops/${workshopSlug}/${architectThinkingLesson.slug}`, label: "Continue Learning", takeaway: ["Part 1 is complete.", "Next, practice making architecture decisions that can be explained and defended."] } : undefined;
  return <LearningWorkspace lesson={lesson} workshopTitle={enterpriseAiFoundations.title} developmentLearnerName={developmentAuth.user?.name} nextLesson={nextLesson} />;
}
