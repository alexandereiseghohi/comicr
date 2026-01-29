import { describe, it, expect } from "vitest";
import { SignUpSchema } from "../../src/schemas/auth.schema";

describe("SignUpSchema", () => {
  it("accepts valid data", () => {
    const data = { email: "a@b.com", password: "password123" };
    expect(() => SignUpSchema.parse(data)).not.toThrow();
  });
  it("rejects short password", () => {
    const data = { email: "a@b.com", password: "1" };
    expect(() => SignUpSchema.parse(data)).toThrow();
  });
});
