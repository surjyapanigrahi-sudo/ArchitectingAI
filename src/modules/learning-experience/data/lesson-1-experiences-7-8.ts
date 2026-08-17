import type { LearningExperienceDefinition } from "../types";
import { productionLesson1ArchitectureLab } from "@/modules/architecture-lab/production-lesson-1-lab";

export const lesson1Experiences7And8: LearningExperienceDefinition[] = [
  {
    id: "lesson-1-experience-7",
    type: "architect-guided-exploration",
    eyebrow: "Experience 7 · Architect insight and guided exploration",
    title: "Think Like an Architect",
    summary: "Question a plausible enterprise AI proposal before approving its direction.",
    scenario: "A project team proposes: ‘We will build an employee AI assistant using a powerful LLM, connect it to company documents, and roll it out across the organization.’",
    prompt: "Before approving the solution, what would an Enterprise AI Architect want to clarify?",
    areas: [
      { id: "business-outcome", title: "Business Outcome", prompt: "What problem are we solving, and how will we know the solution is useful?", questions: ["What business outcome should improve?", "What measurable success criteria matter?", "What happens if we do nothing?"] },
      { id: "users", title: "Users", prompt: "Who will use the capability and under what conditions?", questions: ["Which user groups are involved?", "What access differences exist?", "Which channels or workflows do they use?"] },
      { id: "data", title: "Data", prompt: "What information does the system depend on?", questions: ["Which sources are authoritative?", "How current must the data be?", "Is any data sensitive or restricted?", "Who owns the data?"] },
      { id: "actions-integration", title: "Actions & Integration", prompt: "Will the system only answer questions, or will it perform actions?", questions: ["Which enterprise systems must participate?", "Are controlled APIs required?", "Is the workload read-only or transactional?"] },
      { id: "nonfunctional-requirements", title: "Nonfunctional Requirements", prompt: "How well must the system operate?", questions: ["What availability, latency and scale are required?", "What reliability, security and privacy expectations apply?", "What supportability and cost constraints matter?"] },
      { id: "risk-operations", title: "Risk & Operations", prompt: "How will the workload be governed, monitored, supported and changed?", questions: ["What risks matter, and what must be logged or audited?", "Who supports incidents?", "How will quality and behavior be monitored?", "How are changes controlled?"] },
    ],
    closingStatement: "You are not collecting boxes for an architecture diagram. You are collecting the information needed to make architecture decisions.",
    theory: {
      essentialConcept: ["A solution can be technically plausible and still be poorly architected if the business problem, user needs, data, requirements, risks or operational expectations remain unclear."],
      goDeeper: { readingMinutes: 4, blocks: [
        { type: "paragraph", text: "Functional requirements describe what the system must do." },
        { type: "list", items: ["answer HR policy questions", "retrieve current leave balance", "initiate a permitted business action"] },
        { type: "paragraph", text: "Nonfunctional requirements describe important qualities or constraints on how the system must operate." },
        { type: "list", items: ["availability", "performance", "security", "privacy", "reliability", "scalability", "observability", "supportability", "cost"] },
        { type: "callout", title: "Specific to the workload", text: "The architect’s task is to discover which requirements matter for this specific workload." },
      ] },
      architectInsight: "The architect’s job is not to start by choosing technology.\n\nIt is to create enough clarity to make defensible technology decisions.",
    },
  },
  {
    id: "lesson-1-experience-8",
    type: "architecture-decision-challenge",
    eyebrow: "Experience 8 · Interactive architecture decision",
    title: "Architecture Decision Challenge",
    summary: "Recommend a starting direction, then revisit it when the workload becomes transactional.",
    scenario: ["Your organization wants an HR assistant that allows employees to:", "ask HR policy questions", "retrieve their current leave balance"],
    requirements: ["approximately 10,000 employees", "employee-specific information", "existing enterprise identity", "current HR data", "sensitive personal information", "moderate response-time expectations", "controlled production rollout"],
    prompt: "Which architecture direction would you recommend as the starting point?",
    options: [
      { id: "model-first", label: "Select the most capable LLM first, then design the rest of the system around it.", feedback: "This can accelerate experimentation, but it commits to technology before the workload’s data, security, integration, operational and cost requirements are sufficiently understood." },
      { id: "requirements-first", label: "Define the business outcome, users, data and access requirements, integration needs, nonfunctional requirements and risk constraints before finalizing model or platform choices.", feedback: "This is the strongest starting direction because it creates the context needed to make defensible architecture and technology choices." },
      { id: "security-first", label: "Design identity, authorization, security controls and governance completely before considering the wider workload architecture.", feedback: "Security and governance should be considered from the beginning, but they are interconnected with business outcomes, data, user flows and application behavior. They should not be designed in isolation." },
      { id: "rag-first", label: "Build the RAG pipeline first because the assistant uses enterprise information.", feedback: "RAG may be appropriate for policy knowledge, but it is one architectural pattern rather than a universal starting point. Current employee leave balance may need to come from an authoritative HR system or API rather than document retrieval." },
    ],
    preferredOptionId: "requirements-first",
    phaseTwoRequirement: "In Phase 2, employees should also be able to request a change to their bank details.",
    phaseTwoPrompt: "What changes in your architecture thinking?",
    phaseTwoInstruction: "Select the concerns you would revisit.",
    phaseTwoConcerns: ["stronger authorization", "controlled transaction APIs", "business-rule validation", "auditability", "failure/recovery behavior", "appropriate approval/human control depending on policy and risk", "monitoring", "AI output/action boundaries"].map((label, index) => ({ id: `phase-two-${index + 1}`, label })),
    phaseTwoExplanation: ["Moving from read-only information access to business actions changes the risk profile. The architecture now needs to consider not only what information the user may see, but what actions the user or AI-enabled application is permitted to initiate.", "Appropriate approval or human oversight depends on the business process, risk and policy. It is not automatically required for every transaction."],
    transition: ["You now have enough context to move from evaluating architecture choices to constructing one.", "Next: Architecture Lab 01."],
    theory: {
      essentialConcept: ["Architecture decisions are contextual. Requirements and constraints determine which trade-offs are acceptable for a particular workload."],
      goDeeper: { readingMinutes: 3, blocks: [
        { type: "paragraph", text: "Architecture decisions involve trade-offs." },
        { type: "list", items: ["more redundancy may improve resilience while increasing cost and operational complexity", "additional controls may reduce risk while adding latency or user friction", "a larger model may help some tasks while increasing cost and response time", "stricter data-location requirements may constrain technology choices"] },
        { type: "paragraph", text: "The goal is not to maximize every quality simultaneously. The goal is to choose a design that appropriately balances the important requirements and constraints." },
      ] },
      architectInsight: "Architecture decisions are contextual.\n\nThe ‘best’ design is the one that best satisfies the important requirements and constraints while making acceptable trade-offs.",
    },
  },
  {
    id: "lesson-1-experience-9",
    type: "architecture-lab",
    eyebrow: "Experience 9 · Guided Foundation Lab",
    title: "Architecture Lab 01",
    summary: "Design Your First Enterprise AI Architecture",
    lab: productionLesson1ArchitectureLab,
  },
];
