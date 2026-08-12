export interface ProviderConfiguration {
  auth: string | null;
  database: string | null;
  ai: string | null;
}

export const providerConfig: ProviderConfiguration = {
  auth: process.env.AUTH_PROVIDER || null,
  database: process.env.DATABASE_PROVIDER || null,
  ai: process.env.AI_PROVIDER || null,
};
