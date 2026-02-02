import { hashPassword as hash, verifyPassword as verify } from "@/lib/password";

export function hashPassword(password: string): string {
  return hash(password);
}

export function verifyPassword(password: string, hash: string): boolean {
  return verify(password, hash);
}
