import Link from "next/link";

interface AuthFrameProps { variant: "register" | "login"; children: React.ReactNode; developmentBypassEnabled?: boolean; }

export function AuthFrame({ variant, children, developmentBypassEnabled = false }: AuthFrameProps) {
  const isRegister = variant === "register";
  return <main className="auth-page"><section className="auth-value-panel" aria-labelledby="auth-value-title"><Link className="auth-brand" href="/" aria-label="Architecting AI home"><span className="brand-mark" aria-hidden="true">A</span><span>Architecting AI</span></Link><div className="auth-value-content"><p className="eyebrow">Enterprise AI Learning Studio</p><h1 id="auth-value-title">{isRegister ? "Continue your Architecting AI journey." : "Welcome back."}</h1><p>{isRegister ? "Create a free account to save your learning progress and continue beyond Mission Zero." : "Continue your workshops, assignments and architecture learning journey."}</p>{isRegister && <><ul className="auth-benefits"><li>Save workshop progress</li><li>Complete quizzes and assignments</li><li>Submit architecture designs</li><li>Receive future AI-assisted reviews</li><li>Earn platform completion certificates</li></ul><p className="auth-note">No payment required to create an account.</p></>}</div></section><section className="auth-form-panel">{children}{developmentBypassEnabled && <Link className="dev-workspace-link" href="/workshops/enterprise-ai-foundations/demo-learning-experience">Open Learning Workspace (Development)</Link>}</section></main>;
}
