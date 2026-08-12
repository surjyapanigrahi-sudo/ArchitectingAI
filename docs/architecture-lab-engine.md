# Architecture Lab Engine

## Purpose

Architecture Lab is the reusable guided-practice experience for enterprise architecture learning. It extends the existing Learning Experience Engine with a configuration-driven `architecture-lab` type and follows the loop: Scenario → Capability Matching → Design → Review → Think → Refine → Compare → Apply. It intentionally avoids scores, pass/fail language and a single “correct architecture.”

## Domain model

`ArchitectureLabDefinition` contains scenario, requirements, starting architecture, available components, guided slots, review rules, reference architecture, final challenge and completion criteria. Components extend the existing `ArchitectureNode` vocabulary, including domain, capability and cross-cutting metadata, rather than introducing a parallel architecture-domain model.

The supporting types are `ArchitectureLabScenario`, `ArchitectureLabRequirement`, `ArchitectureLabComponent`, `ArchitectureLabSlot`, `ArchitectureLabPlacement`, `ArchitectureLabAttempt`, `ArchitectureLabReviewRule`, `ArchitectureLabFeedback`, `ArchitectureLabReferenceArchitecture`, `ArchitectureLabChallenge` and `ArchitectureLabChallengeOption`. `MatchingActivityDefinition`, `MatchingPrompt`, `MatchingItem` and `MatchingResponse` provide a reusable pre-builder concept-matching step.

## Lab flow

The lab begins with a six-concept capability matching step. Learners select a capability and then a deliberately reordered responsibility. All pairs must be completed before review, but match quality does not gate progression. The guided builder then shows the scenario and requirements, the prototype path, six conceptual positions and a compact capability toolkit. A learner selects a position and assigns a compatible capability. After the configured minimum is met, review becomes available. Feedback leads back to refinement or forward to comparison. Comparison unlocks the final challenge, whose submitted educational feedback unlocks completion.

## State model

`ArchitectureLabState` tracks matching responses, matching review state, placements, the active slot, attempt number, review history, latest feedback, whether the reference was viewed, final challenge response/submission, completion and current phase. `LessonState.architectureLabStates` stores this state by experience ID beside existing decision and knowledge-check state.

State remains transient React memory. It is deliberately absent from localStorage and databases. A future progress adapter can serialize the typed state without changing the lab component.

## Review-rule model

`reviewArchitectureLab(definition, placements)` is deterministic and contains no JSX. Configurable rule types are required capability, recommended capability, relationship consideration, cross-cutting capability, operational capability and distractor selected. The result is structured into strengths, considerations, gaps and next questions. The wording remains constructive and does not grade the learner.

## Accessibility

The v1 interaction uses semantic buttons, radio inputs and fieldsets; it does not depend on drag and drop. Slots expose pressed state, toolkit cards expose selected state, controls provide text labels, feedback uses an announced live region and touch targets are at least 48px where interactive. Existing visible focus and reduced-motion rules apply.

## Reference architecture

Reference comparison is available after at least one review and uses the same slots as the learner design. It presents “My Architecture” beside “One Possible Approach” with short decision notes. It is not a diff engine and explicitly acknowledges other valid designs.

## Future persistence and AI review

A persistence adapter may later hydrate and save `ArchitectureLabState` to an authenticated learner record. The deterministic review function should remain the baseline even if an AI-review adapter is added later. AI feedback should consume the same definition, attempt and feedback structures, be clearly identified, and never become a hidden grading mechanism.

## Evolution toward a free-form canvas

Guided slots are the v1 interaction contract. Future renderers may add relationship editing or a near-blank canvas while continuing to produce `ArchitectureLabPlacement`-compatible state. Keyboard and non-drag alternatives remain mandatory.

## Scaffolding progression

- Lesson 1 can use fully guided slots and constrained compatible components.
- Lesson 6 can introduce guided RAG-specific positions and relationship considerations.
- Lesson 9 can emphasize cross-cutting security refinement and fewer hints.
- Lesson 12 can offer broader end-to-end positions with a less constrained toolkit.
- Lesson 16 can evolve toward a near-blank capstone canvas with reference comparison deferred until after review.

Only one dummy demo lab is implemented now. No production lesson content is included.
