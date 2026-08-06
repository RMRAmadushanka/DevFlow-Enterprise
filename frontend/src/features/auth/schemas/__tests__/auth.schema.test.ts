import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema, resetPasswordSchema } from "../auth.schema";

describe("auth schemas", () => {
  it("rejects invalid login email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "x",
    });
    expect(result.success).toBe(false);
  });

  it("requires matching passwords on register", () => {
    const result = registerSchema.safeParse({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      password: "Password123!",
      confirmPassword: "Password123?",
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it("requires terms acceptance", () => {
    const result = registerSchema.safeParse({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
      acceptTerms: false,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a strong reset password pair", () => {
    const result = resetPasswordSchema.safeParse({
      password: "Password123!",
      confirmPassword: "Password123!",
    });
    expect(result.success).toBe(true);
  });
});
