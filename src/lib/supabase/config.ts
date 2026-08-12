const missingEnvironmentMessage = "Supabase authentication is not configured for this environment.";

export function getSupabaseEnvironment() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error(missingEnvironmentMessage);
  return { url, publishableKey };
}

export function getPublicSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export function getSafeAuthError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;
  if (error.message === missingEnvironmentMessage) return error.message;
  const message = error.message.toLowerCase();
  const code = "code" in error && typeof error.code === "string" ? error.code.toLowerCase() : "";
  const status = "status" in error && typeof error.status === "number" ? error.status : undefined;

  if (status === 429 || code.includes("rate_limit") || message.includes("rate limit")) {
    return "Too many confirmation emails were requested. Please wait a few minutes before trying again.";
  }
  if (message.includes("invalid login credentials")) return "The email or password is incorrect.";
  if (code === "user_already_exists" || message.includes("already registered") || message.includes("already been registered")) return "An account with this email already exists.";
  if (code === "weak_password" || message.includes("password")) return "The password does not meet the account security requirements.";
  if (code === "email_address_invalid" || message.includes("invalid email") || message.includes("email address is invalid")) return "Enter a valid email address.";
  if (code === "signup_disabled") return "New account registration is temporarily unavailable.";
  return fallback;
}
