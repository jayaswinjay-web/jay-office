const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Validate an email address format */
export function validateEmail(email: string): boolean {
  return EMAIL_RE.test(email)
}
