"use client";

import { useCallback, useState } from "react";
import type { DashboardData } from "../types";
import type { LearningLesson } from "@/modules/learning-experience/types";
import { LearningWorkspace, type LearningProgressSnapshot } from "@/modules/learning-experience/components/learning-workspace";
import { calculateProgress } from "@/modules/progress/calculations";
import { LearnerWorkspaceShell } from "./learner-workspace-shell";

export function DashboardLessonWorkspace({ initialData, lesson, workshopTitle, nextLesson, persistenceEnabled, initialCompletedExperienceIds, initialCurrentExperienceId }: { initialData: DashboardData; lesson: LearningLesson; workshopTitle: string; nextLesson?: { href: string; label: string; takeaway: string[] }; persistenceEnabled: boolean; initialCompletedExperienceIds: string[]; initialCurrentExperienceId: string }) {
  const [data, setData] = useState(initialData);
  const updateLiveProgress = useCallback((snapshot: LearningProgressSnapshot) => {
    setData((current) => {
      const validCompleted = new Set(snapshot.completedExperienceIds.filter((id) => lesson.experiences.some((experience) => experience.id === id)));
      const lessonProgress = calculateProgress(validCompleted.size, lesson.experiences.length);
      const lessons = current.lessons.map((item) => item.id === lesson.id ? { ...item, ...lessonProgress } : item);
      const completedCount = lessons.reduce((total, item) => total + item.completedCount, 0);
      return { ...current, lessons, completedCount, overallPercent: current.experienceCount ? Math.round((completedCount / current.experienceCount) * 100) : 0, resume: { kind: "lesson", lessonId: lesson.id, experienceId: snapshot.currentExperienceId } };
    });
  }, [lesson]);
  const lessonProgress = data.lessons.find((item) => item.id === lesson.id);
  const experienceNumber = lesson.experiences.findIndex((experience) => experience.id === (data.resume.kind === "lesson" ? data.resume.experienceId : initialCurrentExperienceId)) + 1;
  const lessonNumber = data.lessons.findIndex((item) => item.id === lesson.id) + 1;

  return <LearnerWorkspaceShell data={data}>
    <section className="resume-context"><p>Welcome back, <strong>{data.learnerName}</strong></p><span>Continue Learning: Lesson {lessonNumber} · Experience {Math.max(experienceNumber, 1)}</span><small>{lessonProgress?.completedCount ?? 0} of {lessonProgress?.experienceCount ?? lesson.experiences.length} experiences completed · {lessonProgress?.percent ?? 0}%</small></section>
    <div className="resumable-learning-content"><LearningWorkspace key={lesson.id} lesson={lesson} workshopTitle={workshopTitle} nextLesson={nextLesson} dashboardData={data} persistenceEnabled={persistenceEnabled} initialCompletedExperienceIds={initialCompletedExperienceIds} initialCurrentExperienceId={initialCurrentExperienceId} hasPersistedActivity onProgressChange={updateLiveProgress} /></div>
  </LearnerWorkspaceShell>;
}
