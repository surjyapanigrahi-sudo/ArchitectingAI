import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getDevelopmentAuthContext } from "./development-auth";

export async function getCurrentUser() {
  const developmentAuth = getDevelopmentAuthContext();
  if (developmentAuth.bypassEnabled) return developmentAuth.user;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}
