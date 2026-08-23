import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface VerificationRecord { learner_name: string; program: string; part_title: string; certificate_reference: string; score_percent: number; issued_at: string; status: string; }

export default async function VerifyCertificatePage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  const reference = (await searchParams).reference?.trim().toUpperCase() ?? "";
  let result: VerificationRecord | null = null;
  if (/^AAI-P1-\d{4}-[A-F0-9]{12}$/.test(reference)) {
    const { data } = await (await createClient()).rpc("verify_certificate", { p_reference: reference });
    result = (Array.isArray(data) ? data[0] : data) as VerificationRecord | null;
  }
  const searched = Boolean(reference);
  return <main className="assessment-page"><section className="assessment-card verification-card"><p className="eyebrow">Architecting AI</p><h1>Certificate Verification</h1><form method="get"><label htmlFor="certificate-reference">Certificate ID</label><input id="certificate-reference" name="reference" type="text" defaultValue={reference} placeholder="AAI-P1-2026-XXXXXXXXXXXX" autoComplete="off" required /><button className="primary-button" type="submit">Verify Certificate</button></form>{result ? <section className="verification-result is-valid" aria-live="polite"><p className="eyebrow">Valid Certificate</p><dl><div><dt>Learner Name</dt><dd>{result.learner_name}</dd></div><div><dt>Program</dt><dd>{result.program}</dd></div><div><dt>Course</dt><dd>{result.part_title}</dd></div><div><dt>Certificate ID</dt><dd>{result.certificate_reference}</dd></div><div><dt>Assessment Score</dt><dd>{result.score_percent}%</dd></div><div><dt>Issued</dt><dd>{new Date(result.issued_at).toLocaleDateString()}</dd></div><div><dt>Status</dt><dd>Valid</dd></div></dl></section> : searched && <section className="verification-result is-unverified" aria-live="polite"><h2>Certificate Not Verified</h2><p>We could not verify an active Architecting AI certificate with this reference.</p></section>}<Link className="secondary-button button-link" href="/">Back to Architecting AI</Link></section></main>;
}
