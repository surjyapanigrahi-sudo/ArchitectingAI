"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArchitectureLabFourWorkbench } from "@/modules/architecture-lab/components/architecture-lab-four-workbench";
import { recordExperienceProgress } from "@/modules/progress/client";
import { LearnerProfileMenu } from "@/modules/auth/components/learner-profile-menu";
import { part1Lesson4 } from "@/modules/learning-experience/data/part-1-lessons";

const experiences = [
  { id: "foundation-models", number: "4.1", title: "Foundation Models" },
  { id: "model-request", number: "4.2", title: "Anatomy of a Model Request" },
  { id: "prompt-engineering", number: "4.3", title: "Prompt Engineering & Prompting Strategies" },
  { id: "context-engineering", number: "4.4", title: "Context Engineering" },
  { id: "model-selection", number: "4.5", title: "Model Selection & Architecture Lab 04" },
  { id: "knowledge-summary", number: "4.6", title: "Knowledge Check & Lesson Summary" },
] as const;

interface LessonFourPreviewProps {
  developmentPreview?: boolean;
  embedded?: boolean;
  learnerName?: string;
  persistenceEnabled?: boolean;
  initialCompletedExperienceIds?: string[];
  initialCurrentExperienceId?: string | null;
}

export function LessonFourPreview({ developmentPreview = false, embedded = false, learnerName, persistenceEnabled = false, initialCompletedExperienceIds = [], initialCurrentExperienceId = null }: LessonFourPreviewProps) {
  const initialIndex = Math.max(0, experiences.findIndex((experience) => experience.id === initialCurrentExperienceId));
  const [index, setIndex] = useState(initialIndex);
  const [completedExperienceIds, setCompletedExperienceIds] = useState(initialCompletedExperienceIds);
  const [learningMapOpen, setLearningMapOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); window.scrollTo({ top: 0, behavior: "smooth" }); }, [index]);
  const current = experiences[index];
  const wideWorkbench = index === 4;
  const navigateToExperience = (nextIndex: number) => {
    setIndex(nextIndex);
    setLearningMapOpen(nextIndex !== 4);
  };
  const selectExperience = async (nextIndex: number) => {
    if (isSaving || nextIndex === index) return;
    setIsSaving(true); setPersistenceError(null);
    try {
      if (persistenceEnabled) await recordExperienceProgress(part1Lesson4.id, experiences[nextIndex].id, false);
      navigateToExperience(nextIndex);
    } catch { setPersistenceError("Progress could not be saved. Please try again."); }
    finally { setIsSaving(false); }
  };
  const continueLesson = async () => {
    if (isSaving) return;
    const nextIndex = Math.min(index + 1, experiences.length - 1);
    setIsSaving(true); setPersistenceError(null);
    try {
      if (persistenceEnabled) {
        await recordExperienceProgress(part1Lesson4.id, current.id, true);
        if (nextIndex !== index) await recordExperienceProgress(part1Lesson4.id, experiences[nextIndex].id, false);
      }
      setCompletedExperienceIds((ids) => ids.includes(current.id) ? ids : [...ids, current.id]);
      if (nextIndex !== index) navigateToExperience(nextIndex);
    } catch { setPersistenceError("Progress could not be saved. Please try again."); }
    finally { setIsSaving(false); }
  };
  const lessonComplete = completedExperienceIds.includes(experiences.at(-1)!.id);
  return <div className="lesson-four-preview">
    {!embedded && <header className="lesson-four-header"><Link className="brand" href={developmentPreview ? "/dev/current-work" : "/dashboard"}><span className="brand-mark" aria-hidden="true">A</span><span>Architecting AI</span></Link>{developmentPreview ? <span>Development content preview · No progress is recorded</span> : learnerName ? <LearnerProfileMenu learnerName={learnerName} /> : <Link href="/login">Sign in to save progress</Link>}</header>}
    <div className="lesson-four-context"><div><p className="eyebrow">Part II · Build the Intelligence</p><strong>Lesson 4 · Foundation Models, Prompting & Context Engineering</strong></div><span>{current.number} of 4.6</span></div>
    <div className={`lesson-four-layout ${wideWorkbench ? "is-wide-workbench" : ""} ${wideWorkbench && !learningMapOpen ? "is-map-collapsed" : ""}`}>
      {(!wideWorkbench || learningMapOpen) && <nav className="lesson-four-map" aria-label="Lesson 4 experiences"><div className="lesson-four-map-heading"><p className="eyebrow">Learning Map</p>{wideWorkbench && <button type="button" onClick={() => setLearningMapOpen(false)} aria-label="Collapse Learning Map">×</button>}</div><ol>{experiences.map((item, itemIndex) => <li key={item.id}><button className={`${itemIndex === index ? "is-current" : ""} ${completedExperienceIds.includes(item.id) ? "is-complete" : ""}`} type="button" disabled={isSaving} aria-current={itemIndex === index ? "step" : undefined} onClick={() => void selectExperience(itemIndex)}><span>{item.number}</span><strong>{item.title}</strong></button></li>)}</ol></nav>}
      <main className="lesson-four-main">{wideWorkbench && !learningMapOpen && <button className="wide-workbench-map-trigger" type="button" onClick={() => setLearningMapOpen(true)} aria-expanded="false">☰ Learning Map</button>}<header className="lesson-four-title"><p className="eyebrow">Experience {current.number}</p><h1 ref={headingRef} tabIndex={-1}>{current.title}</h1></header><Experience index={index} /></main>
    </div>
    {persistenceError && <p className="progress-save-error" role="alert">{persistenceError}</p>}
    <nav className={`lesson-four-navigation ${wideWorkbench && !learningMapOpen ? "is-map-collapsed" : ""}`} aria-label="Experience navigation"><button className="secondary-button" type="button" disabled={index === 0 || isSaving} onClick={() => void selectExperience(index - 1)}>Previous</button><span>{index + 1} of {experiences.length}</span><button className="primary-button" type="button" disabled={isSaving || (index === experiences.length - 1 && lessonComplete)} onClick={() => void continueLesson()}>{isSaving ? "Saving…" : index === experiences.length - 1 ? lessonComplete ? "Lesson Complete" : "Complete Lesson" : "Continue"}</button></nav>
  </div>;
}

function Experience({ index }: { index: number }) {
  if (index === 0) return <FoundationModels />;
  if (index === 1) return <ModelRequest />;
  if (index === 2) return <PromptEngineering />;
  if (index === 3) return <ContextEngineering />;
  if (index === 4) return <ModelSelectionLab />;
  return <KnowledgeSummary />;
}

function FoundationModels() {
  const capabilities = ["Summarization", "Classification", "Question answering", "Structured information extraction", "Code generation", "Translation", "Image understanding", "Reasoning over supplied information", "Content generation"];
  const objectives = ["Explain foundation models and how they differ from task-specific models.", "Distinguish LLMs from the broader foundation-model category.", "Understand commercial, managed and open model choices at an architecture level.", "Explain the roles of instructions, prompts, context, examples and conversation state.", "Construct effective prompts and apply a reusable enterprise prompting strategy.", "Explain prompt engineering versus context engineering and why prompting alone is insufficient.", "Recognize how context affects quality, security, latency and cost.", "Apply architect-level model-selection criteria.", "Design the model, prompt and context layer of a simple enterprise AI solution."];
  return <div className="lesson-four-content"><section className="lesson-four-objectives"><p className="eyebrow">Learning objectives</p><h2>By the end of Lesson 4, you should be able to:</h2><ul>{objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></section><Lead>An enterprise AI application is not the LLM.</Lead><p>The model is one component of an architecture. The application around it supplies business purpose, information, controls and an experience people can safely use.</p>
    <TwoUp><Concept title="Traditional, task-specific AI"><Flow nodes={["Input", "Fraud Detection Model", "Fraud / Not Fraud"]} /><Flow nodes={["Customer Data", "Churn Prediction Model", "Probability of Churn"]} /><p>These systems address relatively specific problem classes.</p></Concept><Concept title="Foundation models"><p>Broadly capable models can support many downstream tasks rather than one narrowly defined prediction.</p><div className="lesson-four-chip-grid">{capabilities.map((item) => <span key={item}>{item}</span>)}</div></Concept></TwoUp>
    <Diagram title="One model capability, multiple applications"><div className="foundation-branches"><strong>Foundation Model</strong><div><span>Summarize<small>HR Assistant</small></span><span>Extract Data<small>Invoice System</small></span><span>Answer Questions<small>IT Assistant</small></span></div></div></Diagram>
    <Callout title="Foundation Model ≠ LLM">Foundation model is the broader concept. LLMs are foundation models primarily centered on language. Multimodal foundation models may work with text, images, audio and video.</Callout>
    <section><h2>Architecture perspective</h2><p>Do not ask only, “Which LLM is best?” Ask, “What model capabilities does this workload require?”</p><Flow nodes={["Use Case", "Required Capability", "Model Requirements", "Deployment / Service Options", "Architecture Decision"]} /></section>
  </div>;
}

function ModelRequest() {
  return <div className="lesson-four-content"><Lead>An employee asks: “How many annual leave days am I entitled to?”</Lead><TwoUp><Concept title="Unsafe shortcut"><Flow nodes={["Employee", "LLM", "Answer"]} /><p>A general-purpose model does not automatically know the organization’s current authoritative leave policy.</p></Concept><Concept title="Useful application pattern"><Flow nodes={["Employee", "Enterprise Application", "Instructions + Relevant Enterprise Context", "Foundation Model", "Generated Answer"]} /></Concept></TwoUp>
    <Diagram title="The broader architecture we will build"><Flow nodes={["User", "Identity", "Application", "Retrieve Authorized Knowledge", "Construct Context", "Model", "Validate / Guard", "Response"]} /><p>Later lessons build these layers progressively.</p></Diagram>
    <section><h2>Anatomy of a model request</h2><Flow nodes={["System Instructions + User Request + Context + Examples + Conversation State", "Model", "Response"]} /><div className="lesson-four-card-grid"><Concept title="System instructions"><p>Define the assistant’s role, boundaries and response behavior.</p><Quote>You are an internal IT support assistant. Answer using supplied company information. If it is insufficient, say so. Return concise answers suitable for employees.</Quote></Concept><Concept title="User prompt"><Quote>How can I reset my corporate VPN password?</Quote><p>The immediate task or question from the user.</p></Concept><Concept title="Context"><Quote>Corporate VPN password reset procedure: 1. Open Self Service. 2. Select Password Management. 3. Verify identity using MFA.</Quote><p>Authoritative information supplied for this request.</p></Concept><Concept title="Examples / few-shot"><Quote>Question: My account is locked. Answer: Use the Account Unlock option in Self Service.</Quote><p>Examples communicate desired behavior and response patterns.</p></Concept></div></section>
  </div>;
}

function PromptEngineering() {
  const [choice, setChoice] = useState<string | null>(null); const [enough, setEnough] = useState<string | null>(null);
  const framework = [["ROLE", "Who should the AI behave as?"], ["TASK", "What exactly should it accomplish?"], ["CONTEXT", "What information does it need?"], ["CONSTRAINTS", "What must or mustn’t it do?"], ["OUTPUT", "What should the response look like?"], ["EXAMPLES", "What does a good response look like?"]];
  const strategies = [["Clear instructions", "State the task specifically and remove avoidable ambiguity."], ["Relevant context", "Supply the information needed to perform the task."], ["Constraints", "Define what the model must and must not do."], ["Expected output", "Specify useful fields, tables, bullets or other response shape."], ["Delimiters", "Separate instructions from enterprise data clearly."], ["Zero-shot", "Give the task without examples."], ["Few-shot", "Provide one or more examples of desired behavior."], ["Structured output", "Use JSON, defined fields, tables or bullets—especially when another component consumes the response."], ["Missing information", "Require the model to say when the answer cannot be determined from supplied information."], ["Manageable stages", "Break complex tasks into stages where that improves control."], ["Representative testing", "Test multiple realistic and edge cases; one successful response does not prove reliability."]];
  return <div className="lesson-four-content"><Lead>Weak prompt: “Explain server issue.”</Lead><p>What is missing? Which server? What problem? Who is the audience? Which information should be used? What result is required? What must the model avoid?</p>
    <Concept title="A stronger enterprise prompt"><StructuredPrompt /></Concept>
    <section><h2>A reusable prompting framework</h2><p>This is a thinking framework, not a rigid syntax that every prompt must mechanically reproduce.</p><div className="prompt-framework">{framework.map(([title, text]) => <div key={title}><strong>{title}</strong><span>{text}</span></div>)}</div></section>
    <section><h2>Practical prompting strategies</h2><div className="strategy-list">{strategies.map(([title, text], strategyIndex) => <details key={title} open={strategyIndex < 4}><summary>{strategyIndex + 1}. {title}</summary><p>{text}</p>{title === "Missing information" && <Quote>If the supplied information is insufficient, state that the answer cannot be determined from the available information.</Quote>}</details>)}</div></section>
    <Challenge title="Interactive prompt challenge" prompt="The organization wants AI to summarize Priority-1 incidents for senior management."><p>Incident data includes technical logs, engineer comments, affected applications, business impact and recovery actions.</p><Choice selected={choice === "a"} onClick={() => setChoice("a")} label="Option A">“Summarize this incident.”</Choice><Choice selected={choice === "b"} onClick={() => setChoice("b")} label="Option B">You are an enterprise incident communication assistant. Create an executive summary using only provided information. Include the affected service, business impact, current status, recovery action and outstanding risk. Omit raw logs unless needed. Use “Not available” for missing information.</Choice>{choice && <Feedback correct={choice === "b"}>{choice === "b" ? "Option B defines audience, task, evidence boundary, output and missing-information behavior." : "Option A leaves the audience, evidence boundary, output and failure behavior ambiguous."}</Feedback>}
      <h3>Is a better prompt enough?</h3><div className="inline-choices"><button type="button" onClick={() => setEnough("yes")}>Yes</button><button type="button" onClick={() => setEnough("no")}>No</button></div>{enough && <Feedback correct={enough === "no"}>No. Incomplete, stale, irrelevant or unauthorized information cannot be repaired by an excellent prompt.</Feedback>}</Challenge>
    <Callout title="Architect principle">Don’t try to solve an architecture problem with a bigger prompt.</Callout>
  </div>;
}

function ContextEngineering() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const scenarios = [{ id: "a", title: "Correct model · Correct context · Poor instruction", answer: "Prompt design" }, { id: "b", title: "Correct model · Excellent prompt · Outdated HR policy", answer: "Context/data quality" }, { id: "c", title: "Excellent prompt · Correct context · Image task with text-only model", answer: "Model/capability selection" }];
  return <div className="lesson-four-content"><TwoUp><Concept title="Prompt engineering"><Lead>How should I instruct the model?</Lead></Concept><Concept title="Context engineering"><Lead>What information should the model have available when performing this task?</Lead></Concept></TwoUp>
    <section><h2>Annual-leave example</h2><Quote>Can I carry forward my unused annual leave?</Quote><p>Context engineering determines whether the model receives the correct company information, employee population, country or region, current policy, relevant section, effective date, authorized information and necessary conversation state.</p></section>
    <Diagram title="The context envelope"><div className="context-envelope"><strong>MODEL CONTEXT</strong>{["System Instructions", "User Request", "Relevant Enterprise Data", "Conversation History", "Examples", "Tool Results", "Retrieved Knowledge"].map((item) => <span key={item}>{item}</span>)}</div><Flow nodes={["Model Context", "Foundation Model", "Response"]} /></Diagram>
    <p>Context may include application instructions, user messages, retrieved documents, database results, API responses, tool outputs, conversation state, examples and authorized user-specific information.</p><Callout title="More context is not automatically better context.">Treat context as an architecture resource: Relevant + Authorized + Current + Sufficient + Efficient.</Callout>
    <div className="lesson-four-card-grid">{[["Quality", "Wrong context can produce wrong answers."], ["Security", "Unauthorized context can create data exposure."], ["Cost", "Additional model processing can increase usage cost."], ["Latency", "Large requests may increase processing time."], ["Relevance", "Irrelevant information can reduce usefulness."], ["Freshness", "Current questions may require current authoritative data."]].map(([title, text]) => <Concept key={title} title={title}><p>{text}</p></Concept>)}</div>
    <Challenge title="Prompt vs context vs model" prompt="Identify the primary failure in each scenario.">{scenarios.map((scenario) => <div className="scenario-row" key={scenario.id}><strong>{scenario.title}</strong><div>{["Prompt design", "Context/data quality", "Model/capability selection"].map((answer) => <button className={answers[scenario.id] === answer ? "is-selected" : ""} type="button" key={answer} onClick={() => setAnswers((current) => ({ ...current, [scenario.id]: answer }))}>{answer}</button>)}</div>{answers[scenario.id] && <Feedback correct={answers[scenario.id] === scenario.answer}>{answers[scenario.id] === scenario.answer ? `Correct: ${scenario.answer}.` : `Reconsider which input to the architecture is mismatched.`}</Feedback>}</div>)}</Challenge>
    <Diagram title="Enterprise AI quality"><div className="quality-equation">Model Capability <b>+</b> Prompt / Instructions <b>+</b> Context Quality <b>+</b> Application Controls <b>+</b> Evaluation</div><p>No single component guarantees production quality.</p></Diagram>
  </div>;
}

function ModelSelectionLab() {
  const criteria = [["Capability", "Reasoning, coding, extraction, multimodality, tool use and structured output"], ["Quality", "Performance on the actual enterprise workload"], ["Latency", "Required application response time"], ["Context requirements", "Information the workload must process"], ["Cost", "Expected usage economics"], ["Security & privacy", "How and where enterprise information is processed"], ["Deployment model", "Model API, managed cloud AI service, private deployment or self-hosted/open model where appropriate"], ["Regional / compliance", "Location and regulatory requirements"], ["Operational support", "Availability, quotas, monitoring and model/version changes"]];
  return <div className="lesson-four-content"><section><h2>Model selection is a workload decision</h2><div className="selection-criteria">{criteria.map(([title, text]) => <div key={title}><strong>{title}</strong><span>{text}</span></div>)}</div><Flow nodes={["Business Requirement", "AI Capability Requirement", "Model Candidates", "Evaluation", "Security / Cost / Latency", "Architecture Decision"]} /><Callout title="Architect principle">Don’t select a model from a leaderboard. Select it against the workload.</Callout></section>
    <ArchitectureLabFourWorkbench />
  </div>;
}

const questions = [
  { prompt: "What distinguishes a foundation model from a narrowly task-specific model?", options: ["It supports broad capabilities and multiple downstream tasks.", "It always uses language only.", "It is trained for one fixed prediction."], answer: 0, feedback: "Foundation models provide broad capabilities that applications specialize for downstream tasks." },
  { prompt: "An excellent prompt is supplied with an outdated HR policy. What is primarily wrong?", options: ["Prompt length", "Context/data quality", "Output formatting"], answer: 1, feedback: "The instruction may be excellent, but the supplied enterprise information is stale." },
  { prompt: "What primarily distinguishes prompt engineering from context engineering?", options: ["Prompts focus on instructions; context engineering addresses the broader information and state available.", "They are identical.", "Context engineering selects fonts and layouts."], answer: 0, feedback: "Prompt engineering shapes instructions; context engineering deliberately assembles the information and state available for the task." },
  { prompt: "Why not maximize the amount of context sent to a model?", options: ["Models cannot receive any enterprise information.", "Relevance, efficiency, limits, latency, cost and quality all matter.", "More context always lowers quality."], answer: 1, feedback: "Useful context must be relevant, authorized, current, sufficient and efficient—not merely large." },
  { prompt: "An application requires image analysis, but the selected model accepts only text. What failed?", options: ["Prompt design", "Model/capability selection", "Certificate issuance"], answer: 1, feedback: "The required capability and selected model do not match." },
  { prompt: "Why is Employee → LLM → Answer insufficient for a production policy assistant?", options: ["It lacks enterprise knowledge, authorization, controls, grounding, evaluation and operational capabilities.", "Employees cannot ask questions in natural language.", "Every policy assistant must be self-hosted."], answer: 0, feedback: "A production application needs authoritative knowledge, access controls, safeguards, evaluation and operational architecture around the model." },
];

function KnowledgeSummary() {
  const [questionIndex, setQuestionIndex] = useState(0); const [selected, setSelected] = useState<number | null>(null); const [checked, setChecked] = useState(false); const [score, setScore] = useState(0); const [summaryVisible, setSummaryVisible] = useState(false); const question = questions[questionIndex]; const correct = selected === question.answer;
  const checkAnswer = () => { if (selected === null || checked) return; setChecked(true); if (selected === question.answer) setScore((value) => value + 1); };
  const nextQuestion = () => { setQuestionIndex((value) => Math.min(value + 1, questions.length - 1)); setSelected(null); setChecked(false); };
  const complete = checked && questionIndex === questions.length - 1;
  return <div className="lesson-four-content"><section><div className="knowledge-check-header"><p className="eyebrow">Knowledge Check</p><span>Question {questionIndex + 1} of {questions.length}</span></div><p>These questions provide immediate feedback and are not part of the formal Part II assessment.</p><div className="lesson-four-knowledge"><div className="knowledge-progress" aria-hidden="true"><span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div><h2><span>{questionIndex + 1}</span>{question.prompt}</h2><div className="knowledge-options">{question.options.map((option, optionIndex) => { const state = checked && optionIndex === question.answer ? "is-correct" : checked && optionIndex === selected ? "is-incorrect" : selected === optionIndex ? "is-selected" : ""; return <button className={state} type="button" disabled={checked} key={option} onClick={() => setSelected(optionIndex)}><span>{String.fromCharCode(65 + optionIndex)}</span>{option}</button>; })}</div>{!checked && <button className="primary-button" type="button" disabled={selected === null} onClick={checkAnswer}>Check Answer</button>}{checked && <><Feedback correct={correct}>{correct ? question.feedback : `Incorrect. ${question.feedback}`}</Feedback>{questionIndex < questions.length - 1 && <button className="lab-next-button" type="button" onClick={nextQuestion}>Next Question →</button>}{complete && <div className="knowledge-complete"><strong>Knowledge Check Complete</strong><span>Score: {score} / {questions.length}</span><button type="button" onClick={() => setSummaryVisible(true)}>View Lesson Summary →</button></div>}</>}</div></section>
    {summaryVisible && <><section className="lesson-four-summary"><p className="eyebrow">Lesson summary</p><h2>Five durable ideas</h2>{[["1", "The model is not the application.", "The model is one component of the AI architecture."], ["2", "Foundation models provide broad capability.", "Enterprise applications specialize those capabilities for particular workloads."], ["3", "Prompts tell the model what to do.", "Good instructions reduce ambiguity and improve controllability."], ["4", "Context determines what the model has available.", "Enterprise AI requires deliberate context engineering, not merely clever prompts."], ["5", "Architecture connects them.", "Business need, capability, instructions, enterprise context, model and controlled output form one system."]].map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}<Flow nodes={["Business Need", "Model Capability", "Instructions", "Enterprise Context", "Model", "Controlled Output"]} /></section><section className="lesson-five-bridge"><p className="eyebrow">Next</p><h2>How does the intelligence inside these models actually work?</h2><strong>Lesson 5 · AI Fundamentals for Architects: From Machine Learning to Tokens, Transformers & Embeddings</strong><p>Lesson 5 will introduce those foundations without expanding them here.</p></section></>}
  </div>;
}

function StructuredPrompt() { return <pre className="structured-prompt"><strong>ROLE</strong>{"\n"}You are an enterprise IT incident analyst.{"\n\n"}<strong>TASK</strong>{"\n"}Analyze the incident information below.{"\n\n"}<strong>OBJECTIVE</strong>{"\n"}Identify probable cause, business impact and recommended next action.{"\n\n"}<strong>CONSTRAINTS</strong>{"\n"}Use only the incident information provided. Do not invent missing technical facts.{"\n\n"}<strong>OUTPUT</strong>{"\n"}Incident summary · Probable cause · Impact · Recommended action{"\n\n"}<strong>INCIDENT DATA</strong>{"\n"}…</pre>; }
function Flow({ nodes }: { nodes: string[] }) { return <div className="lesson-four-flow">{nodes.map((node, index) => <span key={`${node}-${index}`}>{node}{index < nodes.length - 1 && <b aria-hidden="true">↓</b>}</span>)}</div>; }
function Lead({ children }: { children: React.ReactNode }) { return <p className="lesson-four-lead">{children}</p>; }
function Quote({ children }: { children: React.ReactNode }) { return <blockquote className="lesson-four-quote">{children}</blockquote>; }
function TwoUp({ children }: { children: React.ReactNode }) { return <div className="lesson-four-two-up">{children}</div>; }
function Concept({ title, children }: { title: string; children: React.ReactNode }) { return <article className="lesson-four-concept"><h3>{title}</h3>{children}</article>; }
function Diagram({ title, children }: { title: string; children: React.ReactNode }) { return <figure className="lesson-four-diagram"><figcaption>{title}</figcaption>{children}</figure>; }
function Callout({ title, children }: { title: string; children: React.ReactNode }) { return <aside className="lesson-four-callout"><strong>{title}</strong><p>{children}</p></aside>; }
function Challenge({ title, prompt, children }: { title: string; prompt: string; children: React.ReactNode }) { return <section className="lesson-four-challenge"><p className="eyebrow">Decision challenge</p><h2>{title}</h2><p>{prompt}</p>{children}</section>; }
function Choice({ label, selected, onClick, children }: { label: string; selected: boolean; onClick: () => void; children: React.ReactNode }) { return <button className={`lesson-four-choice ${selected ? "is-selected" : ""}`} type="button" onClick={onClick}><strong>{label}</strong><span>{children}</span></button>; }
function Feedback({ correct, children }: { correct: boolean; children: React.ReactNode }) { return <div className={`lesson-four-feedback ${correct ? "is-correct" : ""}`} role="status"><strong>{correct ? "Correct" : "Review"}</strong><p>{children}</p></div>; }
