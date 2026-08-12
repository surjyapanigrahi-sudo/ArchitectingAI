import type { FieldErrors, LoginValues, RegistrationValues } from "../types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegistration(values: RegistrationValues): FieldErrors<RegistrationValues> {
  const errors: FieldErrors<RegistrationValues> = {};
  if (values.fullName.trim().length < 2) errors.fullName = "Enter your full name.";
  if (!emailPattern.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (values.password.length < 8) errors.password = "Password must contain at least 8 characters.";
  if (values.confirmPassword !== values.password) errors.confirmPassword = "Passwords do not match.";
  if (!values.acceptedTerms) errors.acceptedTerms = "Accept the Terms and Privacy Policy to continue.";
  return errors;
}

export function validateLogin(values: LoginValues): FieldErrors<LoginValues> {
  const errors: FieldErrors<LoginValues> = {};
  if (!emailPattern.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (!values.password) errors.password = "Enter your password.";
  return errors;
}
