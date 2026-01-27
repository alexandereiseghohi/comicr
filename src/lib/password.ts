import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, KEY_LEN);
  return `${salt}:${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, keyHex] = stored.split(":");
    if (!salt || !keyHex) return false;
    const derived = scryptSync(password, salt, KEY_LEN);
    const keyBuf = Buffer.from(keyHex, "hex");
    return timingSafeEqual(derived, keyBuf);
  } catch {
    return false;
  }
}
