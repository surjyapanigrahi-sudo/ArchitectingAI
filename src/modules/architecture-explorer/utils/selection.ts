import type { ArchitectureExplorerDefinition } from "../types";

export function getRelatedArchitectureIds(definition: ArchitectureExplorerDefinition, domainId: string | null) {
  if (!domainId) return { nodeIds: new Set<string>(), relationshipIds: new Set<string>() };
  const selectedNode = definition.nodes.find((node) => node.id === domainId);
  const selectedNodeIds = new Set(selectedNode ? [selectedNode.id] : definition.nodes.filter((node) => node.domainId === domainId).map((node) => node.id));
  const relationships = definition.relationships.filter((relationship) => selectedNodeIds.has(relationship.sourceNodeId) || selectedNodeIds.has(relationship.targetNodeId));
  const nodeIds = new Set(selectedNodeIds);
  relationships.forEach((relationship) => { nodeIds.add(relationship.sourceNodeId); nodeIds.add(relationship.targetNodeId); });
  return { nodeIds, relationshipIds: new Set(relationships.map((relationship) => relationship.id)) };
}
