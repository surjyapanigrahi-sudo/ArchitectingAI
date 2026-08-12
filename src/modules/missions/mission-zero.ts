import type { PublicMissionConfiguration } from "./types";

export const missionZero: PublicMissionConfiguration = {
  id: "mission-zero",
  slug: "mission-zero",
  title: "Mission Zero",
  access: "public",
  authenticationRequired: false,
  estimatedMinutes: 3,
  plannedStageCount: 7,
  stages: [
    { id: "mission-zero-stage-1", order: 1, title: "Welcome", status: "ready" },
    { id: "mission-zero-stage-2", order: 2, title: "Enterprise Challenge", status: "ready" },
    { id: "mission-zero-stage-3", order: 3, title: "Architecture Thinking Lens", status: "ready" },
    { id: "mission-zero-stage-4", order: 4, title: "Enterprise AI Architecture Explorer", status: "ready" },
    { id: "mission-zero-stage-5", order: 5, title: "Apply", status: "ready" },
    { id: "mission-zero-stage-6", order: 6, title: "Architect Insight", status: "ready" },
    { id: "mission-zero-stage-7", order: 7, title: "Mission Complete", status: "ready" },
  ],
};
