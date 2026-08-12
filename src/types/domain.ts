export type EntityId = string;
export type ISODateTime = string;

export interface User { id: EntityId; email: string; createdAt: ISODateTime; }
export interface UserProfile { userId: EntityId; displayName: string; role?: string; organization?: string; }

export interface Platform { id: EntityId; title: string; programs: Program[]; }
export interface Program { id: EntityId; title: string; workshopIds: EntityId[]; }
export interface Workshop { id: EntityId; slug: string; title: string; summary: string; missionIds: EntityId[]; status: "draft" | "published" | "archived"; }
export interface Mission { id: EntityId; workshopId: EntityId; title: string; summary: string; experienceIds: EntityId[]; order: number; }
export interface LearningExperience { id: EntityId; missionId: EntityId; title: string; activityIds: EntityId[]; estimatedMinutes?: number; }
export interface Activity { id: EntityId; experienceId: EntityId; type: "reading" | "interactive" | "quiz" | "assignment" | "diagram"; title: string; resourceIds: EntityId[]; }
export interface LearningResource { id: EntityId; kind: "markdown" | "mdx" | "json" | "link" | "media" | "diagram"; title: string; uri: string; metadata?: Record<string, string>; }

export interface Quiz { id: EntityId; title: string; questionIds: EntityId[]; passingScore?: number; }
export interface QuizQuestion { id: EntityId; prompt: string; type: "single-choice" | "multiple-choice" | "free-text"; options?: string[]; correctOptionIndexes?: number[]; explanation?: string; }
export interface Assignment { id: EntityId; title: string; brief: string; rubric?: string[]; }
export interface AssignmentSubmission { id: EntityId; assignmentId: EntityId; userId: EntityId; submittedAt: ISODateTime; content: string; status: "draft" | "submitted" | "reviewed"; }

export interface ArchitectureScenario { id: EntityId; title: string; description: string; nodeIds: EntityId[]; relationshipIds: EntityId[]; }
export interface ArchitectureNode { id: EntityId; domainId: EntityId; label: string; description: string; capability: string; crossCutting?: boolean; }
export interface ArchitectureRelationship { id: EntityId; sourceNodeId: EntityId; targetNodeId: EntityId; type: "depends-on" | "feeds" | "governs" | "observes" | "orchestrates" | "retrieves-from"; label?: string; bidirectional?: boolean; }
export interface ArchitectureReview { id: EntityId; scenarioId: EntityId; submissionId?: EntityId; reviewer: "human" | "ai"; findings: string[]; recommendations: string[]; createdAt: ISODateTime; }

export interface LearningProgress { userId: EntityId; experienceId: EntityId; status: "not-started" | "in-progress" | "completed"; percentComplete: number; updatedAt: ISODateTime; }
export interface Certificate { id: EntityId; userId: EntityId; workshopId: EntityId; issuedAt: ISODateTime; verificationCode: string; }
export interface Note { id: EntityId; userId: EntityId; targetType: "workshop" | "mission" | "experience" | "activity"; targetId: EntityId; body: string; updatedAt: ISODateTime; }
