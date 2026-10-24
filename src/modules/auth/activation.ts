import "server-only";
import { parseBoolean } from "../../config/boolean";
export function accountCollectionEnabled(){return parseBoolean(process.env.AUTH_ENABLED);}
export function registrationEnabled(){return accountCollectionEnabled() && parseBoolean(process.env.AUTH_REGISTRATION_ENABLED);}
// The existing assessment RPC can issue certificates. Keep it separately gated
// until its deployed scoring, permissions and certificate behavior are verified.
export function assessmentEnabled(){return accountCollectionEnabled() && parseBoolean(process.env.ASSESSMENT_ENABLED);}
