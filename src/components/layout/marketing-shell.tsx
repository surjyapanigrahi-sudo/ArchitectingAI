import { EnquiryDraftProvider } from "@/components/contact/enquiry-draft";
import { MarketingHeader, MarketingFooter } from "./marketing-chrome";
export function MarketingShell({children}:{children:React.ReactNode}){return <EnquiryDraftProvider><div className="shell marketing-shell"><MarketingHeader/><main className="shell-main">{children}</main><div className="secondary-footer"><MarketingFooter/></div></div></EnquiryDraftProvider>}
