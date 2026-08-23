import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { LoginForm } from "@/modules/auth/components/login-form";
import { getDevelopmentAuthContext } from "@/modules/auth/development-auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ assessment?: string }> }) { const developmentAuth = getDevelopmentAuthContext(); const returnToAssessment = (await searchParams).assessment === "part-1"; return <AuthFrame variant="login" developmentBypassEnabled={developmentAuth.bypassEnabled}><LoginForm returnToAssessment={returnToAssessment} /></AuthFrame>; }
