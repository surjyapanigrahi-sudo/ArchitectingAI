import Link from "next/link";
import { accountCollectionEnabled } from "@/modules/auth/activation";
export const dynamic="force-dynamic";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { PasswordRecoveryForm } from "@/modules/auth/components/password-recovery-form";
export const metadata={title:"Password recovery | Architecting AI"};
export default function Page(){if(!accountCollectionEnabled())return <AuthFrame variant="login"><div className="auth-form-wrap"><h2>Account recovery is awaiting final verification</h2><Link href="/courses">Explore public courses</Link></div></AuthFrame>;return <AuthFrame variant="login"><PasswordRecoveryForm reset={false}/></AuthFrame>}
