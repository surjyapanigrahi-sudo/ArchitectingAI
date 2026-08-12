import type { ArchitectureNode, ArchitectureRelationship, ArchitectureScenario, EntityId } from "@/types";

export interface ArchitectureDomain { id: EntityId; label: string; order: number; kind: "layer" | "cross-cutting"; }
export interface ArchitecturePath { id: EntityId; label: string; nodeIds: EntityId[]; relationshipIds: EntityId[]; }
export interface ArchitectureSelection { nodeIds: EntityId[]; relationshipIds: EntityId[]; pathIds: EntityId[]; }
export interface ArchitectureExplanation { id: EntityId; targetType: "node" | "relationship" | "path" | "scenario"; targetId: EntityId; summary: string; details?: string; }
export interface ArchitectureState { selected: ArchitectureSelection; highlightedNodeIds: EntityId[]; highlightedRelationshipIds: EntityId[]; activeScenarioId?: EntityId; animationPhase?: string; }
export interface ArchitectureExplorerDefinition { domains: ArchitectureDomain[]; nodes: ArchitectureNode[]; relationships: ArchitectureRelationship[]; paths: ArchitecturePath[]; scenarios: ArchitectureScenario[]; explanations: ArchitectureExplanation[]; }
export interface ArchitectureNodePosition { nodeId: EntityId; x: number; y: number; width: number; height: number; }
export interface ArchitectureDomainContent { domainId: EntityId; eyebrow: string; title: string; summary: string; points: string[]; }
