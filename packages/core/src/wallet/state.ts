import type { VaultPayload } from "../vault/types.js";
import type { PublicWalletState } from "./types.js";
import { deriveEvmAccount } from "./derive-evm.js";
import { deriveSolanaAccount } from "./derive-solana.js";
import { resolveAccountLabel } from "./account-labels.js";

export function buildPublicWalletState(
  mnemonic: string,
  payload: VaultPayload,
): PublicWalletState {
  const evmAccounts = Array.from(
    { length: payload.evmAccountCount },
    (_, i) => {
      const { address, path } = deriveEvmAccount(mnemonic, i);
      return {
        index: i,
        name: resolveAccountLabel(payload.accountLabels, i),
        address,
        path,
      };
    },
  );

  const solanaAccounts = Array.from(
    { length: payload.solanaAccountCount },
    (_, i) => {
      const { address, path } = deriveSolanaAccount(mnemonic, i);
      return {
        index: i,
        name: resolveAccountLabel(payload.accountLabels, i),
        address,
        path,
      };
    },
  );

  return { evmAccounts, solanaAccounts };
}

export function createInitialPayload(mnemonic: string): VaultPayload {
  return {
    mnemonic,
    evmAccountCount: 1,
    solanaAccountCount: 1,
    accountLabels: [],
  };
}
