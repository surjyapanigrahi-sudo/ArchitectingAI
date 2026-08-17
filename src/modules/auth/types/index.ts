export interface RegistrationValues { fullName: string; email: string; password: string; confirmPassword: string; acceptedTerms: boolean; }
export interface LoginValues { email: string; password: string; }
export type FieldErrors<T> = Partial<Record<keyof T, string>>;
