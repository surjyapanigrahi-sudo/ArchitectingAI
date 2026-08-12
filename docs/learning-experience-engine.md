# Learning Experience Engine

The learning foundation separates lesson definitions, transient state, experience rendering, workspace navigation, and reusable architecture visualization. It is intentionally demonstrated with placeholder content rather than production Lesson 1 material.

## Workspace architecture

`LearningWorkspace` composes a learning map and one focused experience surface. It owns transient lesson state and delegates rendering to `LearningExperienceEngine`. Experience components receive typed configuration and callbacks; route pages only locate lesson data and supply workshop context.

Desktop uses a two-column learning map and center workspace. Focus Mode removes the map and expands the workspace. At mobile widths, the map becomes a compact horizontal selector above the content. Resources, Notes and Glossary are optional dock panels rather than a permanent third column.

## Lesson data model

`LearningLesson` contains workshop identity, descriptive metadata, ordered `LearningExperienceDefinition` items and core `LearningResource` records. The definition union is discriminated by `LearningExperienceType`, allowing renderers and future validators to narrow each experience safely.

Supporting types include learning objectives, decision options, knowledge-check questions, enterprise examples and architect insights. Diagram experiences reference a `diagramId` or `architectureScenarioId`; they do not embed rendering code.

## Experience types

The model supports introduction, concept, explanation, diagram, animation, enterprise example, architect insight, decision, knowledge check, apply, reflection, architecture lab, enterprise readiness challenge, architecture comparison, progressive architecture and summary. The demo proves the foundational types and Architecture Lab. Production Lesson 1 Block 1 uses the three specialized production experience types for its opening multi-select, expandable comparison and step-through architecture story.

`architecture-lab` is a specialized configuration-driven experience for guided enterprise architecture practice. It extends the same definition union, renderer and transient lesson state rather than creating a parallel lab route or lesson system. Its model, review rules, interaction flow and future evolution are documented in `docs/architecture-lab-engine.md`.

## Navigation and state

`LessonState` tracks `currentExperienceId`, `completedExperienceIds`, `decisionResponses`, `knowledgeCheckResponses` and `architectureLabStates`. Continue marks the current experience complete and advances without a browser reload. Previous is always available after the first experience. The learning map permits navigation to the current or completed experiences and labels Completed, Current and Upcoming states.

Decision experiences require a selection before Continue is enabled. Knowledge checks require response review; educational feedback and retry remain local and do not create a score. Completing the summary updates the same state model.

Architecture labs require lab completion before lesson Continue is enabled. Placements, attempts, review history, comparison state and challenge state remain local to the lesson session and use deterministic educational feedback rather than a score.

Production interaction state remains in the same `LessonState`: multi-select responses and submission state support the readiness challenge, while progressive architecture state tracks the active scene and transient reflection. No production state is persisted.

## Reusable theory pattern

Any experience may optionally provide an `ExperienceTheory` configuration. Theory depth remains part of the existing experience definition rather than a parallel reading engine. The supported hierarchy is:

1. **Essential Concept** — concise required understanding, visible in the experience.
2. **Go Deeper** — optional inline theory with an accessible expand/collapse control and optional reading-time estimate.
3. **Architect Insight** — a concise architecture principle or significant distinction.
4. **Enterprise Example** — a reusable configuration-driven connection to a realistic enterprise situation.
5. **Learn More / Resources** — authoritative references surfaced through the existing Resources dock.

`TheoryContentBlock` supports headings, paragraphs, lists, callouts and compact flows. Experiences opt into only the sections they need. The disclosure keeps deeper material at a comfortable reading width and does not use a modal or persistent set of large panels.

Theory authoring follows this content principle:

Primary source → technical verification → vendor-neutral teaching → enterprise example → visual explanation → practical application.

Resource metadata supports publisher, resource type, short description and recommended/optional status. URLs must remain unlinked and explicitly flagged when content-owner verification is pending.

## Diagram integration

The demo diagram definition references `enterprise-ai-overview`. The diagram experience delegates visualization to the existing `EnterpriseArchitectureExplorer`, preserving its data-driven nodes, relationships, keyboard interaction and contextual domain panel.

## Future persistence

State lives in React memory and is deliberately not stored in localStorage or a database. A future learner-progress adapter can hydrate and save the same `LessonState` fields without changing the experience definitions or visual components. Authentication and provider-specific records must remain behind that adapter.

## Future CMS integration

A future CMS adapter will validate and normalize authored lesson records into `LearningLesson`. It can produce ordered experiences, questions, resources and diagram references while React continues to consume the canonical definition. CMS APIs and schemas should not leak into experience components.

## Intentionally not implemented

- Production Lesson 1 or Lesson 2 content
- Authentication or persistent learner progress
- Scores, certificates, analytics or locking rules
- AI Mentor, AI review or discussion
- Notes persistence, downloads or resource loading
- A full CMS or authoring interface
- Final learner dashboard, workshop catalog or mobile polish
