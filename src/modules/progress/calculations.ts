import type { LearningStatus } from "@/modules/dashboard/types";

export function calculateProgress(completedCount: number, experienceCount: number) {
  const boundedCompleted = Math.min(Math.max(completedCount, 0), experienceCount);
  const status: LearningStatus = boundedCompleted === 0 ? "not-started" : boundedCompleted >= experienceCount ? "completed" : "in-progress";
  return { completedCount: boundedCompleted, percent: experienceCount ? Math.round((boundedCompleted / experienceCount) * 100) : 0, status };
}
