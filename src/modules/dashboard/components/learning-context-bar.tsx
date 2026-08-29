import Link from "next/link";
import { ArchitectingAiLogo } from "@/components/brand/architecting-ai-logo";
import type { DashboardData } from "../types";
import { LearningNavigator } from "./learning-navigator";

export function LearningContextBar({ data }: { data: DashboardData }) {
  return <header className="learning-context-bar"><Link className="brand" href="/dashboard" aria-label="Architecting AI dashboard"><ArchitectingAiLogo /></Link><span>Part 1 · {data.overallPercent}%</span><div><LearningNavigator data={data} /></div></header>;
}
