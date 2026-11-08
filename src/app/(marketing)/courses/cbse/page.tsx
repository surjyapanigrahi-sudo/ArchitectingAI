import Link from "next/link";
import { cbseClasses } from "@/content/cbse";
export const metadata = { title: "CBSE Board Revision | Architecting AI" };
export default function CbseCoursesPage() {
  return <div className="academy-inner-page course-catalogue cbse-page">
    <header className="inner-hero"><p className="academy-kicker">CBSE board revision</p><h1>Revise by class and subject.</h1><p>Short lessons in Hindi and English with a knowledge check after every idea. Class 12 Physics is live. The rest are coming soon.</p></header>
    <div className="cbse-classes">{cbseClasses.map(cls => <section className="cbse-class" id={cls.id} key={cls.id} aria-labelledby={`${cls.id}-title`}>
      <h2 id={`${cls.id}-title`}>{cls.label}</h2>
      <ul>{cls.subjects.map(subject => <li key={subject.name}>
        {subject.status === "live" && subject.href ? <Link href={subject.href}>{subject.name}</Link> : <span>{subject.name}</span>}
        <span className={`academy-status status-${subject.status === "live" ? "available" : "coming-soon"}`}>{subject.status === "live" ? "Live" : "Soon"}</span>
        {subject.chapters && <ol className="cbse-chapters" aria-label={`${cls.label} ${subject.name} chapters`}>{subject.chapters.map(ch => <li key={ch.number}>
          {ch.status === "live" && ch.href ? <Link href={ch.href}>{ch.number}. {ch.title}</Link> : <span>{ch.number}. {ch.title}</span>}
          <span className={`academy-status status-${ch.status === "live" ? "available" : "coming-soon"}`}>{ch.status === "live" ? "Live" : "Soon"}</span>
        </li>)}</ol>}
      </li>)}</ul>
      <p className="cbse-sooner">Want this sooner? <Link href="/contact">Tell us</Link></p>
    </section>)}</div>
  </div>;
}
