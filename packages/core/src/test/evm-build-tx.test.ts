import { describe, expect, it } from "vitest";
import {
  formatEvmErc20TxPreview,
  formatEvmTxPreview,
} from "../chains/evm/build-tx.js";

describe("formatEvmTxPreview", () => {
  it("formats native transfer fields", () => {
    const preview = formatEvmTxPreview({
      chainId: 11155111,
      to: "0x0000000000000000000000000000000000000001",
      value: 1_000_000_000_000_000_000n,
      gas: 21000n,
      gasPrice: 1n,
      nonce: 0,
      type: "legacy",
    });

    expect(preview.to).toBe("0x0000000000000000000000000000000000000001");
    expect(preview.value).toBe("1");
    expect(preview.gas).toBe("21000");
    expect(preview.chainId).toBe(11155111);
  });
});

describe("formatEvmErc20TxPreview", () => {
  it("includes token symbol in value label", () => {
    const preview = formatEvmErc20TxPreview(
      {
        to: "0x0000000000000000000000000000000000000002",
        amount: "10",
        symbol: "USDC",
      },
      {
        chainId: 1,
        to: "0x00000000000000000000000000000000000000aa",
        value: 0n,
        gas: 65000n,
        gasPrice: 1n,
        nonce: 1,
        type: "legacy",
      },
    );

    expect(preview.token).toBe("USDC");
    expect(preview.value).toBe("10 USDC");
    expect(preview.gas).toBe("65000");
  });
});
