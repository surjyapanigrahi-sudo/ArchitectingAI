import type { EntityId } from "@/types";

export interface MissionStageDefinition { id: EntityId; order: number; title?: string; status: "placeholder" | "ready"; }
export interface PublicMissionConfiguration { id: EntityId; slug: string; title: string; access: "public"; authenticationRequired: false; estimatedMinutes: number; plannedStageCount: number; stages: MissionStageDefinition[]; }

export interface MissionZeroState {
  currentStage: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  selectedCioDecision: string | null;
  selectedArchitectureDomain: EntityId | null;
  selectedApplyDecision: string | null;
}
