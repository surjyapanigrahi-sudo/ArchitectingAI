import type { ReactNode, SVGProps } from "react";

export const architectingAiSymbolNames = [
  "business-outcome", "users-experience", "application-capability", "ai-intelligence", "enterprise-data", "integration-api", "identity", "security", "governance", "observability", "operations", "cost", "reliability", "performance", "architecture", "think", "design", "decide", "trade-off", "lab", "assessment", "certificate", "learning-progress", "risk", "complete",
] as const;

export type ArchitectingAiSymbolName = (typeof architectingAiSymbolNames)[number];

export interface ArchitectingAiIconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: ArchitectingAiSymbolName;
  size?: number | string;
  label?: string;
}

const symbols: Record<ArchitectingAiSymbolName, ReactNode> = {
  "business-outcome": <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></>,
  "users-experience": <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6M14 15c1-.8 2-1.2 3.5-1 2.4.3 3.6 2.2 3.9 4.5"/></>,
  "application-capability": <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01M8 14h3v3H8zM14 13h3M14 16h3"/></>,
  "ai-intelligence": <><path d="M9 4a3 3 0 0 0-3 3v1a3.5 3.5 0 0 0-1 6.4V16a3 3 0 0 0 4 2.8M15 4a3 3 0 0 1 3 3v1a3.5 3.5 0 0 1 1 6.4V16a3 3 0 0 1-4 2.8M12 3v18M8 9h4M12 15h4"/></>,
  "enterprise-data": <><ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7"/></>,
  "integration-api": <><path d="M9 7H6a4 4 0 0 0 0 8h3M15 7h3a4 4 0 1 1 0 8h-3M8 12h8"/><path d="m14 10 2 2-2 2"/></>,
  identity: <><circle cx="12" cy="8" r="4"/><path d="M4 21c.7-5 3.3-8 8-8s7.3 3 8 8"/></>,
  security: <><path d="M12 2 20 5v6c0 5.2-3.1 8.8-8 11-4.9-2.2-8-5.8-8-11V5l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
  governance: <><path d="M4 9h16M6 9V7l6-4 6 4v2M6 19h12M4 22h16M7 9v10M12 9v10M17 9v10"/></>,
  observability: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  operations: <><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></>,
  cost: <><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5c-.8-.7-2-1-3.4-1-1.7 0-3.1.8-3.1 2s1.2 1.9 3.2 2.3c2.1.4 3.3 1.1 3.3 2.5 0 1.3-1.3 2.2-3.3 2.2-1.5 0-2.9-.4-3.8-1.2M12 5.5v13"/></>,
  reliability: <><path d="M4 13h4l2-5 4 9 2-4h4"/><path d="M12 22C6 19 3 15 3 9l9-5 9 5c0 6-3 10-9 13Z"/></>,
  performance: <><path d="M4 18a9 9 0 1 1 16 0M12 12l5-4M7 18h10"/><circle cx="12" cy="12" r="1"/></>,
  architecture: <><path d="M3 20h18M5 20V9l7-6 7 6v11M9 20v-6h6v6M8 10h8"/></>,
  think: <><path d="M9 18c-1.8-1.5-3-3.4-3-6a6 6 0 1 1 12 0c0 2.6-1.2 4.5-3 6-.8.7-1 1.2-1 2h-4c0-.8-.2-1.3-1-2ZM10 23h4M9 10h6M12 7v6"/></>,
  design: <><circle cx="12" cy="12" r="8"/><path d="m15 9-2 5-5 2 2-5 5-2ZM12 2v2M12 20v2M2 12h2M20 12h2"/></>,
  decide: <><path d="m5 12 4 4 10-10"/><path d="M20 12a8 8 0 1 1-5-7.4"/></>,
  "trade-off": <><path d="M5 7h14M15 3l4 4-4 4M19 17H5M9 13l-4 4 4 4"/></>,
  lab: <><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3M7.5 15h9"/></>,
  assessment: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3M15 16l1 1 2-2"/></>,
  certificate: <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M7 8h10M7 12h6M15 17v5l2-1 2 1v-6"/><circle cx="17" cy="14" r="2"/></>,
  "learning-progress": <><path d="M4 18V9M10 18V6M16 18v-4M22 18V3M3 21h19"/><path d="m4 12 6-3 6 4 6-6"/></>,
  risk: <><path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v5M12 17h.01"/></>,
  complete: <><circle cx="12" cy="12" r="9"/><path d="m7.5 12 3 3 6-7"/></>,
};

export function ArchitectingAiIcon({ name, size = 24, label, className, ...props }: ArchitectingAiIconProps) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false" className={className} {...props}>{symbols[name]}</svg>;
}
