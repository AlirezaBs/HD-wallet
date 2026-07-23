import type { ChainFamily, TokenDefinition } from "@hd-wallet/core";

export function canSendToken(
  token: TokenDefinition,
  chainFamily: ChainFamily,
): boolean {
  if (token.isNative) return true;
  if (chainFamily === "evm" && token.evmContract) return true;
  return false;
}
