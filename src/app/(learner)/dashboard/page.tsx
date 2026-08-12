import Link from "next/link";
import { getDevelopmentAuthContext } from "@/modules/auth/development-auth";

export default function DashboardPlaceholder() { const developmentAuth = getDevelopmentAuthContext(); return <main className="dashboard-placeholder">{developmentAuth.bypassEnabled && <div className="development-banner dashboard-dev-banner" role="status">Development mode — authentication bypass enabled</div>}<div><p className="eyebrow">Architecting AI</p><h1>Your learner dashboard is being designed.</h1><p>This prototype demonstrates the frontend account flow. No account or learning data has been stored.</p><Link className="primary-button button-link" href="/">Back to Home</Link></div></main>; }
