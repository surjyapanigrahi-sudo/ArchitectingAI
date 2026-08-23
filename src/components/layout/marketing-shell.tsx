import Link from "next/link";
import { ArchitectingAiLogo } from "@/components/brand/architecting-ai-logo";

export function MarketingShell({ children }: { children: React.ReactNode }) { return <div className="shell"><header className="shell-header"><Link className="brand" href="/" aria-label="Architecting AI home"><ArchitectingAiLogo priority /></Link></header><main className="shell-main">{children}</main></div>; }
