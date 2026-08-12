import type { Metadata } from "next";
import "@/styles/globals.css";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: `${siteConfig.name} | Enterprise AI Learning Studio`, description: "Learn to design, build and operate enterprise AI systems through structured lessons and hands-on architecture labs." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
