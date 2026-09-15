import Link from "next/link";
import { notFound } from "next/navigation";
import { enterpriseAiFoundations } from "@/modules/workshops/enterprise-ai-foundations";
import { productionPart1Lessons } from "@/modules/learning-experience/data/part-1-lessons";
import { remainingShiftedPlannedLessons as shiftedPlannedLessons } from "@/modules/learning-experience/data/shifted-planned-lessons";

export default async function WorkshopOverview({ params }: { params: Promise<{ workshopSlug: string }> }) {
  const { workshopSlug } = await params;
  if (workshopSlug !== enterpriseAiFoundations.slug) notFound();
  const lessons = productionPart1Lessons;

  return <section className="workshop-overview">
    <p className="eyebrow">Part 1</p>
    <h1>Enterprise AI Architecture Foundations</h1>
    <p className="workshop-summary">Build the foundations, understand the connected architecture domains, and apply them to your first enterprise AI workload.</p>
    <div className="part-one-lessons" id="learning-journey">{lessons.map((lesson, index) => <article className="demo-lesson-card" key={lesson.id}><div><span>Lesson {index + 1} · {lesson.experiences.length} experiences</span><h2>{lesson.title}</h2><p>{lesson.description}</p></div><Link className={index === 0 ? "primary-button button-link" : "secondary-button button-link"} href={`/workshops/${enterpriseAiFoundations.slug}/${lesson.slug}`}>Open Lesson {index + 1}</Link></article>)}</div>
    <section className="course-production-note" aria-labelledby="video-production-title"><p className="eyebrow">Course information</p><h2 id="video-production-title">AI-Assisted Video Production</h2><p>Selected instructional videos in Architecting AI were produced using Leadde, an AI-assisted video creation platform.</p><p>Course concepts, architecture frameworks, instructional scripts, learning activities and assessments are independently designed and reviewed for the Architecting AI learning program.</p></section>
    <section className="future-lessons" aria-labelledby="planned-lessons-title"><h2 id="planned-lessons-title">Later lessons</h2><p>The existing planned curriculum continues after the expanded Part 1 foundations.</p><ol>{shiftedPlannedLessons.map((lesson) => <li key={lesson.originalNumber}><span>Lesson {lesson.displayNumber}</span><div><strong>{lesson.title}</strong><small>{lesson.originalPart} · Coming Soon</small>{lesson.description && <p>{lesson.description}</p>}</div></li>)}</ol></section>
    <div className="demo-lesson-card"><div><span>Engine demonstration</span><h2>Explore the reusable lesson engine</h2><p>The approved placeholder demo remains available for engine validation.</p></div><Link className="secondary-button" href="/workshops/enterprise-ai-foundations/demo-learning-experience">Open Demo</Link></div>
  </section>;
}
