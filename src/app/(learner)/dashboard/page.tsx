import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/current-user";
import { PartOneAssessment } from "@/modules/assessment/part-1-assessment";
import { getDashboardData, getLessonResume } from "@/modules/dashboard/dashboard-data";
import { LearnerWorkspaceShell } from "@/modules/dashboard/components/learner-workspace-shell";
import { DashboardLessonWorkspace } from "@/modules/dashboard/components/dashboard-lesson-workspace";
import { part1Lesson1, part1Lesson2, part1Lesson3, productionPart1Lessons } from "@/modules/learning-experience/data/part-1-lessons";
import { enterpriseAiFoundations } from "@/modules/workshops/enterprise-ai-foundations";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ lesson?: string; activity?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const data = await getDashboardData(user);
  const requested = await searchParams;
  const requestedLesson = Number(requested.lesson);
  let resumeActivity = data.resume;
  if (Number.isInteger(requestedLesson) && requestedLesson >= 1 && requestedLesson <= productionPart1Lessons.length) {
    resumeActivity = { kind: "lesson", lessonId: productionPart1Lessons[requestedLesson - 1].id, experienceId: null };
  } else if (requested.activity === "assessment") {
    resumeActivity = { kind: "assessment", showCertificate: false };
  } else if (requested.activity === "certificate" && data.certificate.earned) {
    resumeActivity = { kind: "assessment", showCertificate: true };
  }

  if (resumeActivity.kind === "lesson") {
    const lesson = productionPart1Lessons.find((item) => item.id === resumeActivity.lessonId) ?? part1Lesson1;
    const resume = await getLessonResume(user.id, lesson.id, lesson.experiences.map((item) => item.id));
    const requestedExperienceId = resumeActivity.experienceId ?? resume.currentExperienceId;
    const requestedExperience = lesson.experiences.find((experience) => experience.id === requestedExperienceId);
    const firstIncompleteExperience = lesson.experiences.find((experience) => !resume.completedExperienceIds.includes(experience.id));
    const resolvedExperience = requestedExperience ?? firstIncompleteExperience ?? lesson.experiences.at(-1);
    const currentId = resolvedExperience?.id ?? "";
    const nextLesson = lesson.id === part1Lesson1.id ? { href: `/workshops/${enterpriseAiFoundations.slug}/${part1Lesson2.slug}`, label: "Continue to Lesson 2", takeaway: [] } : lesson.id === part1Lesson2.id ? { href: `/workshops/${enterpriseAiFoundations.slug}/${part1Lesson3.slug}`, label: "Continue to Lesson 3", takeaway: [] } : undefined;
    return <DashboardLessonWorkspace initialData={data} lesson={lesson} workshopTitle={enterpriseAiFoundations.title} nextLesson={nextLesson} persistenceEnabled={user.id !== "dev-user"} initialCompletedExperienceIds={resume.completedExperienceIds} initialCurrentExperienceId={currentId} />;
  }

  const context = <section className="resume-context"><p>Welcome back, <strong>{data.learnerName}</strong></p><span>{data.assessment.status === "Passed" ? "Part 1 completed" : "Continue Learning: Part 1 Assessment"}</span><small>{data.completedCount} of {data.experienceCount} learning experiences completed · {data.overallPercent}%</small></section>;
  const content = <PartOneAssessment learnerName={data.learnerName} initialCertificate={data.certificate.earned ? { certificateReference: data.certificate.reference!, scorePercent: data.certificate.score!, issuedAt: data.certificate.issuedAt! } : null} initialResult={data.assessment.latestResult} persistenceEnabled={user.id !== "dev-user"} showCertificateInitially={resumeActivity.showCertificate} />;
  return <LearnerWorkspaceShell data={data}>{context}<div className="resumable-learning-content">{content}</div></LearnerWorkspaceShell>;
}
