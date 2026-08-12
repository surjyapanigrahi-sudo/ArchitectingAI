# Content architecture

Authored content is a source dependency of modules, not component source code. Future loaders will normalize Markdown/MDX and structured JSON into typed definitions before UI rendering.

Planned support includes narrative content, rich activities, resources and metadata, quizzes, assignments, and diagram definitions. A CMS adapter may later read and write the same canonical definitions. Validation, versioning, localization, publication state, and asset handling will be designed when authoring requirements are approved.

React components receive validated view data. They must not query a CMS directly or contain canonical learning copy.
