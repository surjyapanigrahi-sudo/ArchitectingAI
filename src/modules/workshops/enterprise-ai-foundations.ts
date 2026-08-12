import type { Mission, Platform, Program, Workshop } from "@/types";

export const enterpriseAiFoundationsMissions: Mission[] = [
  { id: "mission-zero", workshopId: "enterprise-ai-foundations", title: "Mission Zero", summary: "Public orientation experience; content pending approved design.", experienceIds: [], order: 1 },
  { id: "mission-foundations", workshopId: "enterprise-ai-foundations", title: "Enterprise AI Foundations Mission", summary: "Placeholder mission; content not authored.", experienceIds: [], order: 2 },
  { id: "mission-architecture", workshopId: "enterprise-ai-foundations", title: "Enterprise AI Architecture Mission", summary: "Placeholder mission; content not authored.", experienceIds: [], order: 3 },
];

export const enterpriseAiFoundations: Workshop = { id: "enterprise-ai-foundations", slug: "enterprise-ai-foundations", title: "Enterprise AI Foundations", summary: "Foundational workshop definition with placeholder missions only.", missionIds: enterpriseAiFoundationsMissions.map(({ id }) => id), status: "draft" };
export const foundationsProgram: Program = { id: "enterprise-ai-program", title: "Enterprise AI Program", workshopIds: [enterpriseAiFoundations.id] };
export const architectingAiPlatform: Platform = { id: "architecting-ai", title: "Architecting AI", programs: [foundationsProgram] };
