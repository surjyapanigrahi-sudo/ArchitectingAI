export const cioDecisionOptions = [
  { id: "pilot", label: "Start with a limited pilot to test value quickly" },
  { id: "outcome", label: "Define the business outcome and success measures" },
  { id: "platform", label: "Choose a model and platform so teams can begin experimenting" },
  { id: "data", label: "Prepare enterprise data and access controls first" },
] as const;

export const thinkingLensLayers = [
  "Business Outcome",
  "Users / Experience",
  "Applications / Business Capabilities",
  "AI & Intelligence",
  "Enterprise Data",
  "Integration / Enterprise Systems",
] as const;

export const applyDecisionOptions = [
  { id: "outcome", label: "Define the business outcome and success measures" },
  { id: "model", label: "Select the LLM and prompt strategy" },
  { id: "rag", label: "Build the RAG pipeline against HR documents" },
  { id: "controls", label: "Configure identity, access and monitoring first" },
] as const;

export const cioDecisionFeedback: Record<string, string> = {
  outcome: "You started where enterprise architects typically begin: with the problem, expected value and measures of success.",
  pilot: "A pilot can be useful, but an architect first clarifies what business outcome the pilot is intended to prove.",
  platform: "Model selection is important, but choosing technology too early can constrain the solution before business requirements are understood.",
  data: "Data readiness and access controls are essential, but they should be driven by a clearly defined business problem and intended users.",
};

export const applyDecisionFeedback: Record<string, string> = {
  outcome: "You reinforced the architectural principle by defining the value and measures of success before selecting an implementation.",
  model: "The model is an important implementation decision, made after understanding the business outcome, users, data and constraints.",
  rag: "RAG may be appropriate, but retrieval architecture should follow the knowledge requirements, user access rules and business outcome.",
  controls: "Identity, access and monitoring are critical enterprise capabilities, designed in the context of the use case and intended users.",
};

export function getDecisionLabel(options: readonly { id: string; label: string }[], id: string | null) {
  return options.find((option) => option.id === id)?.label ?? "No decision recorded";
}
