"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { DashboardData } from "../types";
import { LearningNavigator } from "./learning-navigator";

const lessonPath = /^\/workshops\/enterprise-ai-foundations\/(why-enterprise-ai-architecture|understanding-enterprise-ai-architecture|architecting-your-first-enterprise-ai-workload)$/;

export function GlobalLearningNavigator() {
  const pathname = usePathname();
  const [data, setData] = useState<DashboardData | null>(null);
  const visible = lessonPath.test(pathname);
  useEffect(() => {
    if (!visible) return;
    const controller = new AbortController();
    const refresh = () => { void fetch("/api/learner-dashboard", { signal: controller.signal }).then((response) => response.ok ? response.json() as Promise<DashboardData> : null).then((result) => { if (result) setData(result); }).catch(() => undefined); };
    refresh();
    window.addEventListener("architecting-ai:progress-updated", refresh);
    return () => { controller.abort(); window.removeEventListener("architecting-ai:progress-updated", refresh); };
  }, [visible]);
  return visible && data ? <div className="global-learning-control"><LearningNavigator data={data} /></div> : null;
}
