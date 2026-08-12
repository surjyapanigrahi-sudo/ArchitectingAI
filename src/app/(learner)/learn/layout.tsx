import { redirect } from "next/navigation";
import { LearnerShell } from "@/components/layout/learner-shell";
import { getCurrentUser } from "@/modules/auth/current-user";

export default async function Layout({ children }: { children: React.ReactNode }) {
  if (!(await getCurrentUser())) redirect("/login");
  return <LearnerShell>{children}</LearnerShell>;
}
