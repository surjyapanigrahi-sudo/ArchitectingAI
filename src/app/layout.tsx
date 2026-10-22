import type { Metadata } from "next";
import "@/styles/globals.css";
import { siteConfig } from "@/config/site";
import { GlobalLearningNavigator } from "@/modules/dashboard/components/global-learning-navigator";

export const metadata: Metadata = { title: `${siteConfig.name} | AI Learning for Students and Professionals`, description: "Explore school-level AI learning and professional enterprise AI architecture through sample video lessons, activities and hands-on labs." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<GlobalLearningNavigator /></body></html>;
}
