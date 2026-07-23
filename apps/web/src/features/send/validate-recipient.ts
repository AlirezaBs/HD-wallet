import { isAddress } from "viem";
import { PublicKey } from "@solana/web3.js";

export function validateRecipientAddress(
  chainFamily: "evm" | "solana",
  address: string,
): string | null {
  if (chainFamily === "evm") {
    return isAddress(address) ? null : "Invalid EVM address";
  }

  try {
    new PublicKey(address);
    return null;
  } catch {
    return "Invalid Solana address";
  }
}
