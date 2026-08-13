export const authProviders = ["email-otp", "google", "linkedin"] as const;

export type AuthProvider = (typeof authProviders)[number];
