import Link from "next/link";
import { notFound } from "next/navigation";
import { enterpriseAiFoundations } from "@/modules/workshops/enterprise-ai-foundations";
import { part1Lesson1, part1Lesson2, part1Lesson3 } from "@/modules/learning-experience/data/part-1-lessons";
import { remainingShiftedPlannedLessons as shiftedPlannedLessons } from "@/modules/learning-experience/data/shifted-planned-lessons";
import { architectThinkingLesson } from "@/modules/learning-experience/data/architect-thinking-lesson";

export default async function WorkshopOverview({ params }: { params: Promise<{ workshopSlug: string }> }) {
  const { workshopSlug } = await params; if (workshopSlug !== enterpriseAiFoundations.slug) notFound();
  const lessons = [part1Lesson1, part1Lesson2, part1Lesson3, architectThinkingLesson];
  return <section className="workshop-overview"><p className="eyebrow">Part 1</p><h1>Enterprise AI Architecture Foundations</h1><p className="workshop-summary">Build the foundations, understand the connected architecture domains, and apply them to your first enterprise AI workload.</p><div className="part-one-lessons">{lessons.map((lesson, index) => <article className="demo-lesson-card" key={lesson.id}><div><span>Lesson {index + 1} · {lesson.experiences.length} experiences</span><h2>{lesson.title}</h2><p>{lesson.description}</p></div><Link className={index === 0 ? "primary-button button-link" : "secondary-button button-link"} href={`/workshops/${enterpriseAiFoundations.slug}/${lesson.slug}`}>Open Lesson {index + 1}</Link></article>)}</div><section className="future-lessons" aria-labelledby="planned-lessons-title"><h2 id="planned-lessons-title">Later lessons</h2><p>The existing planned curriculum continues after the expanded Part 1 foundations.</p><ol>{shiftedPlannedLessons.map((lesson) => <li key={lesson.originalNumber}><span>Lesson {lesson.displayNumber}</span><div><strong>{lesson.title}</strong><small>{lesson.originalPart} · Coming Soon</small>{lesson.description && <p>{lesson.description}</p>}</div></li>)}</ol></section><div className="demo-lesson-card"><div><span>Engine demonstration</span><h2>Explore the reusable lesson engine</h2><p>The approved placeholder demo remains available for engine validation.</p></div><Link className="secondary-button" href="/workshops/enterprise-ai-foundations/demo-learning-experience">Open Demo</Link></div></section>;
}
