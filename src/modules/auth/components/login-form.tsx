"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSafeAuthError } from "@/lib/supabase/config";
import type { FieldErrors, LoginValues } from "../types";
import { validateLogin } from "../validation/auth-validation";
import { upsertUserProfile } from "../profile";
import { PasswordField } from "./password-field";

const initialValues: LoginValues = { email: "", password: "", rememberMe: false };

export function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors<LoginValues>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setProviderError(null);
    if (Object.keys(nextErrors).length) return;
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email: values.email.trim(), password: values.password });
      if (error) throw error;
      if (await upsertUserProfile(supabase, data.user)) { setProviderError("You are signed in, but your learner profile could not be prepared. Please try again."); return; }
      router.push("/dashboard");
      router.refresh();
    } catch (error) { setProviderError(getSafeAuthError(error, "We could not sign you in. Please try again.")); }
    finally { setIsSubmitting(false); }
  }

  return <div className="auth-form-wrap"><div className="auth-form-heading"><p className="eyebrow">Welcome back</p><h2>Sign in to Architecting AI</h2><p>Return to your enterprise AI learning journey.</p></div>{providerError && <div className="error-summary" role="alert"><strong>Sign in unsuccessful.</strong><span>{providerError}</span></div>}{Object.keys(errors).length > 0 && <div className="error-summary" role="alert"><strong>Review the highlighted fields.</strong><span>Enter your account details to continue.</span></div>}<form noValidate onSubmit={submit}><div className="form-field"><label htmlFor="loginEmail">Email Address</label><input id="loginEmail" name="email" type="email" inputMode="email" autoComplete="email" value={values.email} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "loginEmail-error" : undefined} onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))} />{errors.email && <p className="field-error" id="loginEmail-error">{errors.email}</p>}</div><PasswordField id="loginPassword" label="Password" value={values.password} visible={showPassword} autocomplete="current-password" error={errors.password} onChange={(password) => setValues((current) => ({ ...current, password }))} onToggle={() => setShowPassword((shown) => !shown)} /><div className="form-row"><label className="remember-control"><input type="checkbox" checked={values.rememberMe} onChange={(event) => setValues((current) => ({ ...current, rememberMe: event.target.checked }))} /> <span>Remember me</span></label><Link href="/forgot-password">Forgot password?</Link></div><button className="primary-button auth-submit" type="submit" disabled={isSubmitting} aria-live="polite">{isSubmitting ? "Opening your dashboard…" : "Sign In"}</button></form><div className="auth-switch"><span>New to Architecting AI?</span> <Link href="/register">Create Free Account</Link></div><Link className="auth-home-link" href="/">Back to Home</Link></div>;
}
