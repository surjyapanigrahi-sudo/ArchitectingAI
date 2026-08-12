"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FieldErrors, RegistrationValues } from "../types";
import { validateRegistration } from "../validation/auth-validation";
import { PasswordField } from "./password-field";

const initialValues: RegistrationValues = { fullName: "", email: "", password: "", confirmPassword: "", acceptedTerms: false };

export function RegistrationForm() {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors<RegistrationValues>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const update = <K extends keyof RegistrationValues>(key: K, value: RegistrationValues[K]) => setValues((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const nextErrors = validateRegistration(values); setErrors(nextErrors); if (Object.keys(nextErrors).length) return; setIsSubmitting(true); await new Promise((resolve) => setTimeout(resolve, 650)); router.push("/dashboard"); };

  return <div className="auth-form-wrap"><div className="auth-form-heading"><p className="eyebrow">Create your account</p><h2>Create your free account</h2><p>Continue learning with a personal workspace.</p></div>{Object.keys(errors).length > 0 && <div className="error-summary" role="alert" tabIndex={-1}><strong>Review the highlighted fields.</strong><span>Complete the required information to continue.</span></div>}<form noValidate onSubmit={submit}><TextField id="fullName" label="Full Name" value={values.fullName} autocomplete="name" error={errors.fullName} onChange={(value) => update("fullName", value)} /><TextField id="email" label="Email Address" value={values.email} autocomplete="email" inputMode="email" error={errors.email} onChange={(value) => update("email", value)} /><PasswordField id="password" label="Password" value={values.password} visible={showPassword} autocomplete="new-password" helper="Use at least 8 characters." error={errors.password} onChange={(value) => update("password", value)} onToggle={() => setShowPassword((shown) => !shown)} /><PasswordField id="confirmPassword" label="Confirm Password" value={values.confirmPassword} visible={showConfirmation} autocomplete="new-password" error={errors.confirmPassword} onChange={(value) => update("confirmPassword", value)} onToggle={() => setShowConfirmation((shown) => !shown)} /><div className="checkbox-field"><input id="acceptedTerms" type="checkbox" checked={values.acceptedTerms} aria-invalid={Boolean(errors.acceptedTerms)} aria-describedby={errors.acceptedTerms ? "acceptedTerms-error" : undefined} onChange={(event) => update("acceptedTerms", event.target.checked)} /><div><label htmlFor="acceptedTerms">I agree to the Terms and Privacy Policy.</label>{errors.acceptedTerms && <p className="field-error" id="acceptedTerms-error">{errors.acceptedTerms}</p>}</div></div><button className="primary-button auth-submit" type="submit" disabled={isSubmitting} aria-live="polite">{isSubmitting ? "Preparing your dashboard…" : "Create Free Account"}</button></form><div className="auth-switch"><span>Already registered?</span> <Link href="/login">Sign In</Link></div><Link className="auth-home-link" href="/">Back to Home</Link></div>;
}

function TextField({ id, label, value, autocomplete, inputMode, error, onChange }: { id: string; label: string; value: string; autocomplete: string; inputMode?: "email"; error?: string; onChange: (value: string) => void }) {
  return <div className="form-field"><label htmlFor={id}>{label}</label><input id={id} name={id} type={inputMode === "email" ? "email" : "text"} value={value} autoComplete={autocomplete} inputMode={inputMode} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onChange={(event) => onChange(event.target.value)} />{error && <p className="field-error" id={`${id}-error`}>{error}</p>}</div>;
}
