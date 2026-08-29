"use client";

import Link from "next/link";
import { useState } from "react";
import { ArchitectingAiLogo } from "@/components/brand/architecting-ai-logo";
import { ArchitectingAiIcon } from "@/components/icons";
import { LearnerProfileMenu } from "@/modules/auth/components/learner-profile-menu";
import type { DashboardData, LearningStatus } from "../types";
import { LearningNavigator } from "./learning-navigator";

const statusIcon: Record<LearningStatus, string> = { "not-started": "○", "in-progress": "◐", completed: "✓" };
const statusLabel: Record<LearningStatus, string> = { "not-started": "Not Started", "in-progress": "In Progress", completed: "Completed" };

export function LearnerWorkspaceShell({ data, children }: { data: DashboardData; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return <div className={`learner-workspace-shell ${collapsed ? "is-navigator-collapsed" : ""}`}>
    <header className="learner-top-bar"><Link href="/dashboard" aria-label="Architecting AI dashboard"><ArchitectingAiLogo priority /></Link><span>Part 1 · {data.overallPercent}% Complete</span><div className="learner-top-actions"><div className="mobile-learning-trigger"><LearningNavigator data={data} dashboardLinks /></div><LearnerProfileMenu learnerName={data.learnerName} /></div></header>
    <aside id="my-learning" className="desktop-learning-sidebar" aria-label="My Learning"><header><span className="eyebrow">My Learning</span><button type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand Learning Navigator" : "Collapse Learning Navigator"} aria-expanded={!collapsed}><span aria-hidden="true">{collapsed ? "›" : "‹"}</span></button></header>
      <div className="sidebar-progress"><ArchitectingAiIcon name="learning-progress" size={20} /><span><strong>{data.overallPercent}%</strong><small>Overall progress</small></span></div>
      <ol>{data.lessons.map((lesson) => <li key={lesson.id}><Link href={`/dashboard?lesson=${lesson.number}`} title={`Lesson ${lesson.number}: ${lesson.title} — ${statusLabel[lesson.status]}, ${lesson.percent}%`}><span className={`status-icon is-${lesson.status}`} aria-hidden="true">{statusIcon[lesson.status]}</span><span className="sidebar-link-copy"><strong>Lesson {lesson.number}</strong><small>{lesson.title}</small><em>{statusLabel[lesson.status]} · {lesson.percent}%</em></span></Link></li>)}</ol>
      <nav aria-label="Learning milestones"><Link href="/dashboard?activity=assessment"><ArchitectingAiIcon name="assessment" size={18} /><span className="sidebar-link-copy"><strong>Assessment</strong><small>{data.assessment.status}{data.assessment.score !== null ? ` · ${data.assessment.score}%` : ""}</small></span></Link>{data.certificate.earned ? <Link href="/dashboard?activity=certificate"><ArchitectingAiIcon name="certificate" size={18} /><span className="sidebar-link-copy"><strong>Certificate</strong><small>Earned · {data.certificate.score}%</small></span></Link> : <span className="sidebar-static"><ArchitectingAiIcon name="certificate" size={18} /><span className="sidebar-link-copy"><strong>Certificate</strong><small>Not Earned</small></span></span>}<span className="sidebar-static sidebar-secondary"><span aria-hidden="true">↗</span><span className="sidebar-link-copy">Resources · In lessons</span></span><span className="sidebar-static sidebar-secondary"><span aria-hidden="true">○</span><span className="sidebar-link-copy">Profile · Coming soon</span></span></nav>
    </aside>
    <main className="learner-central-content">{children}</main>
  </div>;
}
