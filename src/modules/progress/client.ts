import { createClient } from "@/lib/supabase/client";

let writeQueue: Promise<void> = Promise.resolve();

export function recordExperienceProgress(lessonId: string, experienceId: string, completed = false) {
  const write = async () => {
    const { error } = await createClient().rpc("record_part1_experience_progress", {
      p_lesson_id: lessonId,
      p_experience_id: experienceId,
      p_completed: completed,
    });
    if (error) throw error;
    window.dispatchEvent(new Event("architecting-ai:progress-updated"));
  };
  writeQueue = writeQueue.catch(() => undefined).then(write);
  return writeQueue;
}
