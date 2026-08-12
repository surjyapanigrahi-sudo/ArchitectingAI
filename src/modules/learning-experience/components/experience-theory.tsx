"use client";

import { useId, useState } from "react";
import type { ExperienceTheory, TheoryContentBlock } from "../types";

export function ExperienceTheorySupport({ theory }: { theory?: ExperienceTheory }) {
  const [expanded, setExpanded] = useState(false); const regionId = useId();
  if (!theory) return null;
  return <section className="experience-theory" aria-labelledby={`${regionId}-essential`}><div className="essential-concept"><p className="eyebrow">Essential Concept</p><h2 id={`${regionId}-essential`}>What to understand</h2>{theory.essentialConcept.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>{theory.goDeeper && <div className="go-deeper"><button type="button" aria-expanded={expanded} aria-controls={regionId} onClick={() => setExpanded((current) => !current)}><span><strong>Go Deeper</strong>{theory.goDeeper.readingMinutes && <small>Approximately {theory.goDeeper.readingMinutes} min read</small>}</span><span aria-hidden="true">{expanded ? "−" : "+"}</span></button>{expanded && <div className="go-deeper-content" id={regionId}>{theory.goDeeper.blocks.map((block, index) => <TheoryBlock block={block} key={`${block.type}-${index}`} />)}</div>}</div>}{theory.architectInsight && <aside className="theory-insight"><p className="eyebrow">Architect Insight</p><blockquote>{theory.architectInsight}</blockquote></aside>}{theory.enterpriseExample && <section className="theory-enterprise-example"><p className="eyebrow">Enterprise Example</p><h2>{theory.enterpriseExample.title}</h2><p>{theory.enterpriseExample.summary}</p>{theory.enterpriseExample.cases && <div>{theory.enterpriseExample.cases.map((item) => <article key={item.label}><h3>{item.label}</h3><ul>{item.details.map((detail) => <li key={detail}>{detail}</li>)}</ul></article>)}</div>}</section>}{theory.resourceIds?.length && <p className="theory-resources-note">Optional authoritative references are available from Resources in the lesson tool dock.</p>}</section>;
}

function TheoryBlock({ block }: { block: TheoryContentBlock }) {
  switch (block.type) {
    case "heading": return <h3>{block.text}</h3>;
    case "paragraph": return <p>{block.text}</p>;
    case "list": return <ul>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
    case "callout": return <aside className="theory-callout"><strong>{block.title}</strong><p>{block.text}</p></aside>;
    case "flow": return <figure className="theory-flow"><div>{block.nodes.map((node, index) => <span key={node}>{node}{index < block.nodes.length - 1 && <i aria-hidden="true">→</i>}</span>)}</div>{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
  }
}
