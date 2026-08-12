import type { ArchitectureLabDefinition, ArchitectureLabFeedback, ArchitectureLabPlacement } from "./types";

export function reviewArchitectureLab(definition: ArchitectureLabDefinition, placements: ArchitectureLabPlacement[]): ArchitectureLabFeedback {
  const selectedCapabilities = new Set(placements.map((placement) => definition.availableComponents.find((component) => component.id === placement.componentId)?.capability).filter((capability): capability is string => Boolean(capability)));
  const feedback: ArchitectureLabFeedback = { strengths: [], considerations: [], gaps: [], nextQuestions: [] };

  for (const rule of definition.reviewRules) {
    const hasCapability = rule.capabilityIds.some((capability) => selectedCapabilities.has(capability));
    const matchesDistractor = rule.type === "distractor-selected" && hasCapability;
    if (hasCapability && rule.strength && rule.type !== "distractor-selected") feedback.strengths.push(rule.strength);
    if ((matchesDistractor || !hasCapability) && rule.consideration) feedback.considerations.push(rule.consideration);
    if (!hasCapability && rule.gap) feedback.gaps.push(rule.gap);
    if ((matchesDistractor || !hasCapability) && rule.nextQuestion) feedback.nextQuestions.push(rule.nextQuestion);
  }

  return feedback;
}
