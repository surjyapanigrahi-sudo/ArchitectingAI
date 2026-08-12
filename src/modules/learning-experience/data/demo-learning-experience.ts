import type { LearningLesson } from "../types";
import { demoArchitectureLab } from "@/modules/architecture-lab/demo-architecture-lab";

export const demoLearningExperience: LearningLesson = {
  id: "demo-learning-experience",
  slug: "demo-learning-experience",
  workshopId: "enterprise-ai-foundations",
  title: "Demo Learning Experience",
  description: "A short placeholder sequence used to validate the learning engine architecture.",
  estimatedMinutes: 18,
  resources: [
    { id: "demo-resource", kind: "link", title: "Demo resource placeholder", uri: "#", metadata: { status: "placeholder" } },
  ],
  experiences: [
    { id: "intro", type: "introduction", eyebrow: "Demo content", title: "A focused learning workspace", summary: "This placeholder experience demonstrates how a lesson moves through concise, connected activities.", objectives: [{ id: "objective-1", statement: "Recognize how structured experiences create a guided architecture workshop." }] },
    { id: "concept", type: "concept", eyebrow: "Concept", title: "Begin with connected decisions", summary: "Enterprise architecture links business context, users, capabilities, intelligence and operational constraints.", points: ["Start with the intended outcome", "Trace the people and capabilities involved", "Treat technology as an enabling decision"] },
    { id: "diagram", type: "diagram", eyebrow: "Interactive visual", title: "Explore the architecture", summary: "Select a domain in this existing demo architecture to inspect its relationships.", diagramId: "enterprise-ai-overview" },
    { id: "example", type: "enterprise-example", eyebrow: "Enterprise example", title: "A connected service decision", example: { organization: "Demo organization", situation: "A team wants to add an AI assistant to an existing employee service.", response: "The architecture team maps the outcome, users, data access and operating controls before choosing an implementation." } },
    { id: "insight", type: "architect-insight", eyebrow: "Architect insight", title: "Architecture keeps decisions in context", insight: { statement: "A technology choice is strongest when its place in the enterprise system is understood.", explanation: "This demo statement is intentionally brief and is not production Lesson 1 content." } },
    { id: "decision", type: "decision", eyebrow: "Decision activity", title: "Choose a starting question", prompt: "Which question best opens an enterprise architecture conversation?", options: [{ id: "value", label: "What outcome should change, and how will we measure it?" }, { id: "model", label: "Which model should the implementation team standardize on?" }, { id: "tool", label: "Which orchestration tool can the team deploy fastest?" }] },
    { id: "check", type: "knowledge-check", eyebrow: "Knowledge check", title: "Check the connection", question: { id: "demo-question", prompt: "Why does the learning path begin with business context?", answerOptionId: "context", options: [{ id: "context", label: "It gives later architecture decisions a measurable purpose." }, { id: "sequence", label: "It forces every project to follow one rigid sequence." }, { id: "vendor", label: "It determines which vendor must be selected." }], feedback: "Business context connects architecture choices to value, users and measurable change.", retryPrompt: "Revisit how business context guides—not rigidly dictates—the connected decisions." } },
    { id: "architecture-lab", type: "architecture-lab", eyebrow: "Architecture Lab", title: "Turn a prototype into an enterprise-ready system", summary: "Design, review, refine, compare and apply architectural decisions in a guided enterprise scenario.", lab: demoArchitectureLab },
    { id: "summary", type: "summary", eyebrow: "Demo summary", title: "The engine keeps content and interaction connected", summary: "You moved through a data-driven lesson without loading a new page between experiences.", outcomes: ["Navigated a structured experience sequence", "Explored an existing architecture visual", "Recorded a decision and knowledge-check response"] },
  ],
};
