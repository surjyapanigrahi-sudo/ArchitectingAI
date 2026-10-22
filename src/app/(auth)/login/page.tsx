export const metadata={title:"Sign In | Architecting AI"};
import Link from "next/link";
import { accountCollectionEnabled } from "@/modules/auth/activation";
export const dynamic="force-dynamic";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { LoginForm } from "@/modules/auth/components/login-form";
import { getDevelopmentAuthContext } from "@/modules/auth/development-auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ assessment?: string }> }) { if(!accountCollectionEnabled())return <AuthFrame variant="login"><div className="auth-form-wrap"><h2>Accounts are awaiting final verification</h2><p>Public sample lessons remain available. Account collection will be enabled after privacy and service verification.</p><Link href="/courses">Explore public courses</Link></div></AuthFrame>; const developmentAuth = getDevelopmentAuthContext(); const returnToAssessment = (await searchParams).assessment === "part-1"; return <AuthFrame variant="login" developmentBypassEnabled={developmentAuth.bypassEnabled}><LoginForm returnToAssessment={returnToAssessment} /></AuthFrame>; }
