import { notFound } from "next/navigation";
import { ArchitectingAiIconShowcase } from "@/components/icons/icon-showcase";

export default function IconShowcasePage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ArchitectingAiIconShowcase />;
}
