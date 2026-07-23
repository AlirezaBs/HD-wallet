import { describe, expect, it } from "vitest";
import { validateWalletPassword } from "./password-validation";

describe("validateWalletPassword", () => {
  it("rejects mismatched passwords", () => {
    expect(validateWalletPassword("password1", "password2")).toBe(
      "Passwords do not match",
    );
  });

  it("rejects short passwords", () => {
    expect(validateWalletPassword("short", "short")).toBe(
      "Password must be at least 8 characters",
    );
  });

  it("accepts valid passwords", () => {
    expect(validateWalletPassword("long-enough", "long-enough")).toBeNull();
  });
});
