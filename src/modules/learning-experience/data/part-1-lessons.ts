import type { LearningExperienceDefinition, LearningLesson } from "../types";
import { lesson1Block1 } from "./lesson-1-block-1";
import { lesson3CompletionExperiences } from "./lesson-3-completion-experiences";
import { publishedCurriculumLessons } from "./curriculum-catalog";

const [lesson1Metadata, lesson2Metadata, lesson3Metadata, lesson4Metadata] = publishedCurriculumLessons;

export const part1IntroductionVideo = { src: "https://ajmwgzrosqixvoletzgu.supabase.co/storage/v1/object/public/course-videos/Part1/course-overview.mp4", title: "Architecting Enterprise AI: From Prototype to Production", description: "Begin with a short overview of how a working AI capability evolves into an enterprise-ready architecture, and what you will learn across Part 1.", durationLabel: "2 min" } as const;

const localizeExperiences = (experiences: LearningExperienceDefinition[]) => experiences.map((experience, index) => ({
  ...experience,
  eyebrow: experience.eyebrow?.replace(/^Experience \d+/, `Experience ${index + 1}`),
})) as LearningExperienceDefinition[];

const shared = {
  workshopId: lesson1Block1.workshopId,
  part: "Part 1 — Enterprise AI Architecture Foundations",
  resources: lesson1Block1.resources,
  glossary: lesson1Block1.glossary,
};

const lesson2Experiences = localizeExperiences(lesson1Block1.experiences.slice(3, 8)).map((experience) => experience.type === "architecture-decision-challenge" ? {
  ...experience,
  transition: ["You are now ready to apply these ideas to a complete enterprise AI workload.", "Continue to Lesson 3."],
} : experience) as LearningExperienceDefinition[];

export const part1Lesson1: LearningLesson = {
  ...shared,
  id: "part-1-lesson-1-why-enterprise-ai-architecture",
  slug: lesson1Metadata.slug,
  title: lesson1Metadata.title,
  description: lesson1Metadata.description,
  estimatedMinutes: 18,
  status: "published",
  instructionalVideo: { src: "https://ajmwgzrosqixvoletzgu.supabase.co/storage/v1/object/public/course-videos/Part1/lesson-1-working-ai-to-enterprise-architecture.mp4", title: "From Working AI to Enterprise AI Architecture", description: "A visual introduction to why a successful AI capability needs a wider enterprise architecture to operate securely, reliably and sustainably.", durationLabel: "2 min" },
  experiences: localizeExperiences(lesson1Block1.experiences.slice(0, 3)),
  lessonSummary: {
    narrative: "You should now understand why a successful AI pilot is not automatically an enterprise AI architecture. The HR policy assistant showed that a model can generate a useful answer while leaving essential questions unresolved: who can use the service, what each person may access, which sources are authoritative, how failures are handled, and how quality, latency, usage, and cost are monitored. Architecture thinking begins with the business outcome, intended users, requirements, constraints, and risk—not with selecting the most capable model. As the assistant moved from a small prototype toward a service for thousands of employees, its enterprise context introduced identity, authorization, controlled data access, integration with HR systems, and production concerns such as reliability, observability, operations, scalability, and cost. Security and governance also apply throughout the workload and its lifecycle. The resulting design is not better merely because it contains more components. It is better when its capabilities and significant decisions are appropriate to the required outcome and accepted trade-offs. The model remains one intelligence capability within a wider system that must operate securely, reliably, and sustainably.",
    takeaways: ["Start architecture conversations with the business outcome and enterprise context.", "A working AI solution is not automatically an enterprise-ready architecture.", "The AI model is one capability within the wider workload.", "Requirements and constraints determine which controls and operating capabilities are needed.", "Security, governance, reliability, scalability, and observability shape production design."],
    emphasis: ["business outcome", "enterprise context", "AI architecture", "AI model", "requirements", "constraints", "Security", "governance", "reliability", "observability", "scalability"],
  },
};

export const part1Lesson2: LearningLesson = {
  ...shared,
  id: "part-1-lesson-2-understanding-enterprise-ai-architecture",
  slug: lesson2Metadata.slug,
  title: lesson2Metadata.title,
  description: lesson2Metadata.description,
  estimatedMinutes: 28,
  status: "published",
  instructionalVideo: { src: "https://ajmwgzrosqixvoletzgu.supabase.co/storage/v1/object/public/course-videos/Part1/lesson-2-architecture-starts-with-business.mp4", title: "Architecture Starts with the Business", description: "Explore how Enterprise AI Architecture begins with outcomes, requirements, responsibilities and architectural boundaries.", durationLabel: "3 min" },
  experiences: lesson2Experiences,
  lessonSummary: {
    narrative: "You should now be able to reason about enterprise AI architecture as a connected system of decisions rather than a collection of AI technologies. The learning model begins with the Business Outcome and Users & Experience, then connects the Application & Business Capabilities, AI & Intelligence, Enterprise Data, Integration, and Enterprise Systems needed for the workload. The employee leave-balance flow demonstrated why those domains must work together: identity establishes the requester, authorization determines permitted access, application logic identifies the need for current information, and a controlled interface retrieves the fact from an authoritative HR source. AI may formulate the response, but it is not automatically the source of business truth. Identity, Security, and Governance span the architecture, while Observability, Operations, and Cost support the running service. You also saw that architecture changes with context. More users, sensitive information, business actions, production expectations, or broader operating scope can require assumptions and decisions to be revisited. There is no universal stack or mandatory flow; architects select appropriate capabilities and balance resilience, control, usability, latency, complexity, and cost against the workload’s actual requirements and risks.",
    takeaways: ["Business and experience needs give every architecture decision its purpose.", "Application, AI, data, integration, and enterprise systems form a connected workload.", "Authoritative business facts belong in appropriate enterprise sources.", "Security, governance, observability, and operations are cross-cutting concerns.", "Changed requirements demand renewed trade-off analysis, not a universal design."],
    emphasis: ["Business Outcome", "Users & Experience", "Application & Business Capabilities", "AI & Intelligence", "Enterprise Data", "Integration", "Enterprise Systems", "authorization", "authoritative HR source", "Security", "Governance", "Observability", "Operations", "requirements", "risks"],
  },
};

export const part1Lesson3: LearningLesson = {
  ...shared,
  id: "part-1-lesson-3-architecting-first-workload",
  slug: lesson3Metadata.slug,
  title: lesson3Metadata.title,
  description: lesson3Metadata.description,
  estimatedMinutes: 38,
  status: "published",
  experiences: [...localizeExperiences(lesson1Block1.experiences.slice(8, 10)), ...lesson3CompletionExperiences],
  lessonSummary: {
    narrative: "You should now be able to turn enterprise requirements into a defensible high-level architecture. In the HR Employee Assistant lab, you worked from the intended employee service rather than beginning with a model or platform. You separated approved policy knowledge from current employee-specific facts, placing live leave information behind a controlled connection to an authoritative HR system while using AI only where interpretation, retrieval, or response generation adds value. You then traced how users, application logic, AI capabilities, enterprise data, integration, and systems of record connect across the workload. The architecture also distinguished authentication from authorization and kept access enforcement, validation, and deterministic business controls outside model behavior. Exploring requirement changes showed why the design must evolve: greater scale affects capacity, performance, resilience, monitoring, and cost; more sensitive data strengthens protection and audit needs; and moving from read-only answers to transactions introduces controlled APIs, transaction authorization, validation, action boundaries, auditability, and failure recovery. The knowledge check reinforced the overall method: clarify outcomes, users, data, requirements, constraints, and risks; make architecture decisions; construct and inspect the design; then test it against enterprise operating realities and acceptable trade-offs.",
    takeaways: ["Translate requirements into architecture before committing to technology.", "Separate policy knowledge from current authoritative business data.", "Keep authorization, validation, and business controls outside model behavior.", "Read paths and transactional actions require different safeguards.", "Revisit the architecture as scale, sensitivity, risk, and operating needs change."],
    emphasis: ["high-level architecture", "HR Employee Assistant", "authoritative HR system", "authentication", "authorization", "requirements", "architecture decisions", "controlled APIs", "business controls", "trade-offs"],
  },
};

export const part1Lesson4: LearningLesson = {
  id: "part-1-lesson-4-foundation-models-prompting-context-engineering",
  slug: lesson4Metadata.slug,
  workshopId: lesson1Block1.workshopId,
  part: "Part II · Build the Intelligence",
  title: lesson4Metadata.title,
  description: lesson4Metadata.description,
  estimatedMinutes: 60,
  status: "published",
  experiences: [
    { id: "foundation-models", type: "concept", title: "Foundation Models" },
    { id: "model-request", type: "concept", title: "Anatomy of a Model Request" },
    { id: "prompt-engineering", type: "concept", title: "Prompt Engineering & Prompting Strategies" },
    { id: "context-engineering", type: "concept", title: "Context Engineering" },
    { id: "model-selection", type: "concept", title: "Model Selection & Architecture Lab 04" },
    { id: "knowledge-summary", type: "concept", title: "Knowledge Check & Lesson Summary" },
  ],
  resources: lesson1Block1.resources,
  glossary: lesson1Block1.glossary,
};

export const productionPart1Lessons = [part1Lesson1, part1Lesson2, part1Lesson3, part1Lesson4];
