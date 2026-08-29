import Link from "next/link";
import { notFound } from "next/navigation";
import { getDevelopmentAuthContext } from "@/modules/auth/development-auth";
import { LessonCompletionSummary } from "@/modules/learning-experience/components/lesson-completion-summary";
import { part1Lesson1, part1Lesson2, part1Lesson3 } from "@/modules/learning-experience/data/part-1-lessons";

const destinationGroups = [
  { title: "Current Development", links: [{ label: "Student Dashboard", href: "/dashboard" }, { label: "Learning Journey", href: "/workshops/enterprise-ai-foundations" }] },
  { title: "Videos", links: [{ label: "Course Overview", href: "/" }, { label: "Lesson 1", href: `/workshops/enterprise-ai-foundations/${part1Lesson1.slug}` }, { label: "Lesson 2", href: `/workshops/enterprise-ai-foundations/${part1Lesson2.slug}` }] },
  { title: "Summaries", links: [{ label: "Lesson 1", href: "/dev/current-work?view=lesson-1-summary" }, { label: "Lesson 2", href: "/dev/current-work?view=lesson-2-summary" }, { label: "Lesson 3", href: "/dev/current-work?view=lesson-3-summary" }] },
  { title: "Assessment & Certificate", links: [{ label: "Assessment", href: "/workshops/enterprise-ai-foundations/part-1-assessment" }, { label: "Certificate", href: "/dev/current-work?view=certificate" }, { label: "Verify Certificate", href: "/verify-certificate" }] },
] as const;

const summaries = {
  "lesson-1-summary": { lessonNumber: "1", summary: part1Lesson1.lessonSummary },
  "lesson-2-summary": { lessonNumber: "2", summary: part1Lesson2.lessonSummary },
  "lesson-3-summary": { lessonNumber: "3", summary: part1Lesson3.lessonSummary },
} as const;

export default async function CurrentWorkPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const developmentAuth = getDevelopmentAuthContext();
  if (process.env.NODE_ENV !== "development" && !developmentAuth.bypassEnabled) notFound();
  const { view } = await searchParams;
  const summaryPreview = view && view in summaries ? summaries[view as keyof typeof summaries] : null;

  if (summaryPreview?.summary) return <main className="assessment-page"><section className="assessment-card"><DeveloperPreviewHeader /><LessonCompletionSummary lessonNumber={summaryPreview.lessonNumber} summary={summaryPreview.summary} /><Link className="secondary-button button-link" href="/dev/current-work">Back to Current Work</Link></section></main>;
  if (view === "certificate") return <main className="certificate-page"><DeveloperPreviewHeader /><article className="certificate" aria-labelledby="dev-certificate-title"><p className="certificate-brand">Architecting AI</p><p>Certificate of Completion</p><h1 id="dev-certificate-title">Awarded to</h1><strong className="certificate-name">Development Learner</strong><p>for successfully completing</p><h2>Enterprise AI Architecture Foundations</h2><p>and demonstrating foundational understanding of Enterprise AI Architecture.</p><footer><span>Assessment Score: <strong>80%</strong></span><span>Completion Date: <strong>Development preview</strong></span></footer></article><div className="certificate-actions"><Link className="secondary-button button-link" href="/dev/current-work">Back to Current Work</Link></div></main>;

  return <main className="assessment-page"><section className="assessment-card dev-current-work"><p className="eyebrow">Development only</p><h1>Current Work</h1><p>Compact access to current Part 1 development surfaces.</p><nav aria-label="Current development work">{destinationGroups.map((group) => <section key={group.title}><h2>{group.title}</h2><div>{group.links.map((destination) => <Link key={destination.href} href={destination.href}>{destination.label}<span aria-hidden="true">→</span></Link>)}</div></section>)}</nav></section></main>;
}

function DeveloperPreviewHeader() {
  return <aside className="development-preview-note" role="note"><strong>Development preview</strong><span>This shortcut is unavailable in production.</span></aside>;
}
