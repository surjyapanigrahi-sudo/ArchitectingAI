# Development rules

1. UX is approved before final UI implementation.
2. Content is separate from UI.
3. Domain models are separate from storage providers.
4. AI providers are replaceable.
5. The authentication provider is replaceable.
6. No business logic belongs inside visual components.
7. Architecture diagrams are driven by data models where practical.
8. Avoid premature abstraction.
9. Accessibility is required.
10. Do not copy code from the existing MVP unless explicitly reviewed.

## Integration guardrails

Provider integrations implement adapters behind module-owned interfaces. Secrets remain in local or deployment environment configuration and must never enter source control. New UI work must start from approved flows and accessibility requirements. Content schemas should be introduced alongside real authoring needs, not speculative abstractions.
