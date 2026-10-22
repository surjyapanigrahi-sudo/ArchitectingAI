import { connection } from "next/server";
import { accountCollectionEnabled } from "./activation";
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getDevelopmentAuthContext } from "./development-auth";

export async function getCurrentUser() {
  await connection();
  const developmentAuth = getDevelopmentAuthContext();
  if (developmentAuth.bypassEnabled) {
    return developmentAuth.user;
  }
  if(!accountCollectionEnabled())return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    return error ? null : data.user;
  } catch { return null; }
}
