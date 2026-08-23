export type AssessmentLesson = 1 | 2 | 3;
export type AssessmentDifficulty = "straightforward" | "moderate" | "trade-off";

export interface AssessmentOption { id: string; label: string; }
export interface AssessmentQuestion {
  id: string;
  lesson: AssessmentLesson;
  concept: string;
  difficulty: AssessmentDifficulty;
  prompt: string;
  options: AssessmentOption[];
  correctOptionId: string;
  explanation: string;
}

export interface AttemptQuestion extends Omit<AssessmentQuestion, "options"> { options: AssessmentOption[]; }
export interface PersistentCertificate { certificateReference: string; scorePercent: number; issuedAt: string; }
export interface PersistentAssessmentResult { scorePercent: number; correctCount: number; passed: boolean; submittedAt: string; }
