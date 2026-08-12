# Mission Zero model

Mission Zero is configured in `src/modules/missions/mission-zero.ts` as a public, unauthenticated, approximately three-minute experience with seven ready stages. Its transient client state tracks the current stage, both learner decisions, and the selected architecture domain.

The public route is `/experience/mission-zero`. Learning copy is separated from the visual components, and personalized Architect Insight feedback is derived from the learner's two recorded decisions. Progress is intentionally not persisted. A future learning-engine adapter can interpret stage definitions without coupling the domain model to React.
