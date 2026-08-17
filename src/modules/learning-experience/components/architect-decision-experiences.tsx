"use client";

import type { ArchitectGuidedExplorationExperienceDefinition, ArchitectureDecisionChallengeExperienceDefinition } from "../types";

function ProductionHeader({ experience }: { experience: { eyebrow?: string; title: string; summary?: string } }) {
  return <header className="experience-heading"><p className="eyebrow">{experience.eyebrow}</p><h1 tabIndex={-1}>{experience.title}</h1>{experience.summary && <p>{experience.summary}</p>}</header>;
}

export function ArchitectGuidedExplorationExperience({ experience, exploredIds, onExploredChange }: { experience: ArchitectGuidedExplorationExperienceDefinition; exploredIds: string[]; onExploredChange: (ids: string[]) => void }) {
  const activeId = exploredIds.at(-1) ?? null;
  const activeArea = experience.areas.find((area) => area.id === activeId);
  const explore = (id: string) => onExploredChange([...exploredIds.filter((item) => item !== id), id]);

  return <article className="experience-surface production-experience architect-experience"><ProductionHeader experience={experience} />
    <section className="architect-proposal" aria-labelledby={`${experience.id}-scenario`}><p className="eyebrow">Proposed solution</p><blockquote id={`${experience.id}-scenario`}>{experience.scenario}</blockquote></section>
    <h2 className="architect-prompt">{experience.prompt}</h2>
    <div className="architect-exploration-layout">
      <div className="architect-area-grid" aria-label="Architecture question areas">{experience.areas.map((area, index) => { const explored = exploredIds.includes(area.id); const active = area.id === activeId; return <button key={area.id} type="button" className={active ? "is-active" : explored ? "is-explored" : ""} aria-pressed={active} onClick={() => explore(area.id)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{area.title}</strong><small>{explored ? "Explored · Select to revisit" : "Select to explore"}</small></button>; })}</div>
      <section className="architect-area-detail" aria-live="polite" aria-atomic="true">{activeArea ? <><p className="eyebrow">{activeArea.title}</p><h3>{activeArea.prompt}</h3><ul>{activeArea.questions.map((question) => <li key={question}>{question}</li>)}</ul></> : <><p className="eyebrow">Guided exploration</p><h3>Select any question area to begin.</h3><p>There is no score and no required order.</p></>}</section>
    </div>
    <p className="exploration-progress" role="status">Explored {exploredIds.length} of {experience.areas.length} question areas.</p>
    <blockquote className="architect-closing">{experience.closingStatement}</blockquote>
  </article>;
}

export function ArchitectureDecisionChallengeExperience({ experience, selectedOptionId, selectedConcerns, submitted, onOptionChange, onConcernsChange, onSubmit }: { experience: ArchitectureDecisionChallengeExperienceDefinition; selectedOptionId?: string; selectedConcerns: string[]; submitted: boolean; onOptionChange: (id: string) => void; onConcernsChange: (ids: string[]) => void; onSubmit: () => void }) {
  const selectedOption = experience.options.find((option) => option.id === selectedOptionId);
  const toggleConcern = (id: string) => onConcernsChange(selectedConcerns.includes(id) ? selectedConcerns.filter((item) => item !== id) : [...selectedConcerns, id]);

  return <article className="experience-surface production-experience architect-experience decision-challenge"><ProductionHeader experience={experience} />
    <div className="decision-scenario-grid"><section><p className="eyebrow">Scenario</p><p>{experience.scenario[0]}</p><ul>{experience.scenario.slice(1).map((item) => <li key={item}>{item}</li>)}</ul></section><section><p className="eyebrow">Requirements</p><ul>{experience.requirements.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
    <form className="architecture-direction-form"><fieldset><legend>{experience.prompt}</legend><div className="architecture-direction-options">{experience.options.map((option, index) => <label className={option.id === selectedOptionId ? "is-selected" : ""} key={option.id}><input type="radio" name={`${experience.id}-direction`} value={option.id} checked={option.id === selectedOptionId} onChange={() => onOptionChange(option.id)} /><span><small>Option {String.fromCharCode(65 + index)}</small><strong>{option.label}</strong></span></label>)}</div></fieldset></form>
    {selectedOption && <section className="direction-feedback" role="status" aria-live="polite"><p className="eyebrow">Trade-off feedback</p>{selectedOption.id === experience.preferredOptionId && <strong>Preferred starting direction</strong>}<p>{selectedOption.feedback}</p></section>}
    {selectedOption && <section className="phase-two-decision" aria-labelledby={`${experience.id}-phase-two-title`}><p className="eyebrow">Phase 2 · New requirement</p><blockquote>{experience.phaseTwoRequirement}</blockquote><h2 id={`${experience.id}-phase-two-title`}>{experience.phaseTwoPrompt}</h2><form onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><fieldset disabled={submitted}><legend>{experience.phaseTwoInstruction}</legend><p>This is not a scored checklist. Select the concerns that matter to your review.</p><div className="phase-two-options">{experience.phaseTwoConcerns.map((concern) => <label className={selectedConcerns.includes(concern.id) ? "is-selected" : ""} key={concern.id}><input type="checkbox" checked={selectedConcerns.includes(concern.id)} onChange={() => toggleConcern(concern.id)} /><span>{concern.label}</span></label>)}</div></fieldset>{!submitted && <button className="primary-button" type="submit" disabled={!selectedConcerns.length}>Review architecture impact</button>}</form></section>}
    {submitted && <><section className="phase-two-explanation" role="status" aria-live="polite"><p className="eyebrow">Architecture impact</p>{experience.phaseTwoExplanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section><section className="lesson-development-end" aria-labelledby="lesson-development-title"><p className="eyebrow">Transition to lab</p><h2 id="lesson-development-title">{experience.transition[0]}</h2><p>{experience.transition[1]}</p></section></>}
  </article>;
}
