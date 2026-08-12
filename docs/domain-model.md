# Domain model

Core contracts live in `src/types/domain.ts` and have no React or storage dependency. They describe users and profiles; platform learning hierarchy; activities and resources; quizzes and assignments; architecture scenarios and reviews; progress, certificates, and notes.

Identifiers are opaque strings and timestamps are ISO strings at this boundary. Future PostgreSQL repositories will map records to these contracts. Provider-specific types must stay in adapter modules rather than leaking into the domain.

The workshop model intentionally uses missions and experiences, not the previous lesson structure.
