import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { RegistrationForm } from "@/modules/auth/components/registration-form";
import { getDevelopmentAuthContext } from "@/modules/auth/development-auth";

export default function RegisterPage() { const developmentAuth = getDevelopmentAuthContext(); return <AuthFrame variant="register" developmentBypassEnabled={developmentAuth.bypassEnabled}><RegistrationForm /></AuthFrame>; }
