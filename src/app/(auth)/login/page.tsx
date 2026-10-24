export const metadata={title:"Sign In | Architecting AI"};
import Link from "next/link";
import { accountCollectionEnabled, registrationEnabled } from "@/modules/auth/activation";
export const dynamic="force-dynamic";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { LoginForm } from "@/modules/auth/components/login-form";
import { getDevelopmentAuthContext } from "@/modules/auth/development-auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ assessment?: string }> }) { if(!accountCollectionEnabled())return <AuthFrame variant="login"><div className="auth-form-wrap"><h2>Demonstration sign-in is currently unavailable</h2><p>Explore the public lessons while adult demonstration accounts are unavailable. This platform demonstrates LMS features and AI educational videos; it is not a commercial school enrolment service.</p><Link href="/courses">Explore public courses</Link></div></AuthFrame>; const developmentAuth = getDevelopmentAuthContext(); const returnToAssessment = (await searchParams).assessment === "part-1"; return <AuthFrame variant="login" developmentBypassEnabled={developmentAuth.bypassEnabled}><LoginForm returnToAssessment={returnToAssessment} registrationEnabled={registrationEnabled()} /></AuthFrame>; }
