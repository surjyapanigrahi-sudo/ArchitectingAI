"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useEnquiryDraft } from "./enquiry-draft";
import { enquiryTypes, getEnquiryFieldErrors, type EnquiryErrors, type EnquiryField } from "@/modules/contact/validation";

export function EnquiryForm({ enabled = false }: { enabled?: boolean }) {
  const { draft, updateDraft, clearDraft } = useEnquiryDraft();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Partial<Record<EnquiryField, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<EnquiryErrors>({});
  const request = useRef<{ id: string; payload: string } | null>(null);
  const values = { full_name: draft.fullName, email: draft.email, phone: draft.phone, enquiry_type: draft.enquiryType, message: draft.message, consent: draft.consent, website: "" };
  const fieldErrors = getEnquiryFieldErrors(values);
  const valid = Object.keys(fieldErrors).length === 0;
  function fieldError(field: EnquiryField) {
    const message = touched[field] ? fieldErrors[field] || serverErrors[field] : undefined;
    return message ? <p className="field-error" id={`enquiry-${field}-error`}>{message}</p> : null;
  }
  function fieldProps(field: EnquiryField) {
    const invalid = Boolean(touched[field] && (fieldErrors[field] || serverErrors[field]));
    return { "aria-invalid": invalid, "aria-describedby": invalid ? `enquiry-${field}-error` : undefined, onBlur: () => setTouched(current => ({ ...current, [field]: true })) };
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || status === "sending") return;
    setTouched({ full_name: true, email: true, phone: true, enquiry_type: true, message: true, consent: true });
    if (!valid || !event.currentTarget.reportValidity()) return;
    const form = event.currentTarget;
    const payload = JSON.stringify({ ...values, website: new FormData(form).get("website") });
    if (!request.current || request.current.payload !== payload) request.current = { id: crypto.randomUUID(), payload };
    setStatus("sending"); setError(""); setServerErrors({});
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": request.current.id }, body: payload });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        if (response.status === 400 && result.fields) setServerErrors(result.fields);
        throw new Error(response.status === 429 ? "Too many enquiries. Please try again later." : response.status === 400 ? "Review the highlighted fields and privacy acknowledgement." : response.status === 403 ? "This page cannot submit enquiries from the current address. Please contact us by email." : response.status === 503 ? "Online enquiries are temporarily unavailable. Your draft is still here; please retry later or contact us by email." : "We could not save your enquiry. Your draft is still here; please retry.");
      }
      setStatus("success"); form.reset(); clearDraft(); setTouched({}); request.current = null;
    } catch (failure) {
      setStatus("error"); setError(failure instanceof Error ? failure.message : "We could not save your enquiry. Your draft is still here; please retry.");
    }
  }
  return <section className="enquiry-panel"><h2>Share your enquiry</h2>
    {!enabled && <p role="status">Online enquiries are currently disabled. You cannot submit this form yet. Please email us using the address below.</p>}
    <p>This is an LMS and AI educational-video demonstration. Adult business enquiries and demonstration feedback are welcome; no commercial school enrolment is offered.</p>
    <p><a href="mailto:surjya.panigrahi@gmail.com">Email us about your enquiry</a></p>
    <form method="POST" action="/api/contact" onSubmit={submit} onChange={() => { setServerErrors({}); if (status !== "sending") { setStatus("idle"); setError(""); } }}>
      <p hidden><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label></p>
      <div className="form-field"><label htmlFor="enquiry-name">Full Name (required)</label><input {...fieldProps("full_name")} id="enquiry-name" name="full-name" value={draft.fullName} onChange={event => updateDraft({ fullName: event.target.value })} autoComplete="name" minLength={2} maxLength={120} required />{fieldError("full_name")}</div>
      <div className="form-field"><label htmlFor="enquiry-email">Email Address (required)</label><input {...fieldProps("email")} id="enquiry-email" name="email" value={draft.email} onChange={event => updateDraft({ email: event.target.value })} type="email" autoComplete="email" maxLength={254} required />{fieldError("email")}</div>
      <div className="form-field"><label htmlFor="enquiry-phone">Phone Number (optional)</label><input {...fieldProps("phone")} id="enquiry-phone" name="phone" value={draft.phone} onChange={event => updateDraft({ phone: event.target.value })} type="tel" autoComplete="tel" maxLength={40} />{fieldError("phone")}</div>
      <div className="form-field"><label htmlFor="enquiry-type">Enquiry Type</label><select {...fieldProps("enquiry_type")} id="enquiry-type" name="enquiry-type" value={draft.enquiryType} onChange={event => updateDraft({ enquiryType: event.target.value })} required>{enquiryTypes.map(type => <option key={type}>{type}</option>)}</select>{fieldError("enquiry_type")}</div>
      <div className="form-field"><label htmlFor="enquiry-message">Message (required)</label><textarea {...fieldProps("message")} id="enquiry-message" name="message" value={draft.message} onChange={event => updateDraft({ message: event.target.value })} rows={6} minLength={10} maxLength={5000} required />{fieldError("message")}</div>
      <p>When enabled, your details are stored in Supabase to respond to your enquiry. Saving an enquiry does not confirm email delivery. Please avoid sensitive information and children&apos;s personal details. <Link href="/privacy?from=contact" target="_blank" rel="noopener noreferrer">Read the Privacy Policy<span className="sr-only"> (opens in a new tab)</span></Link> (opens in a new tab; return to this tab to submit).</p>
      <label><input {...fieldProps("consent")} name="consent" type="checkbox" checked={draft.consent} onChange={event => updateDraft({ consent: event.target.checked })} required /> I have read the enquiry privacy notice and agree to submit these details for a response and follow-up.</label>{fieldError("consent")}
      <p id="enquiry-submit-help">Complete the required fields and explicitly check the privacy acknowledgement to submit. Reading the policy does not check it for you.</p>
      <button aria-describedby="enquiry-submit-help" className="academy-button primary" disabled={!enabled || !valid || status === "sending"} type="submit">{status === "sending" ? "Saving enquiry..." : "Submit Enquiry"}</button>
      {status === "success" && <p role="status">Your enquiry has been saved. Thank you for getting in touch.</p>}
      {status === "error" && <p role="alert">{error}</p>}
    </form>
  </section>;
}