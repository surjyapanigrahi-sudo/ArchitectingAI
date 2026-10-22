import { MarketingHeader, MarketingFooter } from "./marketing-chrome";
export function MarketingShell({children}:{children:React.ReactNode}){return <div className="shell marketing-shell"><MarketingHeader secondary/><main className="shell-main">{children}</main><div className="secondary-footer"><MarketingFooter/></div></div>}
