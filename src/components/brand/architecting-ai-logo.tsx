import Image from "next/image";

type ArchitectingAiLogoProps = { className?: string; priority?: boolean };

export function ArchitectingAiLogo({ className = "", priority = false }: ArchitectingAiLogoProps) {
  return <Image className={`architecting-ai-logo ${className}`.trim()} src="/brand/architecting-ai-logo.png" alt="Architecting AI" width={1536} height={1024} priority={priority} />;
}
