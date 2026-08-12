import "server-only";

export interface DevelopmentLearner {
  id: "dev-user";
  name: "Development Learner";
  email: "dev@localhost";
}

export type DevelopmentAuthContext =
  | { bypassEnabled: true; user: DevelopmentLearner }
  | { bypassEnabled: false; user: null };

export function getDevelopmentAuthContext(): DevelopmentAuthContext {
  if (process.env.NODE_ENV === "production") return { bypassEnabled: false, user: null };
  if (process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS !== "true") return { bypassEnabled: false, user: null };
  return { bypassEnabled: true, user: { id: "dev-user", name: "Development Learner", email: "dev@localhost" } };
}
