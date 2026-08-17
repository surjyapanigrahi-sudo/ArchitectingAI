import type { EntityId, LearningResource } from "@/types";
import type { ArchitectureLabDefinition, ArchitectureLabState } from "@/modules/architecture-lab/types";

export type LearningExperienceType = "introduction" | "concept" | "explanation" | "diagram" | "animation" | "enterprise-example" | "architect-insight" | "decision" | "knowledge-check" | "apply" | "reflection" | "architecture-lab" | "enterprise-readiness-challenge" | "architecture-comparison" | "progressive-architecture" | "architecture-learning-model" | "enterprise-request-flow" | "requirements-reality-check" | "architect-guided-exploration" | "architecture-decision-challenge" | "architecture-exploration" | "scenario-knowledge-check" | "lesson-summary-reflection" | "architect-thinking" | "summary";
export interface LearningObjective { id: EntityId; statement: string; }
export interface DecisionOption { id: EntityId; label: string; feedback?: string; }
export interface KnowledgeCheckQuestion { id: EntityId; prompt: string; options: DecisionOption[]; answerOptionId: EntityId; feedback: string; retryPrompt: string; }
export interface EnterpriseExample { organization: string; situation: string; response: string; }
export interface ArchitectInsight { statement: string; explanation: string; }
export type TheoryContentBlock = { type: "heading"; text: string } | { type: "paragraph"; text: string } | { type: "list"; items: string[] } | { type: "callout"; title: string; text: string } | { type: "flow"; nodes: string[]; caption?: string };
export interface TheoryEnterpriseExample { title: string; summary: string; cases?: { label: string; details: string[] }[]; }
export interface ExperienceTheory { essentialConcept: string[]; goDeeper?: { readingMinutes?: number; blocks: TheoryContentBlock[] }; architectInsight?: string; enterpriseExample?: TheoryEnterpriseExample; resourceIds?: EntityId[]; }

interface ExperienceBase { id: EntityId; type: LearningExperienceType; title: string; eyebrow?: string; summary?: string; theory?: ExperienceTheory; }
export interface IntroductionExperienceDefinition extends ExperienceBase { type: "introduction"; objectives: LearningObjective[]; }
export interface ConceptExperienceDefinition extends ExperienceBase { type: "concept" | "explanation" | "apply" | "reflection"; points?: string[]; }
export interface DiagramExperienceDefinition extends ExperienceBase { type: "diagram" | "animation"; diagramId?: EntityId; architectureScenarioId?: EntityId; }
export interface EnterpriseExampleExperienceDefinition extends ExperienceBase { type: "enterprise-example"; example: EnterpriseExample; }
export interface ArchitectInsightExperienceDefinition extends ExperienceBase { type: "architect-insight"; insight: ArchitectInsight; }
export interface DecisionExperienceDefinition extends ExperienceBase { type: "decision"; prompt: string; options: DecisionOption[]; }
export interface KnowledgeCheckExperienceDefinition extends ExperienceBase { type: "knowledge-check"; question: KnowledgeCheckQuestion; }
export interface ArchitectureLabExperienceDefinition extends ExperienceBase { type: "architecture-lab"; lab: ArchitectureLabDefinition; }
export interface MultiSelectOption { id: EntityId; label: string; }
export interface EnterpriseReadinessChallengeDefinition extends ExperienceBase { type: "enterprise-readiness-challenge"; scenario: string[]; examples: string[]; cioQuestion: string; prompt: string; instruction: string; options: MultiSelectOption[]; insight: string[]; workloadExplanation: string; }
export interface ArchitectureQuestion { id: EntityId; question: string; explanation: string; }
export interface ArchitectureComparisonExperienceDefinition extends ExperienceBase { type: "architecture-comparison"; coreStatement: string; explanation: string[]; prototypeFlow: string[]; prototypeQuestion: string; architectureQuestions: ArchitectureQuestion[]; insight: string[]; emphasis: string; }
export interface ProgressiveArchitectureScene { id: EntityId; title: string; prompt?: string; introducedCapabilities: string[]; teachingCopy: string[]; accuracyCallout?: string; }
export interface EnterpriseLearningModel { title: string; layers: string[]; intelligenceOptions: string[]; crossCutting: string[]; foundation: string[]; relationshipNote: string; qualification: string; }
export interface ProgressiveArchitectureExperienceDefinition extends ExperienceBase { type: "progressive-architecture"; scenes: ProgressiveArchitectureScene[]; finalModel: EnterpriseLearningModel; blockInsight: string; reflectionPrompt: string; reflectionReveal: string; }
export interface ArchitectureLearningModelStep { id: EntityId; title: string; cue: string; nodeIds: EntityId[]; }
export interface ArchitectureLearningModelExperienceDefinition extends ExperienceBase { type: "architecture-learning-model"; statement: string; qualification: string; guidedSteps: ArchitectureLearningModelStep[]; }
export interface RequestFlowStep { id: EntityId; title: string; domain: string; explanation: string; telemetry?: string[]; }
export interface EnterpriseRequestFlowExperienceDefinition extends ExperienceBase { type: "enterprise-request-flow"; scenario: string; steps: RequestFlowStep[]; question: KnowledgeCheckQuestion; }
export interface RequirementChange { id: EntityId; from: string; to: string; prompt: string; considerations: string[]; teachingPoint: string; }
export interface RequirementsRealityCheckExperienceDefinition extends ExperienceBase { type: "requirements-reality-check"; baseline: string[]; prompt: string; changes: RequirementChange[]; finalPrinciple: string; }
export interface ArchitectQuestionArea { id: EntityId; title: string; prompt: string; questions: string[]; }
export interface ArchitectGuidedExplorationExperienceDefinition extends ExperienceBase { type: "architect-guided-exploration"; scenario: string; prompt: string; areas: ArchitectQuestionArea[]; closingStatement: string; }
export interface ArchitectureDecisionChallengeExperienceDefinition extends ExperienceBase { type: "architecture-decision-challenge"; scenario: string[]; requirements: string[]; prompt: string; options: DecisionOption[]; preferredOptionId: EntityId; phaseTwoRequirement: string; phaseTwoPrompt: string; phaseTwoInstruction: string; phaseTwoConcerns: MultiSelectOption[]; phaseTwoExplanation: string[]; transition: string[]; }
export interface ArchitectureExplorationDomain { id: EntityId; explorerTargetId: EntityId; title: string; explanation: string; connections: string[]; architectQuestion: string; qualification?: string; }
export interface ArchitectureChangeScenario { id: EntityId; prompt: string; concerns: MultiSelectOption[]; feedback: string; qualification?: string; }
export interface ArchitectureExplorationExperienceDefinition extends ExperienceBase { type: "architecture-exploration"; opening: string[]; domains: ArchitectureExplorationDomain[]; changeScenarios: ArchitectureChangeScenario[]; insight: string; reflectionPrompt: string; reflectionHelper: string; completion: string[]; }
export interface ScenarioKnowledgeQuestion { id: EntityId; scenario: string; prompt: string; options: DecisionOption[]; preferredOptionId: EntityId; feedback: string[]; }
export interface ScenarioKnowledgeCheckExperienceDefinition extends ExperienceBase { type: "scenario-knowledge-check"; questions: ScenarioKnowledgeQuestion[]; }
export interface PartOneLessonSummary { id: EntityId; lessonLabel: string; theme: "WHY" | "UNDERSTAND" | "APPLY"; title: string; summary: string[]; keyIdeas: string[]; }
export interface LessonSummaryReflectionExperienceDefinition extends ExperienceBase { type: "lesson-summary-reflection"; introduction: string; lessons: PartOneLessonSummary[]; mentalModel: { from: string; to: string; sequence: string[]; qualification: string }; capabilities: string[]; reflectionPrompt: string; reflectionHelper: string; architectTakeaway: string[]; completionStatement: string; nextLessonTitle: string; nextLessonDescription?: string; nextLessonHref?: string; }
export interface ArchitectThinkingExperienceDefinition extends ExperienceBase { type: "architect-thinking"; kind: "theory" | "scenario" | "tradeoff-lab" | "knowledge-check"; }
export interface SummaryExperienceDefinition extends ExperienceBase { type: "summary"; outcomes: string[]; }
export type LearningExperienceDefinition = IntroductionExperienceDefinition | ConceptExperienceDefinition | DiagramExperienceDefinition | EnterpriseExampleExperienceDefinition | ArchitectInsightExperienceDefinition | DecisionExperienceDefinition | KnowledgeCheckExperienceDefinition | ArchitectureLabExperienceDefinition | EnterpriseReadinessChallengeDefinition | ArchitectureComparisonExperienceDefinition | ProgressiveArchitectureExperienceDefinition | ArchitectureLearningModelExperienceDefinition | EnterpriseRequestFlowExperienceDefinition | RequirementsRealityCheckExperienceDefinition | ArchitectGuidedExplorationExperienceDefinition | ArchitectureDecisionChallengeExperienceDefinition | ArchitectureExplorationExperienceDefinition | ScenarioKnowledgeCheckExperienceDefinition | LessonSummaryReflectionExperienceDefinition | ArchitectThinkingExperienceDefinition | SummaryExperienceDefinition;

export interface GlossaryTerm { id: EntityId; term: string; definition: string; }
export interface LearningLesson { id: EntityId; slug: string; workshopId: EntityId; title: string; description: string; part?: string; estimatedMinutes?: number; durationLabel?: string; status?: "in-development" | "published"; plannedExperienceCount?: number; experiences: LearningExperienceDefinition[]; resources: LearningResource[]; glossary?: GlossaryTerm[]; }
export interface KnowledgeCheckResponse { selectedOptionId: EntityId | null; submitted: boolean; attempts: number; }
export interface ProgressiveArchitectureState { sceneIndex: number; reflectionResponse: string; reflectionSubmitted: boolean; }
export interface ArchitectureExplorationState { selectedDomainId: EntityId | null; scenarioSelections: Record<EntityId, EntityId[]>; reflectionResponse: string; completed: boolean; }
export interface ScenarioKnowledgeCheckState { currentQuestionIndex: number; responses: Record<EntityId, KnowledgeCheckResponse>; completed: boolean; }
export interface LessonSummaryReflectionState { reflectionResponse: string; completed: boolean; }
export interface ArchitectThinkingState { classifications: Record<EntityId, "requirement" | "solution">; scenarioSelections: Record<EntityId, EntityId>; tradeoffSelections: Record<EntityId, EntityId>; reflectionResponse: string; knowledgeResponses: Record<EntityId, KnowledgeCheckResponse>; currentStep: number; completed: boolean; }
export interface LessonState { currentExperienceId: EntityId; completedExperienceIds: EntityId[]; decisionResponses: Record<EntityId, EntityId>; knowledgeCheckResponses: Record<EntityId, KnowledgeCheckResponse>; architectureLabStates: Record<EntityId, ArchitectureLabState>; multiSelectResponses: Record<EntityId, EntityId[]>; submittedExperienceIds: EntityId[]; progressiveArchitectureStates: Record<EntityId, ProgressiveArchitectureState>; architectureExplorationStates: Record<EntityId, ArchitectureExplorationState>; scenarioKnowledgeCheckStates: Record<EntityId, ScenarioKnowledgeCheckState>; lessonSummaryReflectionStates: Record<EntityId, LessonSummaryReflectionState>; architectThinkingStates: Record<EntityId, ArchitectThinkingState>; }
