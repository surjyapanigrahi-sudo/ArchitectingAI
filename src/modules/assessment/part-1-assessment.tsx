"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { part1QuestionBank } from "./part-1-question-bank";
import type { AssessmentOption, AttemptQuestion, PersistentAssessmentResult, PersistentCertificate } from "./types";

const PASS_MARK = 70;
const ASSESSMENT_SIZE = 15;
const LESSON_DISTRIBUTION = { 1: 4, 2: 5, 3: 6 } as const;

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function createPartOneAttempt(previousIds: string[] = []): AttemptQuestion[] {
  const selected = ([1, 2, 3] as const).flatMap((lesson) => shuffle(part1QuestionBank.filter((question) => question.lesson === lesson)).slice(0, LESSON_DISTRIBUTION[lesson]));
  if (previousIds.length && selected.map((question) => question.id).sort().join() === [...previousIds].sort().join()) {
    const replacement = part1QuestionBank.find((candidate) => !selected.some((question) => question.id === candidate.id) && selected.some((question) => question.lesson === candidate.lesson));
    if (replacement) selected[selected.findIndex((question) => question.lesson === replacement.lesson)] = replacement;
  }
  return shuffle(selected).map((question) => ({ ...question, options: shuffle(question.options) }));
}

export function calculatePartOneScore(correct: number) { return Math.round((correct / ASSESSMENT_SIZE) * 100); }
function optionLabel(options: AssessmentOption[], optionId?: string) { return options.find((option) => option.id === optionId)?.label ?? "Not answered"; }
type Phase = "entry" | "questions" | "review" | "result" | "feedback" | "certificate";

export function PartOneAssessment({ learnerName, initialCertificate, initialResult, persistenceEnabled }: { learnerName: string | null; initialCertificate: PersistentCertificate | null; initialResult: PersistentAssessmentResult | null; persistenceEnabled: boolean }) {
  const [phase, setPhase] = useState<Phase>(initialResult ? "result" : "entry");
  const [questions, setQuestions] = useState<AttemptQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState<number | null>(initialResult?.scorePercent ?? null);
  const [correctCount, setCorrectCount] = useState(initialResult?.correctCount ?? 0);
  const [bestPassingScore, setBestPassingScore] = useState<number | null>(initialCertificate?.scorePercent ?? null);
  const [completionDate, setCompletionDate] = useState(initialCertificate ? new Date(initialCertificate.issuedAt).toLocaleDateString() : "");
  const [certificateReference, setCertificateReference] = useState(initialCertificate?.certificateReference ?? "");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const journeyHref = "/workshops/enterprise-ai-foundations";

  const startAttempt = async () => {
    if (!acknowledged || saving) return;
    const nextQuestions = createPartOneAttempt(questions.map((question) => question.id));
    setSaving(true); setPersistenceError(null);
    if (persistenceEnabled) {
      const { data, error } = await createClient().rpc("start_part1_assessment", { p_question_ids: nextQuestions.map((question) => question.id) });
      const record = Array.isArray(data) ? data[0] : data;
      if (error || !record?.attempt_id) { setPersistenceError("We could not start a saved assessment attempt. Please try again."); setSaving(false); return; }
      setAttemptId(record.attempt_id as string);
    } else setAttemptId("development-attempt");
    setQuestions(nextQuestions); setAnswers({}); setQuestionIndex(0); setScore(null); setCorrectCount(0); setSaving(false); setPhase("questions");
  };
  const submit = async () => {
    if (!attemptId || saving) return;
    setSaving(true); setPersistenceError(null);
    let correct = questions.filter((question) => answers[question.id] === question.correctOptionId).length;
    let percentage = calculatePartOneScore(correct);
    let passed = percentage >= PASS_MARK;
    if (persistenceEnabled) {
      const { data, error } = await createClient().rpc("submit_part1_assessment", { p_attempt_id: attemptId, p_answers: answers });
      const record = Array.isArray(data) ? data[0] : data;
      if (error || !record) { setPersistenceError("We could not save your submitted assessment. Your result has not been finalized. Please try again."); setSaving(false); return; }
      correct = record.correct_count as number; percentage = record.score_percent as number; passed = record.passed as boolean;
      if (record.certificate_reference) { setCertificateReference(record.certificate_reference as string); setBestPassingScore(record.certificate_score as number); setCompletionDate(new Date(record.certificate_issued_at as string).toLocaleDateString()); }
    }
    setCorrectCount(correct); setScore(percentage);
    if (passed && !persistenceEnabled) { setBestPassingScore((current) => Math.max(current ?? 0, percentage)); setCompletionDate((current) => current || new Date().toLocaleDateString()); }
    setSaving(false); setPhase("result");
  };

  if (phase === "entry") return <AssessmentShell><p className="eyebrow">Part 1 Assessment</p><h1>Enterprise AI Architecture Foundations</h1><div className="assessment-facts"><span><strong>15</strong> Questions</span><span><strong>70%</strong> Pass Mark</span><span><strong>15–20</strong> Minutes</span></div><p>This assessment checks your ability to apply the architecture principles covered across Lessons 1–3.</p><p>Complete all questions before submitting your answers. Answers and explanations are shown only after final submission.</p><aside className="assessment-start-notice" aria-labelledby="assessment-start-notice-title"><strong id="assessment-start-notice-title">Important before you start</strong><ul><li>Complete the assessment in one sitting.</li><li>Do not refresh, close, or navigate away while an attempt is in progress.</li><li>Your answers are submitted only when you select “Submit Assessment.”</li><li>If your session is interrupted before submission, you may need to restart the attempt.</li></ul></aside><label className="assessment-acknowledgement"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} /><span>I understand and I’m ready to begin.</span></label>{persistenceError && <p className="assessment-warning" role="alert">{persistenceError}</p>}<div className="assessment-entry-actions"><button className="primary-button" type="button" disabled={!acknowledged || saving} onClick={startAttempt}>{saving ? "Preparing Assessment…" : "Start Assessment"}</button>{initialCertificate && <button className="secondary-button" type="button" onClick={() => setPhase("certificate")}>View Existing Certificate</button>}</div></AssessmentShell>;

  if (phase === "questions") {
    const question = questions[questionIndex];
    return <AssessmentShell><p className="eyebrow">Question {questionIndex + 1} of {ASSESSMENT_SIZE}</p><div className="assessment-progress" aria-hidden="true"><span style={{ width: `${((questionIndex + 1) / ASSESSMENT_SIZE) * 100}%` }} /></div><h1>{question.prompt}</h1><fieldset className="assessment-options"><legend className="sr-only">Select one answer</legend>{question.options.map((option) => <label key={option.id} className={answers[question.id] === option.id ? "is-selected" : ""}><input type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))} /><span>{option.label}</span></label>)}</fieldset><nav className="assessment-navigation" aria-label="Question navigation"><button className="secondary-button" type="button" disabled={questionIndex === 0} onClick={() => setQuestionIndex((index) => index - 1)}>Previous</button>{questionIndex < ASSESSMENT_SIZE - 1 ? <button className="primary-button" type="button" onClick={() => setQuestionIndex((index) => index + 1)}>Next</button> : <button className="primary-button" type="button" onClick={() => setPhase("review")}>Review Answers</button>}</nav></AssessmentShell>;
  }

  if (phase === "review") {
    const allAnswered = questions.every((question) => answers[question.id]);
    return <AssessmentShell><p className="eyebrow">Part 1 Assessment</p><h1>Review Your Answers</h1><p>Check that every question has an answer before final submission. Correctness is shown only after you submit.</p><ol className="answer-review">{questions.map((question, index) => <li key={question.id}><button type="button" onClick={() => { setQuestionIndex(index); setPhase("questions"); }}><span>Question {index + 1}</span><strong className={answers[question.id] ? "is-answered" : "is-unanswered"}>{answers[question.id] ? "Answered" : "Not answered"}</strong></button></li>)}</ol>{!allAnswered && <p className="assessment-warning" role="status">Answer every question before submitting.</p>}{persistenceError && <p className="assessment-warning" role="alert">{persistenceError}</p>}<div className="assessment-navigation"><button className="secondary-button" type="button" onClick={() => { setQuestionIndex(ASSESSMENT_SIZE - 1); setPhase("questions"); }}>Back to Questions</button><button className="primary-button" type="button" disabled={!allAnswered || saving} onClick={submit}>{saving ? "Saving Result…" : "Submit Assessment"}</button></div></AssessmentShell>;
  }

  if (phase === "feedback") return <AssessmentShell><p className="eyebrow">Post-submission review</p><h1>Assessment Feedback</h1><div className="feedback-list">{questions.map((question, index) => { const correct = answers[question.id] === question.correctOptionId; return <article key={question.id}><p className="eyebrow">Lesson {question.lesson} · {question.concept}</p><h2>{index + 1}. {question.prompt}</h2><p className={`feedback-answer ${correct ? "is-correct" : "is-incorrect"}`}><strong>Your answer — {correct ? "Correct" : "Incorrect"}</strong><span>{optionLabel(question.options, answers[question.id])}</span></p><p className="feedback-answer feedback-correct-answer"><strong>Correct answer</strong><span>{optionLabel(question.options, question.correctOptionId)}</span></p><p className={correct ? "feedback-correct" : "feedback-review"}>{correct ? "Correct. " : "Review this idea. "}{question.explanation}</p></article>; })}</div><button className="secondary-button" type="button" onClick={() => setPhase("result")}>Back to Result</button></AssessmentShell>;

  if (phase === "certificate" && bestPassingScore !== null && learnerName) return <main className="certificate-page"><article className="certificate" aria-labelledby="certificate-title"><p className="certificate-brand">Architecting AI</p><p className="certificate-motto">Think · Design · Decide</p><p>Certificate of Completion</p><h1 id="certificate-title">Awarded to</h1><strong className="certificate-name">{learnerName}</strong><p>for successfully completing</p><h2>Enterprise AI Architecture Foundations</h2><p>and demonstrating foundational understanding of Enterprise AI Architecture.</p><p>Certificate ID: <strong>{certificateReference}</strong></p><footer><span>Assessment Score: <strong>{bestPassingScore}%</strong></span><span>Completion Date: <strong>{completionDate}</strong></span></footer></article><div className="certificate-actions"><button className="secondary-button" type="button" onClick={() => setPhase(initialCertificate && score === null ? "entry" : "result")}>Back</button><Link className="primary-button button-link" href={`/verify-certificate?reference=${encodeURIComponent(certificateReference)}`}>Verify Certificate</Link><Link className="secondary-button button-link" href={journeyHref}>Back to Learning Journey</Link></div></main>;

  const percentage = score ?? 0;
  const passed = percentage >= PASS_MARK;
  const certificateReady = Boolean(learnerName);
  return <AssessmentShell><p className="eyebrow">Part 1 Assessment</p><div className={`assessment-result ${passed ? "is-pass" : "is-review"}`} role="status" aria-live="polite"><h1>{passed ? "Passed" : "Keep Building Your Architecture Thinking"}</h1><p className="score">{percentage}%</p><p>{correctCount} of 15 correct</p><p>{passed ? "You have demonstrated the foundational architecture understanding covered across Part 1." : "You are close. Review the architecture principles behind the questions you found challenging, then try again."}</p></div>{passed && !certificateReady && <p className="assessment-warning" role="status">Add your full name to your learner profile before viewing the certificate.</p>}<div className="result-actions">{questions.length > 0 && <button className="secondary-button" type="button" onClick={() => setPhase("feedback")}>Review Feedback</button>}{passed ? <><button className="primary-button" type="button" disabled={!certificateReady || !certificateReference} onClick={() => setPhase("certificate")}>View Certificate</button><button className="secondary-button" type="button" disabled>Part 2 Coming Next</button></> : <><Link className="secondary-button button-link" href={journeyHref}>Review Part 1</Link><button className="primary-button" type="button" onClick={() => { setAcknowledged(false); setPhase("entry"); }}>Retake Assessment</button></>}</div></AssessmentShell>;
}

function AssessmentShell({ children }: { children: React.ReactNode }) { return <main className="assessment-page"><section className="assessment-card">{children}</section></main>; }
