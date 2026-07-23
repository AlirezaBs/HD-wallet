import { describe, expect, it } from "vitest";
import { validateSendAmount } from "@/features/send/build-send-transaction";

describe("validateSendAmount", () => {
  it("rejects zero amount", () => {
    expect(validateSendAmount("0", "10")).toBe("Enter a valid amount");
  });

  it("rejects over-balance amount", () => {
    expect(validateSendAmount("11", "10")).toBe(
      "Amount exceeds available balance",
    );
  });

  it("accepts valid amount", () => {
    expect(validateSendAmount("5", "10")).toBeNull();
  });
});
