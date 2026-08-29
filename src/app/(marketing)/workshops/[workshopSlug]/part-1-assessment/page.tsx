import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/current-user";
import { PartOneAssessment } from "@/modules/assessment/part-1-assessment";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/modules/dashboard/dashboard-data";
import { LearningContextBar } from "@/modules/dashboard/components/learning-context-bar";

export default async function PartOneAssessmentPage({ params, searchParams }: { params: Promise<{ workshopSlug: string }>; searchParams: Promise<{ view?: string }> }) {
  const { workshopSlug } = await params;
  if (workshopSlug !== "enterprise-ai-foundations") notFound();
  const user = await getCurrentUser();
  if (!user) return <main className="assessment-page"><section className="assessment-card assessment-access"><p className="eyebrow">Part 1 Assessment</p><h1>Assessment access</h1><p>Free registration is required to take the assessment and earn your certificate.</p><div className="result-actions"><Link className="primary-button button-link" href="/login?assessment=part-1">Sign In</Link><Link className="secondary-button button-link" href="/register?assessment=part-1">Create Free Account</Link><Link className="secondary-button button-link" href="/workshops/enterprise-ai-foundations">Back to Learning Journey</Link></div></section></main>;
  const learnerName = "name" in user ? user.name : typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name.trim() || null : null;
  const persistenceEnabled = user.id !== "dev-user";
  let initialCertificate = null;
  let initialResult = null;
  if (persistenceEnabled) {
    const supabase = await createClient();
    const [{ data: certificate }, { data: attempt }] = await Promise.all([
      supabase.from("certificates").select("certificate_reference,score_percent,issued_at").eq("user_id", user.id).eq("part_id", "part-1").eq("status", "valid").maybeSingle(),
      supabase.from("assessment_attempts").select("score_percent,correct_count,passed,submitted_at").eq("user_id", user.id).eq("part_id", "part-1").eq("status", "submitted").order("submitted_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (certificate) initialCertificate = { certificateReference: certificate.certificate_reference as string, scorePercent: certificate.score_percent as number, issuedAt: certificate.issued_at as string };
    if (attempt?.submitted_at && attempt.score_percent !== null && attempt.correct_count !== null && attempt.passed !== null) initialResult = { scorePercent: attempt.score_percent as number, correctCount: attempt.correct_count as number, passed: attempt.passed as boolean, submittedAt: attempt.submitted_at as string };
  }
  const dashboardData = await getDashboardData(user);
  const showCertificateInitially = (await searchParams).view === "certificate" && Boolean(initialCertificate);
  return <div className="learning-activity-page"><LearningContextBar data={dashboardData} /><PartOneAssessment learnerName={learnerName} initialCertificate={initialCertificate} initialResult={initialResult} persistenceEnabled={persistenceEnabled} showCertificateInitially={showCertificateInitially} /></div>;
}
