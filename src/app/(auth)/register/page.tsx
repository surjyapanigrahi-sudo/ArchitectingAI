export const metadata={title:"Create Account | Architecting AI"};
import Link from "next/link";
import { registrationEnabled } from "@/modules/auth/activation";
export const dynamic="force-dynamic";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { RegistrationForm } from "@/modules/auth/components/registration-form";
import { getDevelopmentAuthContext } from "@/modules/auth/development-auth";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ assessment?: string }> }) { if(!registrationEnabled())return <AuthFrame variant="login"><div className="auth-form-wrap"><h2>Demonstration registration is currently unavailable</h2><p>Explore the public lessons while adult demonstration accounts are unavailable. This platform demonstrates LMS features and AI educational videos; it is not a commercial school enrolment service.</p><Link href="/courses">Explore public courses</Link></div></AuthFrame>; const developmentAuth = getDevelopmentAuthContext(); const returnToAssessment = (await searchParams).assessment === "part-1"; return <AuthFrame variant="register" developmentBypassEnabled={developmentAuth.bypassEnabled}><RegistrationForm returnToAssessment={returnToAssessment} /></AuthFrame>; }
