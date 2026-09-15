import { notFound } from "next/navigation";
import { getDevelopmentAuthContext } from "@/modules/auth/development-auth";
import { LessonFourPreview } from "@/modules/learning-experience/components/lesson-4-preview";

export default function LessonFourPreviewPage() {
  const developmentAuth = getDevelopmentAuthContext();
  if (process.env.NODE_ENV !== "development" && !developmentAuth.bypassEnabled) notFound();
  return <LessonFourPreview developmentPreview />;
}
