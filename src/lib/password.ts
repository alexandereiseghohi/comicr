import bcrypt from "bcryptjs";

export function hashPassword(password: string): string {
  // 10 salt rounds is a common default
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    return bcrypt.compareSync(password, stored);
  } catch {
    return false;
  }
}
