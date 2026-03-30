// ⚠️ SOLO estos emails pueden acceder al panel de control
export const ALLOWED_EMAILS: string[] = [
  "davidwwe421@gmail.com",
];

export function isAuthorized(email: string | undefined | null): boolean {
  if (!email) return false;
  return ALLOWED_EMAILS.includes(email.toLowerCase());
}
