"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  return <button className="secondary-button" type="button" disabled={busy} onClick={async () => { setBusy(true); try { await createClient().auth.signOut(); } finally { window.location.assign("/"); } }}>{busy ? "Signing out…" : "Sign Out"}</button>;
}
