import Link from "next/link";
import { ArchitectingAiIcon } from "@/components/icons";
import type { DashboardData, LearningStatus } from "../types";
import { LearnerWorkspaceShell } from "./learner-workspace-shell";

const statusLabel: Record<LearningStatus, string> = { "not-started": "Not Started", "in-progress": "In Progress", completed: "Completed" };
const statusIcon: Record<LearningStatus, string> = { "not-started": "○", "in-progress": "◐", completed: "✓" };

export function LearnerDashboardOverview({ data }: { data: DashboardData }) {
  const resumeLessonId = data.resume.kind === "lesson" ? data.resume.lessonId : null;
  const resumeLesson = resumeLessonId ? data.lessons.find((lesson) => lesson.id === resumeLessonId) : null;
  const resumeHref = resumeLesson ? `/dashboard?lesson=${resumeLesson.number}` : data.certificate.earned ? "/dashboard?activity=certificate" : "/dashboard?activity=assessment";
  const resumeDetail = resumeLesson ? data.continueAction.detail : data.certificate.earned ? "Part 1 complete · Certificate earned" : "Part 1 Assessment";
  const assessmentAction = data.assessment.status === "Not Attempted" ? "Start Assessment" : data.assessment.status === "Not Passed" ? "Retake Assessment" : "View Assessment";

  return <LearnerWorkspaceShell data={data}>
    <div className="learner-dashboard-overview">
      <header className="learner-dashboard-heading"><div><p className="eyebrow">Enterprise AI Foundations</p><h1>Dashboard</h1><p>Part 1</p></div><p>Welcome back, <strong>{data.learnerName}</strong></p></header>

      <section className="dashboard-resume-card" aria-labelledby="continue-learning-title">
        <div><p className="eyebrow">Continue Learning</p><h2 id="continue-learning-title">{resumeDetail}</h2><p>{data.completedCount} of {data.experienceCount} experiences completed</p></div>
        <Link className="primary-button button-link" href={resumeHref}>{resumeLesson ? "Continue" : data.certificate.earned ? "View Certificate" : "Continue"} →</Link>
      </section>

      <section className="dashboard-overall-card" aria-labelledby="overall-progress-title">
        <div><p className="eyebrow">Course progress</p><h2 id="overall-progress-title">Overall Progress</h2></div><strong>{data.overallPercent}%</strong>
        <div className="dashboard-progress" role="progressbar" aria-label="Overall learning progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={data.overallPercent}><span style={{ width: `${data.overallPercent}%` }} /></div>
        <p>{data.completedCount} of {data.experienceCount} experiences completed</p>
      </section>

      <section className="dashboard-lessons" aria-labelledby="dashboard-lessons-title">
        <header><div><p className="eyebrow">Part 1</p><h2 id="dashboard-lessons-title">Lessons</h2></div><span>{data.completedCount}/{data.experienceCount} complete</span></header>
        <ol>{data.lessons.map((lesson) => <li key={lesson.id}>
          <span className={`status-icon is-${lesson.status}`} aria-hidden="true">{statusIcon[lesson.status]}</span>
          <div><strong>Lesson {lesson.number}</strong><span>{lesson.title}</span><small>{statusLabel[lesson.status]} · {lesson.completedCount}/{lesson.experienceCount} experiences</small></div>
          <div className="lesson-row-progress"><strong>{lesson.percent}%</strong><div className="dashboard-progress" aria-hidden="true"><span style={{ width: `${lesson.percent}%` }} /></div></div>
          <Link href={`/dashboard?lesson=${lesson.number}`}>{lesson.status === "completed" ? "Review" : lesson.status === "in-progress" ? "Continue" : "Start"} →</Link>
        </li>)}</ol>
      </section>

      <div className="dashboard-milestone-grid">
        <section className="dashboard-compact-milestone" aria-labelledby="assessment-status-title"><ArchitectingAiIcon name="assessment" size={24} /><div><p className="eyebrow">Assessment</p><h2 id="assessment-status-title">{data.assessment.status}</h2>{data.assessment.score !== null && <p>Best Score: {data.assessment.score}%</p>}</div><Link href="/dashboard?activity=assessment">{assessmentAction} →</Link></section>
        <section className="dashboard-compact-milestone" aria-labelledby="certificate-status-title"><ArchitectingAiIcon name="certificate" size={24} /><div><p className="eyebrow">Certificate</p><h2 id="certificate-status-title">{data.certificate.earned ? "Earned" : "Locked"}</h2>{!data.certificate.earned && <p>Pass the Part 1 assessment to unlock.</p>}</div>{data.certificate.earned && <Link href="/dashboard?activity=certificate">View Certificate →</Link>}</section>
      </div>
    </div>
  </LearnerWorkspaceShell>;
}
