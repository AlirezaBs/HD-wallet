import { describe, expect, it } from "vitest";
import { validateRecipientAddress } from "@/features/send/validate-recipient";

describe("validateRecipientAddress", () => {
  it("accepts valid EVM addresses", () => {
    expect(
      validateRecipientAddress(
        "evm",
        "0x0000000000000000000000000000000000000001",
      ),
    ).toBeNull();
  });

  it("rejects invalid EVM addresses", () => {
    expect(validateRecipientAddress("evm", "not-an-address")).toBe(
      "Invalid EVM address",
    );
  });

  it("accepts valid Solana addresses", () => {
    expect(
      validateRecipientAddress("solana", "11111111111111111111111111111111"),
    ).toBeNull();
  });

  it("rejects invalid Solana addresses", () => {
    expect(validateRecipientAddress("solana", "bad")).toBe(
      "Invalid Solana address",
    );
  });
});
