import type { ArchitectureNode, EntityId } from "@/types";

export type ArchitectureLabDifficulty = "guided" | "supported" | "independent";
export type ArchitectureLabRuleType = "required-capability" | "recommended-capability" | "relationship-consideration" | "cross-cutting-capability" | "operational-capability" | "distractor-selected";

export interface ArchitectureLabScenario { id: EntityId; title: string; description: string; context: string; }
export interface ArchitectureLabRequirement { id: EntityId; statement: string; }
export interface ArchitectureLabComponent extends ArchitectureNode { purpose: string; compatibleSlotIds: EntityId[]; }
export interface ArchitectureLabSlot { id: EntityId; label: string; description: string; zone: "flow" | "cross-cutting" | "foundation"; placeholder: string; }
export interface ArchitectureLabPlacement { slotId: EntityId; componentId: EntityId; }
export interface ArchitectureLabReviewRule { id: EntityId; type: ArchitectureLabRuleType; capabilityIds: EntityId[]; strength?: string; consideration?: string; gap?: string; nextQuestion?: string; }
export interface ArchitectureLabFeedback { strengths: string[]; considerations: string[]; gaps: string[]; nextQuestions: string[]; }
export interface ArchitectureLabAttempt { attemptNumber: number; placements: ArchitectureLabPlacement[]; feedback: ArchitectureLabFeedback; }
export interface ArchitectureLabReferenceArchitecture { title: string; summary: string; placements: ArchitectureLabPlacement[]; decisions: string[]; }
export interface ArchitectureLabChallengeOption { id: EntityId; label: string; feedback: string; isStrongest?: boolean; }
export interface ArchitectureLabChallenge { id: EntityId; prompt: string; options: ArchitectureLabChallengeOption[]; }
export interface ArchitectureLabCompletionCriteria { minimumPlacements: number; requiredSlotIds: EntityId[]; }
export interface MatchingPrompt { id: EntityId; label: string; context?: string; matchingItemId: EntityId; }
export interface MatchingItem { id: EntityId; description: string; }
export interface MatchingResponse { promptId: EntityId; itemId: EntityId; }
export interface MatchingActivityDefinition { id: EntityId; title: string; introduction: string; prompts: MatchingPrompt[]; items: MatchingItem[]; }

export interface ArchitectureLabDefinition {
  id: EntityId;
  title: string;
  duration: number;
  difficulty: ArchitectureLabDifficulty;
  scenario: ArchitectureLabScenario;
  requirements: ArchitectureLabRequirement[];
  startingArchitecture: string[];
  capabilityMatching: MatchingActivityDefinition;
  availableComponents: ArchitectureLabComponent[];
  slots: ArchitectureLabSlot[];
  reviewRules: ArchitectureLabReviewRule[];
  referenceArchitecture: ArchitectureLabReferenceArchitecture;
  finalChallenge: ArchitectureLabChallenge;
  completionCriteria: ArchitectureLabCompletionCriteria;
}

export type ArchitectureLabPhase = "matching" | "design" | "review" | "compare" | "challenge" | "complete";
export interface ArchitectureLabState {
  matchingResponses: MatchingResponse[];
  matchingReviewed: boolean;
  activeMatchingPromptId: EntityId | null;
  placements: ArchitectureLabPlacement[];
  activeSlotId: EntityId | null;
  attemptNumber: number;
  reviewHistory: ArchitectureLabAttempt[];
  latestFeedback: ArchitectureLabFeedback | null;
  referenceArchitectureViewed: boolean;
  finalChallengeResponse: EntityId | null;
  finalChallengeSubmitted: boolean;
  completed: boolean;
  phase: ArchitectureLabPhase;
}

export function createArchitectureLabState(): ArchitectureLabState {
  return { matchingResponses: [], matchingReviewed: false, activeMatchingPromptId: null, placements: [], activeSlotId: null, attemptNumber: 0, reviewHistory: [], latestFeedback: null, referenceArchitectureViewed: false, finalChallengeResponse: null, finalChallengeSubmitted: false, completed: false, phase: "matching" };
}
