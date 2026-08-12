export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="shell-main" data-shell="auth">{children}</main>;
}
