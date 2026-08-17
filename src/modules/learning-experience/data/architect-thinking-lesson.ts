import type { ArchitectThinkingExperienceDefinition, LearningLesson } from "../types";
import { lesson1Block1 } from "./lesson-1-block-1";

const experiences: ArchitectThinkingExperienceDefinition[] = [
  { id: "architect-thinking-theory", type: "architect-thinking", kind: "theory", eyebrow: "Experience 1 · 10–12 minutes", title: "Think Like an Architect", summary: "Move from technology selection to defensible architecture decisions." },
  { id: "architecture-decision-scenario", type: "architect-thinking", kind: "scenario", eyebrow: "Experience 2 · 10–15 minutes", title: "Architecture Decision Scenario", summary: "Turn changing requirements into architecture decisions." },
  { id: "architecture-tradeoff-lab", type: "architect-thinking", kind: "tradeoff-lab", eyebrow: "Experience 3 · 20–25 minutes", title: "Architecture Trade-off Lab", summary: "Make decisions, accept trade-offs, defend your architecture." },
  { id: "architect-thinking-knowledge-check", type: "architect-thinking", kind: "knowledge-check", eyebrow: "Experience 4 · 5–8 minutes", title: "Knowledge Check", summary: "Check how you reason about architecture decisions." },
];

export const architectThinkingLesson: LearningLesson = {
  id: "original-lesson-2-how-enterprise-ai-architects-think",
  slug: "how-enterprise-ai-architects-think",
  workshopId: lesson1Block1.workshopId,
  part: "Part I · Think Like an Architect",
  title: "How Enterprise AI Architects Think",
  description: "Learn how business outcomes, requirements and trade-offs shape architecture decisions.",
  estimatedMinutes: 55,
  status: "published",
  experiences,
  resources: lesson1Block1.resources,
  glossary: lesson1Block1.glossary,
};
