import { ArchitectInsightExperience, ConceptExperience, DiagramExperience, EnterpriseExampleExperience, IntroductionExperience, SummaryExperience } from "./experience-primitives";
import { DecisionExperience } from "./decision-experience";
import { KnowledgeCheckExperience } from "./knowledge-check-experience";
import { ArchitectureLabExperience } from "@/modules/architecture-lab/components/architecture-lab-experience";
import type { ArchitectureLabState } from "@/modules/architecture-lab/types";
import type { ArchitectThinkingState, ArchitectureExplorationState, KnowledgeCheckResponse, LearningExperienceDefinition, LessonSummaryReflectionState, ScenarioKnowledgeCheckState } from "../types";
import type { ProgressiveArchitectureState } from "../types";
import { ArchitectureComparisonExperience, EnterpriseReadinessChallenge, ProgressiveArchitectureExperience } from "./production-block-experiences";
import { ExperienceTheorySupport } from "./experience-theory";
import { ArchitectureLearningModelExperience, EnterpriseRequestFlowExperience, RequirementsRealityCheckExperience } from "./block-2-experiences";
import { ArchitectGuidedExplorationExperience, ArchitectureDecisionChallengeExperience } from "./architect-decision-experiences";
import { ArchitectureExplorationExperience } from "./architecture-exploration-experience";
import { LessonSummaryReflectionExperience, ScenarioKnowledgeCheckExperience } from "./lesson-3-completion-experiences";
import { ArchitectThinkingExperience } from "./architect-thinking-experiences";

export function LearningExperienceEngine({ experience, decisionResponse, knowledgeResponse, architectureLabState, sourceArchitectureLabState, architectureExplorationState, scenarioKnowledgeCheckState, lessonSummaryReflectionState, architectThinkingState, multiSelectResponse = [], experienceSubmitted, progressiveArchitectureState, summaryComplete, onDecisionChange, onKnowledgeChange, onArchitectureLabChange, onArchitectureExplorationChange, onScenarioKnowledgeCheckChange, onLessonSummaryReflectionChange, onArchitectThinkingChange, onMultiSelectChange, onExperienceSubmit, onProgressiveArchitectureChange }: { experience: LearningExperienceDefinition; decisionResponse?: string; knowledgeResponse?: KnowledgeCheckResponse; architectureLabState?: ArchitectureLabState; sourceArchitectureLabState?: ArchitectureLabState; architectureExplorationState?: ArchitectureExplorationState; scenarioKnowledgeCheckState?: ScenarioKnowledgeCheckState; lessonSummaryReflectionState?: LessonSummaryReflectionState; architectThinkingState?: ArchitectThinkingState; multiSelectResponse?: string[]; experienceSubmitted: boolean; progressiveArchitectureState?: ProgressiveArchitectureState; summaryComplete: boolean; onDecisionChange: (optionId: string) => void; onKnowledgeChange: (response: KnowledgeCheckResponse) => void; onArchitectureLabChange: (state: ArchitectureLabState) => void; onArchitectureExplorationChange: (state: ArchitectureExplorationState) => void; onScenarioKnowledgeCheckChange: (state: ScenarioKnowledgeCheckState) => void; onLessonSummaryReflectionChange: (state: LessonSummaryReflectionState) => void; onArchitectThinkingChange: (state: ArchitectThinkingState) => void; onMultiSelectChange: (ids: string[]) => void; onExperienceSubmit: () => void; onProgressiveArchitectureChange: (state: ProgressiveArchitectureState) => void }) {
  switch (experience.type) {
    case "introduction": return <IntroductionExperience experience={experience} />;
    case "concept": case "explanation": case "apply": case "reflection": return <ConceptExperience experience={experience} />;
    case "diagram": case "animation": return <DiagramExperience experience={experience} />;
    case "enterprise-example": return <EnterpriseExampleExperience experience={experience} />;
    case "architect-insight": return <ArchitectInsightExperience experience={experience} />;
    case "decision": return <DecisionExperience experience={experience} selectedOptionId={decisionResponse} onSelect={onDecisionChange} />;
    case "knowledge-check": return <KnowledgeCheckExperience experience={experience} response={knowledgeResponse} onChange={onKnowledgeChange} />;
    case "architecture-lab": return architectureLabState ? <ArchitectureLabExperience experience={experience} state={architectureLabState} onChange={onArchitectureLabChange} /> : null;
    case "enterprise-readiness-challenge": return <><EnterpriseReadinessChallenge experience={experience} selectedIds={multiSelectResponse} submitted={experienceSubmitted} onSelectionChange={onMultiSelectChange} onSubmit={onExperienceSubmit} />{experienceSubmitted && <ExperienceTheorySupport theory={experience.theory} />}</>;
    case "architecture-comparison": return <><ArchitectureComparisonExperience experience={experience} /><ExperienceTheorySupport theory={experience.theory} /></>;
    case "progressive-architecture": return progressiveArchitectureState ? <><ProgressiveArchitectureExperience experience={experience} state={progressiveArchitectureState} onChange={onProgressiveArchitectureChange} />{progressiveArchitectureState.sceneIndex === experience.scenes.length - 1 && <ExperienceTheorySupport theory={experience.theory} />}</> : null;
    case "architecture-learning-model": return <><ArchitectureLearningModelExperience experience={experience} /><ExperienceTheorySupport theory={experience.theory} /></>;
    case "enterprise-request-flow": return <><EnterpriseRequestFlowExperience experience={experience} /><ExperienceTheorySupport theory={experience.theory} /></>;
    case "requirements-reality-check": return <><RequirementsRealityCheckExperience experience={experience} /><ExperienceTheorySupport theory={experience.theory} /></>;
    case "architect-guided-exploration": return <><ArchitectGuidedExplorationExperience experience={experience} exploredIds={multiSelectResponse} onExploredChange={onMultiSelectChange} /><ExperienceTheorySupport theory={experience.theory} /></>;
    case "architecture-decision-challenge": return <><ArchitectureDecisionChallengeExperience experience={experience} selectedOptionId={decisionResponse} selectedConcerns={multiSelectResponse} submitted={experienceSubmitted} onOptionChange={onDecisionChange} onConcernsChange={onMultiSelectChange} onSubmit={onExperienceSubmit} />{experienceSubmitted && <ExperienceTheorySupport theory={experience.theory} />}</>;
    case "architecture-exploration": return architectureExplorationState ? <ArchitectureExplorationExperience experience={experience} state={architectureExplorationState} labState={sourceArchitectureLabState} onChange={onArchitectureExplorationChange} /> : null;
    case "scenario-knowledge-check": return scenarioKnowledgeCheckState ? <ScenarioKnowledgeCheckExperience experience={experience} state={scenarioKnowledgeCheckState} onChange={onScenarioKnowledgeCheckChange} /> : null;
    case "lesson-summary-reflection": return <LessonSummaryReflectionExperience experience={experience} state={lessonSummaryReflectionState ?? { reflectionResponse: "", completed: false }} onChange={onLessonSummaryReflectionChange} />;
    case "architect-thinking": return <ArchitectThinkingExperience experience={experience} state={architectThinkingState ?? { classifications: {}, scenarioSelections: {}, tradeoffSelections: {}, reflectionResponse: "", knowledgeResponses: {}, currentStep: 0, completed: false }} onChange={onArchitectThinkingChange} />;
    case "summary": return <SummaryExperience experience={experience} complete={summaryComplete} />;
  }
}
