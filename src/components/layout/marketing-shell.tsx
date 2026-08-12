import Link from "next/link";

export function MarketingShell({ children }: { children: React.ReactNode }) { return <div className="shell"><header className="shell-header"><Link className="brand" href="/" aria-label="Architecting AI home"><span className="brand-mark" aria-hidden="true">A</span><span>Architecting AI</span></Link></header><main className="shell-main">{children}</main></div>; }
