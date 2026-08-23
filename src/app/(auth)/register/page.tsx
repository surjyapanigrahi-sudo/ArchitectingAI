import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { RegistrationForm } from "@/modules/auth/components/registration-form";
import { getDevelopmentAuthContext } from "@/modules/auth/development-auth";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ assessment?: string }> }) { const developmentAuth = getDevelopmentAuthContext(); const returnToAssessment = (await searchParams).assessment === "part-1"; return <AuthFrame variant="register" developmentBypassEnabled={developmentAuth.bypassEnabled}><RegistrationForm returnToAssessment={returnToAssessment} /></AuthFrame>; }
