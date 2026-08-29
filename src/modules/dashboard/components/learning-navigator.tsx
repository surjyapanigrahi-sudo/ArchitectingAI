"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArchitectingAiIcon } from "@/components/icons";
import type { DashboardData, LearningStatus } from "../types";

const labels: Record<LearningStatus, string> = { "not-started": "Not Started", "in-progress": "In Progress", completed: "Completed" };
const icons: Record<LearningStatus, string> = { "not-started": "○", "in-progress": "◐", completed: "✓" };

export function LearningNavigator({ data, dashboardLinks = false }: { data: DashboardData; dashboardLinks?: boolean }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
    focusable?.[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); return; }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [open]);

  const close = () => setOpen(false);
  return <>
    <button ref={triggerRef} className="learning-navigator-trigger" type="button" aria-label="Open My Learning navigator" aria-expanded={open} aria-controls="learning-navigator-panel" onClick={() => setOpen(true)}>
      <ArchitectingAiIcon name="learning-progress" size={18} /> My Learning <span aria-hidden="true">☰</span>
    </button>
    {open && <div className="learning-navigator-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <aside ref={panelRef} id="learning-navigator-panel" className="learning-navigator-panel" role="dialog" aria-modal="true" aria-labelledby="learning-navigator-title">
        <header><div><p className="eyebrow">My Learning</p><h2 id="learning-navigator-title">Part 1 progress</h2></div><button className="navigator-close" type="button" aria-label="Close My Learning navigator" onClick={() => { close(); triggerRef.current?.focus(); }}>×</button></header>
        <div className="navigator-overall"><strong>{data.overallPercent}%</strong><span>{data.completedCount} of {data.experienceCount} experiences</span><div className="dashboard-progress" role="progressbar" aria-label="Overall learning progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={data.overallPercent}><span style={{ width: `${data.overallPercent}%` }} /></div></div>
        <section aria-labelledby="navigator-part-title"><h3 id="navigator-part-title">Part 1</h3><ol className="navigator-lessons">{data.lessons.map((lesson) => <li key={lesson.id}><Link href={dashboardLinks ? `/dashboard?lesson=${lesson.number}` : lesson.href} onClick={close}><span className={`status-icon is-${lesson.status}`} aria-hidden="true">{icons[lesson.status]}</span><span><strong>Lesson {lesson.number}</strong><small>{lesson.title}</small><em>{labels[lesson.status]} · {lesson.percent}%</em></span><b>{lesson.status === "completed" ? "Review" : lesson.status === "in-progress" ? "Continue" : "Start"} →</b></Link></li>)}</ol></section>
        <nav className="navigator-milestones" aria-label="Learning milestones"><Link href={dashboardLinks ? "/dashboard?activity=assessment" : data.assessment.href} onClick={close}><strong>Assessment</strong><span>{data.assessment.status}{data.assessment.score !== null ? ` · ${data.assessment.score}%` : ""}</span></Link>{data.certificate.earned ? <Link href={dashboardLinks ? "/dashboard?activity=certificate" : data.certificate.href} onClick={close}><strong>Certificate</strong><span>Earned · {data.certificate.score}%</span></Link> : <div><strong>Certificate</strong><span>Not Earned</span></div>}</nav>
        <nav className="navigator-links" aria-label="Learning links"><Link href="/dashboard" onClick={close}>Dashboard</Link><Link href="/workshops/enterprise-ai-foundations" onClick={close}>Learning Journey</Link><span title="Profile area is not available yet">Profile · Coming soon</span></nav>
      </aside>
    </div>}
  </>;
}
