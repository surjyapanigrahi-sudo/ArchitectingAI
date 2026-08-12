import { notFound } from "next/navigation";
import { demoLearningExperience } from "@/modules/learning-experience/data/demo-learning-experience";
import { LearningWorkspace } from "@/modules/learning-experience/components/learning-workspace";
import { enterpriseAiFoundations } from "@/modules/workshops/enterprise-ai-foundations";
import { getDevelopmentAuthContext } from "@/modules/auth/development-auth";
import { lesson1Block1 } from "@/modules/learning-experience/data/lesson-1-block-1";

const lessons = [demoLearningExperience, lesson1Block1];

export default async function LessonPage({ params }: { params: Promise<{ workshopSlug: string; lessonSlug: string }> }) {
  const { workshopSlug, lessonSlug } = await params;
  const lesson = lessons.find((item) => item.slug === lessonSlug);
  if (workshopSlug !== enterpriseAiFoundations.slug || !lesson) notFound();
  const developmentAuth = getDevelopmentAuthContext();
  return <LearningWorkspace lesson={lesson} workshopTitle={enterpriseAiFoundations.title} developmentLearnerName={developmentAuth.user?.name} />;
}
