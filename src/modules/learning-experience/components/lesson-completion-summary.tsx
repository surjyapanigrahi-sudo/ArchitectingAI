import type { LessonCompletionSummary } from "../types";

function EmphasizedText({ text, terms }: { text: string; terms: string[] }) {
  const escapedTerms = [...terms].sort((a, b) => b.length - a.length).map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escapedTerms.join("|")})`, "g");
  const emphasized = new Set(terms);

  return text.split(pattern).map((part, index) => emphasized.has(part) ? <strong key={`${part}-${index}`}>{part}</strong> : part);
}

export function LessonCompletionSummary({ summary, lessonNumber }: { summary: LessonCompletionSummary; lessonNumber: string }) {
  return <section className="lesson-summary" aria-labelledby="lesson-summary-title">
    <p className="eyebrow">Lesson {lessonNumber} complete</p>
    <h1 id="lesson-summary-title" tabIndex={-1}>Lesson Summary</h1>
    <p className="lesson-summary-narrative"><EmphasizedText text={summary.narrative} terms={summary.emphasis} /></p>
    <h3>Key Takeaways</h3>
    <ul>{summary.takeaways.map((takeaway) => <li key={takeaway}><EmphasizedText text={takeaway} terms={summary.emphasis} /></li>)}</ul>
  </section>;
}
