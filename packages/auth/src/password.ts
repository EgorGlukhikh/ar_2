import { compare, hash } from "bcryptjs";

export function hashPassword(value: string) {
  return hash(value, 10);
}

export function verifyPassword(value: string, passwordHash: string) {
  return compare(value, passwordHash);
}
