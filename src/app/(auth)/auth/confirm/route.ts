import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertUserProfile } from "@/modules/auth/profile";

const supportedTypes = new Set<EmailOtpType>(["signup", "invite", "magiclink", "recovery", "email_change", "email"]);

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const hasTokenHashFlow = Boolean(tokenHash && type && supportedTypes.has(type));
  if (!code && !hasTokenHashFlow) return confirmationError();

  try {
    const supabase = await createClient();
    const { data, error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: type! });

    if (error || !data.user) return confirmationError();
    if (await upsertUserProfile(supabase, data.user)) return confirmationError("Your email was confirmed, but your learner profile could not be prepared. Please sign in and try again.");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch { return confirmationError(); }
}

function confirmationError(message = "This confirmation link is invalid or has expired. Request a new email or return to sign in.") {
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Confirmation error</title></head><body style="font-family:system-ui;margin:0;display:grid;min-height:100vh;place-items:center;background:#f8fafc;color:#0f172a"><main style="max-width:36rem;padding:2rem;text-align:center"><h1>We could not confirm your account</h1><p>${message}</p><a href="/login">Return to Sign In</a></main></body></html>`;
  return new NextResponse(body, { status: 400, headers: { "content-type": "text/html; charset=utf-8" } });
}
