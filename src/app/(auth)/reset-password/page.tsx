import { getCurrentUser } from "@/modules/auth/current-user";
import Link from "next/link";
import { accountCollectionEnabled } from "@/modules/auth/activation";
export const dynamic="force-dynamic";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { PasswordRecoveryForm } from "@/modules/auth/components/password-recovery-form";
export const metadata={title:"Choose a new password | Architecting AI"};
export default async function Page(){if(!accountCollectionEnabled())return <AuthFrame variant="login"><div className="auth-form-wrap"><h2>Password recovery is currently unavailable for demonstration accounts</h2><Link href="/courses">Explore public courses</Link></div></AuthFrame>;return <AuthFrame variant="login"><PasswordRecoveryForm reset={true} sessionVerified={Boolean(await getCurrentUser())}/></AuthFrame>}
