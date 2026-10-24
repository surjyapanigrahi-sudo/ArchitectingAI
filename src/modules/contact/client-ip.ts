import { isIP } from "node:net";
import { getContext } from "@netlify/functions";

// Netlify's request Context is platform metadata, not a caller-supplied header.
// https://docs.netlify.com/build/functions/api/#getcontext
export function getContactClientIp(
  production = process.env.NODE_ENV === "production",
  readContext: () => { ip?: string } = getContext,
): string | null {
  try {
    const ip = readContext().ip;
    if (ip && isIP(ip)) return ip;
  } catch { /* Outside a Netlify request: fail closed in production. */ }
  return production ? null : "local-development";
}
