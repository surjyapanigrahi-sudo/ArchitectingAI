import { ArchitectingAiIcon, architectingAiSymbolNames } from "./architecting-ai-icon";

export function ArchitectingAiIconShowcase() {
  return <main className="icon-showcase"><header><p>Design system development preview</p><h1>Architecting AI Symbols</h1><p>All symbols inherit their color and use the shared 24px viewBox and 1.75px stroke.</p></header><ul>{architectingAiSymbolNames.map((name) => <li key={name}><ArchitectingAiIcon name={name} size={32} label={`${name} symbol`} /><code>{name}</code></li>)}</ul></main>;
}
