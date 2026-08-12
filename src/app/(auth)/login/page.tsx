import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { LoginForm } from "@/modules/auth/components/login-form";
import { getDevelopmentAuthContext } from "@/modules/auth/development-auth";

export default function LoginPage() { const developmentAuth = getDevelopmentAuthContext(); return <AuthFrame variant="login" developmentBypassEnabled={developmentAuth.bypassEnabled}><LoginForm /></AuthFrame>; }
