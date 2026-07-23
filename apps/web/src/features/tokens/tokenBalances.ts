import {
  getEvmBalance,
  getErc20Balance,
  getNetworkTokens,
  getSolanaBalance,
  getSplTokenBalance,
  type ChainFamily,
  type NetworkMode,
  type TokenDefinition,
} from "@hd-wallet/core";
import { isAbortError, throwIfAborted } from "@/lib/abort";
import { tokenBalanceKey } from "@/lib/network";
import type {
  TokenBalanceErrorMap,
  TokenBalanceMap,
  WalletTokenEntry,
} from "./types";

export async function fetchTokenBalance(
  token: TokenDefinition,
  chainFamily: ChainFamily,
  networkMode: NetworkMode,
  address: string,
  signal?: AbortSignal,
): Promise<string> {
  throwIfAborted(signal);

  if (token.isNative) {
    return chainFamily === "evm"
      ? await getEvmBalance(address, networkMode, signal)
      : await getSolanaBalance(address, networkMode, signal);
  }

  if (chainFamily === "evm" && token.evmContract) {
    return await getErc20Balance(
      address,
      token.evmContract,
      networkMode,
      token.decimals,
      signal,
    );
  }

  if (chainFamily === "solana" && token.solanaMint) {
    return await getSplTokenBalance(
      address,
      token.solanaMint,
      networkMode,
      signal,
    );
  }

  return "0";
}

export function buildWalletTokenEntries(
  evmAddress: string | undefined,
  solanaAddress: string | undefined,
  evmMode: NetworkMode,
  solanaMode: NetworkMode,
): WalletTokenEntry[] {
  const entries: WalletTokenEntry[] = [];

  if (evmAddress) {
    for (const token of getNetworkTokens("evm", evmMode)) {
      entries.push({
        chainFamily: "evm",
        networkMode: evmMode,
        token,
        address: evmAddress,
        balanceKey: tokenBalanceKey("evm", token.id),
      });
    }
  }

  if (solanaAddress) {
    for (const token of getNetworkTokens("solana", solanaMode)) {
      entries.push({
        chainFamily: "solana",
        networkMode: solanaMode,
        token,
        address: solanaAddress,
        balanceKey: tokenBalanceKey("solana", token.id),
      });
    }
  }

  return entries;
}

export type PortfolioBalanceResult = {
  balances: TokenBalanceMap;
  errors: TokenBalanceErrorMap;
};

export async function fetchPortfolioBalances(
  entries: WalletTokenEntry[],
  signal: AbortSignal,
): Promise<PortfolioBalanceResult> {
  throwIfAborted(signal);

  const results = await Promise.allSettled(
    entries.map(async (entry) => {
      const balance = await fetchTokenBalance(
        entry.token,
        entry.chainFamily,
        entry.networkMode,
        entry.address,
        signal,
      );
      return { balanceKey: entry.balanceKey, balance };
    }),
  );

  throwIfAborted(signal);

  for (const result of results) {
    if (result.status === "rejected" && isAbortError(result.reason)) {
      throw result.reason;
    }
  }

  const balances: TokenBalanceMap = {};
  const errors: TokenBalanceErrorMap = {};

  for (const result of results) {
    if (result.status === "fulfilled") {
      balances[result.value.balanceKey] = result.value.balance;
      continue;
    }
    if (isAbortError(result.reason)) throw result.reason;
  }

  for (let index = 0; index < results.length; index++) {
    const result = results[index];
    const entry = entries[index];
    if (!entry || !result) continue;
    if (result.status === "rejected" && !isAbortError(result.reason)) {
      errors[entry.balanceKey] = true;
      balances[entry.balanceKey] = "0";
    }
  }

  return { balances, errors };
}
