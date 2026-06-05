import { createHash, randomInt } from "node:crypto";

export const CODE_LENGTH = 6;
export const CODE_TTL_MS = 15 * 60 * 1000;
export const CODE_MAX_ATTEMPTS = 5;
export const CODE_RESEND_COOLDOWN_MS = 60 * 1000;

export function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(CODE_LENGTH, "0");
}

export function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function codeExpiresAt(): Date {
  return new Date(Date.now() + CODE_TTL_MS);
}

export function isExpired(date: Date | null | undefined): boolean {
  if (!date) return true;
  return date.getTime() < Date.now();
}
