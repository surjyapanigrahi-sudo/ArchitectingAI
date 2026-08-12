export interface RegistrationValues { fullName: string; email: string; password: string; confirmPassword: string; acceptedTerms: boolean; }
export interface LoginValues { email: string; password: string; rememberMe: boolean; }
export type FieldErrors<T> = Partial<Record<keyof T, string>>;
