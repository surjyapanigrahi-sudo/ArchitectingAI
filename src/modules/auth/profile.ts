import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function upsertUserProfile(supabase: SupabaseClient, user: User) {
  const name = typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name.trim() : "";
  const { error } = await supabase.from("profiles").upsert({ id: user.id, full_name: name || null }, { onConflict: "id" });
  return error;
}
