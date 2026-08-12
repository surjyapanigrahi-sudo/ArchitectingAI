import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/current-user";
import { getDevelopmentAuthContext } from "@/modules/auth/development-auth";
import { LogoutButton } from "@/modules/auth/components/logout-button";

export default async function DashboardPlaceholder() {
  const developmentAuth = getDevelopmentAuthContext();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <main className="dashboard-placeholder">{developmentAuth.bypassEnabled && <div className="development-banner dashboard-dev-banner" role="status">Development mode — authentication bypass enabled</div>}<div><p className="eyebrow">Architecting AI</p><h1>Your learner dashboard is being designed.</h1><p>Your authenticated learner workspace is ready for the next product increment.</p><div className="completion-actions"><Link className="primary-button button-link" href="/">Back to Home</Link>{!developmentAuth.bypassEnabled && <LogoutButton />}</div></div></main>;
}
