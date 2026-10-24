import { MarketingHeader } from "@/components/layout/marketing-chrome";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="public-auth-shell"><MarketingHeader />{children}</div>;
}
