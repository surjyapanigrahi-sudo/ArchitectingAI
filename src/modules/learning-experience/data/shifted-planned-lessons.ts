export interface ShiftedPlannedLesson {
  originalNumber: number;
  displayNumber: number;
  title: string;
  originalPart: string;
  status: "coming-soon";
  description?: string;
}

const originalLaterCurriculum = [
  { originalNumber: 2, originalPart: "Part I · Think Like an Architect", title: "How Enterprise AI Architects Think", description: "Learn how business outcomes, requirements and trade-offs shape architecture decisions." },
  { originalNumber: 3, originalPart: "Part II · Build the Intelligence", title: "AI Foundations for Enterprise Architects", description: "Understand the AI foundations enterprise architects need." },
  { originalNumber: 4, originalPart: "Part II · Build the Intelligence", title: "Foundation Models, Prompting & Context Engineering" },
  { originalNumber: 5, originalPart: "Part II · Build the Intelligence", title: "Enterprise Data for AI" },
  { originalNumber: 6, originalPart: "Part II · Build the Intelligence", title: "Embeddings, Vector Search & RAG" },
  { originalNumber: 7, originalPart: "Part II · Build the Intelligence", title: "Agents, Tools & AI Orchestration" },
  { originalNumber: 8, originalPart: "Part II · Build the Intelligence", title: "Enterprise Integration & APIs" },
  { originalNumber: 9, originalPart: "Part II · Build the Intelligence", title: "Identity, Security & AI Guardrails" },
  { originalNumber: 10, originalPart: "Part II · Build the Intelligence", title: "AI Governance, Risk & Responsible AI" },
  { originalNumber: 11, originalPart: "Part II · Build the Intelligence", title: "Observability, LLMOps & Production Operations" },
  { originalNumber: 12, originalPart: "Part III · Architect the Enterprise", title: "Designing an End-to-End Enterprise RAG Architecture" },
  { originalNumber: 13, originalPart: "Part III · Architect the Enterprise", title: "Designing Enterprise Agentic AI Architecture" },
  { originalNumber: 14, originalPart: "Part III · Architect the Enterprise", title: "Architecture Patterns, Trade-offs & Technology Decisions" },
  { originalNumber: 15, originalPart: "Part III · Architect the Enterprise", title: "Scaling Enterprise AI: Platform Architecture" },
  { originalNumber: 16, originalPart: "Part III · Architect the Enterprise", title: "Enterprise AI Architecture Capstone" },
] as const;

export const shiftedPlannedLessons: ShiftedPlannedLesson[] = originalLaterCurriculum.map((lesson) => ({
  ...lesson,
  displayNumber: lesson.originalNumber + 2,
  status: "coming-soon",
}));

export const remainingShiftedPlannedLessons = shiftedPlannedLessons.filter((lesson) => lesson.originalNumber !== 2);
