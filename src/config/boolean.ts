// Only an explicit true enables a feature. Missing and other values fail closed.
export function parseBoolean(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}
