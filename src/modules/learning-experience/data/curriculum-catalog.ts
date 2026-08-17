export interface CurriculumLessonMetadata {
  number: number;
  title: string;
  description: string;
  experienceCount: number;
  status: "available" | "coming-soon";
  slug: string;
  href: string;
}

const workshopRoute = "/workshops/enterprise-ai-foundations";

export const publishedCurriculumLessons: CurriculumLessonMetadata[] = [
  { number: 1, title: "Why Enterprise AI Architecture?", description: "Understand why a working AI capability is not automatically an enterprise-ready AI architecture and distinguish building from architecting.", experienceCount: 3, status: "available", slug: "why-enterprise-ai-architecture", href: `${workshopRoute}/why-enterprise-ai-architecture` },
  { number: 2, title: "Understanding Enterprise AI Architecture", description: "Explore the major architecture domains, enterprise request flows, requirements, and contextual trade-offs.", experienceCount: 5, status: "available", slug: "understanding-enterprise-ai-architecture", href: `${workshopRoute}/understanding-enterprise-ai-architecture` },
  { number: 3, title: "Architecting Your First Enterprise AI Workload", description: "Apply the foundations by designing and examining a high-level HR Employee Assistant architecture.", experienceCount: 4, status: "available", slug: "architecting-your-first-enterprise-ai-workload", href: `${workshopRoute}/architecting-your-first-enterprise-ai-workload` },
];
