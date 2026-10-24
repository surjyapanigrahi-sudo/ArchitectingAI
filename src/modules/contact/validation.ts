export const enquiryTypes = ["Business Partnership", "Course Enquiry", "AI Video Generation Solution", "General Enquiry"] as const;
export type Enquiry = { full_name:string; email:string; phone:string|null; enquiry_type:string; message:string; consent_version:string };
export type EnquiryField = "full_name" | "email" | "phone" | "enquiry_type" | "message" | "consent";
export type EnquiryErrors = Partial<Record<EnquiryField, string>>;
const controls = /[\u0000-\u001f\u007f]/;

// Shared by the browser and API. Browser validity never replaces server checks.
export function getEnquiryFieldErrors(value: Record<string, unknown>): EnquiryErrors {
  const errors: EnquiryErrors = {};
  const name = typeof value.full_name === "string" ? value.full_name.trim() : "";
  const email = typeof value.email === "string" ? value.email.trim() : "";
  const message = typeof value.message === "string" ? value.message.trim() : "";
  if (name.length < 2 || name.length > 120 || controls.test(name)) errors.full_name = "Enter a full name between 2 and 120 characters.";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || controls.test(email)) errors.email = "Enter a valid email address, including its domain.";
  if (value.phone !== undefined && (typeof value.phone !== "string" || value.phone.trim().length > 40 || controls.test(value.phone.trim()))) errors.phone = "Use no more than 40 characters for the optional phone number.";
  if (!enquiryTypes.includes(value.enquiry_type as typeof enquiryTypes[number])) errors.enquiry_type = "Select an available enquiry type.";
  if (message.length < 10 || message.length > 5000 || /[\u0000\u000b\u000c]/.test(message)) errors.message = "Enter a message between 10 and 5,000 characters, excluding surrounding spaces.";
  if (value.consent !== true) errors.consent = "Explicitly acknowledge the privacy notice before submitting.";
  return errors;
}

export function validateEnquiry(input: unknown): Enquiry | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = input as Record<string, unknown>;
  if (Object.keys(value).some(key => !["full_name", "email", "phone", "enquiry_type", "message", "website", "consent"].includes(key))) return null;
  if (value.website !== "" || Object.keys(getEnquiryFieldErrors(value)).length) return null;
  return {
    full_name: (value.full_name as string).trim(), email: (value.email as string).trim().toLowerCase(),
    phone: typeof value.phone === "string" ? value.phone.trim() || null : null,
    enquiry_type: value.enquiry_type as string, message: (value.message as string).trim(),
    consent_version: "contact-2026-10-review-1",
  };
}
