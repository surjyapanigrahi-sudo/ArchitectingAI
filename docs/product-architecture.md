# Product architecture

Architecting AI V2 is organized around route shells, capability modules, independent domain contracts, content sources, and replaceable infrastructure adapters.

## Boundaries

- `src/app` composes routes and shells; route groups separate marketing, authentication, learner, and admin concerns without affecting URLs.
- `src/modules` owns capability behavior and public module contracts.
- `src/types` contains storage- and UI-independent domain language.
- `src/content` will contain authored material, separate from React.
- `src/components` contains visual primitives and layout shells, never business logic.
- `src/config` contains non-secret application and provider configuration.
- `src/lib` is reserved for provider adapters and shared infrastructure.

The platform hierarchy is Platform → Program → Workshop → Mission → Experience / Activity. UX designs will later map route-level compositions to layout components and approved primitives; module APIs will supply state and behavior.

Not implemented: final navigation or UX, persistence, authentication, AI integration, CMS, analytics, production content, or migration from the MVP.
