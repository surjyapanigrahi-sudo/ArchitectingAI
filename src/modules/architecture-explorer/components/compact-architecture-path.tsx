import { enterpriseAiArchitecture } from "../enterprise-ai-example";

const pathNodeIds = ["outcome", "users", "applications", "ai", "enterprise-data", "integration"];

export function CompactArchitecturePath({ compact = false }: { compact?: boolean }) {
  const nodes = pathNodeIds.map((id) => enterpriseAiArchitecture.nodes.find((node) => node.id === id)).filter((node) => node !== undefined);
  return <figure className={`compact-path ${compact ? "is-compact" : ""}`} aria-label="Architecture path from business outcome through integration">
    <div className="compact-path-flow">{nodes.map((node, index) => <div className="compact-path-step" key={node.id}><span>{node.label}</span>{index < nodes.length - 1 && <i aria-hidden="true">→</i>}</div>)}</div>
    <div className="compact-cross-cutting"><span><strong>Cross-cutting</strong> Identity / Security / Governance</span><span><strong>Foundation</strong> Observability / Operations / Cost</span></div>
  </figure>;
}
