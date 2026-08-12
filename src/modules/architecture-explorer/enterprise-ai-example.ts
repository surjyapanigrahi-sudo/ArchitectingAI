import type { ArchitectureExplorerDefinition, ArchitectureNodePosition, ArchitectureDomainContent } from "./types";

export const enterpriseAiArchitecture: ArchitectureExplorerDefinition = {
  domains: [
    { id: "business", label: "Business / Experience", order: 0, kind: "layer" },
    { id: "application", label: "Application", order: 1, kind: "layer" },
    { id: "intelligence", label: "AI & Intelligence", order: 2, kind: "layer" },
    { id: "data", label: "Data", order: 3, kind: "layer" },
    { id: "integration", label: "Integration", order: 4, kind: "layer" },
    { id: "governance", label: "Cross-cutting", order: 5, kind: "cross-cutting" },
    { id: "operations", label: "Foundation", order: 6, kind: "cross-cutting" },
  ],
  nodes: [
    ["outcome", "business", "Business Outcome", "Define measurable value before selecting technology."],
    ["users", "business", "Users / Experience", "Design how people engage with AI-assisted capabilities."],
    ["applications", "application", "Applications / Business Capabilities", "Embed intelligence into the work and systems that deliver value."],
    ["ai", "intelligence", "AI & Intelligence", "Coordinate the intelligence capabilities needed by the experience."],
    ["rag", "intelligence", "RAG", "Ground model responses in trusted enterprise knowledge."],
    ["agents", "intelligence", "Agents", "Orchestrate tools and multi-step work within defined controls."],
    ["models", "intelligence", "Models", "Provide language, reasoning, or predictive capabilities."],
    ["enterprise-data", "data", "Enterprise Data", "Make governed, contextual information available to AI solutions."],
    ["integration", "integration", "Integration / APIs / Events", "Connect capabilities through managed interfaces and event flows."],
    ["systems", "integration", "Enterprise Systems", "Provide the systems of record and action behind AI experiences."],
    ["governance", "governance", "Identity / Security / Governance", "Apply context, policy, protection, guardrails, and auditability across every layer."],
    ["operations", "operations", "Observability / Operations / Cost", "Operate the complete system with telemetry, reliability, and cost controls."],
  ].map(([id, domainId, label, description]) => ({ id, domainId, label, description, capability: id, crossCutting: domainId === "governance" || domainId === "operations" })),
  relationships: [
    ["r1", "outcome", "users", "feeds"], ["r2", "users", "applications", "feeds"],
    ["r3", "applications", "ai", "depends-on"], ["r4", "ai", "rag", "orchestrates"],
    ["r5", "ai", "agents", "orchestrates"], ["r6", "ai", "models", "depends-on"],
    ["r7", "rag", "enterprise-data", "retrieves-from"], ["r8", "applications", "enterprise-data", "depends-on"],
    ["r9", "enterprise-data", "integration", "depends-on"], ["r10", "integration", "systems", "feeds"],
    ["r11", "governance", "users", "governs"], ["r12", "governance", "applications", "governs"],
    ["r13", "governance", "ai", "governs"], ["r14", "governance", "enterprise-data", "governs"],
    ["r15", "governance", "integration", "governs"], ["r16", "operations", "applications", "observes"],
    ["r17", "operations", "ai", "observes"], ["r18", "operations", "enterprise-data", "observes"],
    ["r19", "operations", "integration", "observes"],
  ].map(([id, sourceNodeId, targetNodeId, type]) => ({ id, sourceNodeId, targetNodeId, type: type as "depends-on" | "feeds" | "governs" | "observes" | "orchestrates" | "retrieves-from" })),
  paths: [{ id: "enterprise-value-path", label: "Enterprise value pathway", nodeIds: ["outcome", "users", "applications", "ai", "rag", "enterprise-data", "integration", "systems"], relationshipIds: ["r1", "r2", "r3", "r4", "r7", "r9", "r10"] }],
  scenarios: [], explanations: [],
};

export const architectureNodePositions: ArchitectureNodePosition[] = [
  { nodeId: "outcome", x: 35, y: 36, width: 190, height: 54 }, { nodeId: "users", x: 285, y: 36, width: 190, height: 54 },
  { nodeId: "applications", x: 175, y: 126, width: 240, height: 58 },
  { nodeId: "ai", x: 205, y: 220, width: 180, height: 56 },
  { nodeId: "rag", x: 35, y: 316, width: 130, height: 52 }, { nodeId: "agents", x: 205, y: 316, width: 130, height: 52 }, { nodeId: "models", x: 375, y: 316, width: 130, height: 52 },
  { nodeId: "enterprise-data", x: 175, y: 412, width: 240, height: 56 },
  { nodeId: "integration", x: 55, y: 506, width: 220, height: 56 }, { nodeId: "systems", x: 330, y: 506, width: 190, height: 56 },
  { nodeId: "governance", x: 555, y: 72, width: 180, height: 410 },
  { nodeId: "operations", x: 35, y: 604, width: 700, height: 56 },
];

export const architectureDomainContent: ArchitectureDomainContent[] = [
  { domainId: "business", eyebrow: "Start with value", title: "Business & Experience", summary: "Architecture begins with the outcome and the people who must realize it.", points: ["Outcome definition", "User context", "Experience design"] },
  { domainId: "application", eyebrow: "Embed in work", title: "Application", summary: "AI creates value through business capabilities, not as an isolated technology demo.", points: ["Business workflows", "Capability boundaries", "Human oversight"] },
  { domainId: "intelligence", eyebrow: "Enable intelligently", title: "AI & Intelligence", summary: "RAG, agents, and models are composable decisions selected for the outcome.", points: ["Retrieval grounding", "Agent orchestration", "Model selection"] },
  { domainId: "data", eyebrow: "Ground in context", title: "Enterprise Data", summary: "Trusted enterprise context connects applications, intelligence, and systems.", points: ["Knowledge quality", "Data access", "Context and lineage"] },
  { domainId: "integration", eyebrow: "Connect safely", title: "Integration", summary: "Managed APIs and events connect AI capabilities to systems of record and action.", points: ["APIs and events", "System boundaries", "Reliable actions"] },
  { domainId: "governance", eyebrow: "Security is cross-cutting", title: "Identity, Security & Governance", summary: "Controls span the entire architecture rather than sitting at one boundary.", points: ["Identity & Context", "Enterprise Access Control", "Data Protection & Masking", "Model Guardrails", "Auditability & Logging"] },
  { domainId: "operations", eyebrow: "Run as a system", title: "Operations Foundation", summary: "The architecture is underpinned by operational insight, reliability, and economic control.", points: ["Observability", "Operations", "Cost"] },
];
