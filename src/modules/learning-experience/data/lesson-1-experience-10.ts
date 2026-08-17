import type { ArchitectureExplorationExperienceDefinition, MultiSelectOption } from "../types";

const concerns = (prefix: string, labels: string[]): MultiSelectOption[] => labels.map((label, index) => ({ id: `${prefix}-${index + 1}`, label }));

export const lesson1Experience10: ArchitectureExplorationExperienceDefinition = {
  id: "lesson-1-experience-10",
  type: "architecture-exploration",
  eyebrow: "Experience 10 · Architecture exploration",
  title: "Explore the Architecture",
  summary: "See how the decisions you made connect across the enterprise system.",
  opening: ["You have built a high-level architecture.", "Now examine how its major domains work together — and what changes when the requirements change."],
  domains: [
    { id: "business-outcome", explorerTargetId: "outcome", title: "Business Outcome", explanation: "The architecture exists to support an employee service, not merely to deploy an AI model.", connections: ["HR policy access", "current leave information", "employee productivity and service experience"], architectQuestion: "What outcome would tell you this solution is actually useful?" },
    { id: "users-experience", explorerTargetId: "users", title: "Users & Experience", explanation: "Employees interact through an experience that must reflect identity, permissions and the workflow they are trying to complete.", connections: ["employee portal", "different access contexts", "readable responses"], architectQuestion: "Would every user need the same access and experience?" },
    { id: "applications", explorerTargetId: "applications", title: "Applications / Business Capabilities", explanation: "The application coordinates business logic, AI use, validation and integration. The model is one component inside the workload.", connections: ["application / orchestrator", "business rules", "validation"], architectQuestion: "What should remain application logic rather than model behavior?" },
    { id: "intelligence", explorerTargetId: "ai", title: "AI & Intelligence", explanation: "AI can interpret, retrieve, summarize or generate responses where useful.", connections: ["LLM / AI model", "retrieval / knowledge service"], architectQuestion: "Which parts of this workload genuinely need AI?", qualification: "Not every request requires every AI capability." },
    { id: "enterprise-data", explorerTargetId: "enterprise-data", title: "Enterprise Data", explanation: "Different information has different authority, sensitivity and freshness requirements.", connections: ["HR policy knowledge", "employee-specific data", "authoritative sources"], architectQuestion: "Which data can tolerate delay, and which must be current?" },
    { id: "integration-systems", explorerTargetId: "integration", title: "Integration / Enterprise Systems", explanation: "Live business facts and transactions often require controlled connections to enterprise systems.", connections: ["HR API", "HR system of record"], architectQuestion: "Which information or actions require a system-of-record integration?" },
    { id: "identity-security-governance", explorerTargetId: "governance", title: "Identity / Security / Governance", explanation: "These concerns span the workload rather than appearing only at the end.", connections: ["identity", "authorization", "sensitive employee data", "access boundaries", "auditability"], architectQuestion: "What could happen if identity or authorization were treated as optional?" },
    { id: "operations", explorerTargetId: "operations", title: "Observability / Operations / Cost", explanation: "A production AI workload must be operated, monitored and supported.", connections: ["availability", "errors", "latency", "usage", "cost", "incident support"], architectQuestion: "How would you know the system is healthy and delivering acceptable value?" },
  ],
  changeScenarios: [
    { id: "scale", prompt: "What would change if usage grew from 10,000 employees to 50,000?", concerns: concerns("scale", ["capacity / throughput", "performance", "resilience", "service limits", "cost", "operational monitoring"]), feedback: "Scale changes assumptions. It does not automatically dictate one specific technology." },
    { id: "sensitivity", prompt: "What would change if the service handled more sensitive employee information?", concerns: concerns("sensitivity", ["authorization", "privacy / data protection", "access boundaries", "auditability", "governance"]), feedback: "Greater sensitivity can change access, protection, evidence and governance requirements across the workload." },
    { id: "transactions", prompt: "What would change if the assistant could perform business transactions?", concerns: concerns("transactions", ["transaction authorization", "controlled APIs", "business-rule validation", "audit trail", "failure / recovery behavior", "action boundaries", "approval or control where appropriate"]), feedback: "Read and action paths have different risk profiles and need appropriately controlled execution.", qualification: "Human approval is not automatically required. Appropriate controls depend on the business process, policy and risk." },
  ],
  insight: "Architecture becomes clearer when you trace how business outcomes, users, data, AI, integrations, security and operations depend on one another.",
  reflectionPrompt: "Which part of the architecture changed your thinking the most?",
  reflectionHelper: "Consider AI, data, identity, integration, operations or architecture trade-offs.",
  completion: ["You have now examined the architecture from both directions:", "from business requirements into architecture", "from architecture back to enterprise consequences"],
};
