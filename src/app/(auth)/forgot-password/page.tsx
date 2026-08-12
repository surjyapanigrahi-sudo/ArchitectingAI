import Link from "next/link";
import { AuthFrame } from "@/modules/auth/components/auth-frame";

export default function ForgotPasswordPage() { return <AuthFrame variant="login"><div className="auth-form-wrap auth-info-state"><p className="eyebrow">Password recovery</p><h2>Recovery is not enabled yet.</h2><p>Password recovery will be available when account authentication is enabled.</p><Link className="primary-button button-link" href="/login">Return to Sign In</Link><Link className="auth-home-link" href="/">Back to Home</Link></div></AuthFrame>; }
