export type LearningStatus = "not-started" | "in-progress" | "completed";

export interface DashboardLesson {
  id: string;
  number: number;
  title: string;
  href: string;
  completedCount: number;
  experienceCount: number;
  percent: number;
  status: LearningStatus;
}

export interface DashboardData {
  learnerName: string;
  lessons: DashboardLesson[];
  completedCount: number;
  experienceCount: number;
  overallPercent: number;
  lastActivity: { lessonNumber: number; experienceNumber: number; occurredAt: string } | null;
  continueAction: { label: string; href: string; detail: string };
  resume: { kind: "lesson"; lessonId: string; experienceId: string | null } | { kind: "assessment"; showCertificate: boolean };
  assessment: { status: "Not Attempted" | "In Progress" | "Not Passed" | "Passed"; score: number | null; attemptCount: number; href: string; latestResult: { scorePercent: number; correctCount: number; passed: boolean; submittedAt: string } | null };
  certificate: { earned: boolean; reference: string | null; score: number | null; issuedAt: string | null; href: string; verifyHref: string | null };
}
