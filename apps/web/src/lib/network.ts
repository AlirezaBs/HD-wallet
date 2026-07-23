import type { ChainFamily, NetworkMode } from "@hd-wallet/core";

export function getNetworkBadge(chainFamily: ChainFamily): string {
  return chainFamily === "evm" ? "E" : "S";
}

export function getNetworkLabel(
  chainFamily: ChainFamily,
  networkMode: NetworkMode,
): string {
  return `${chainFamily === "evm" ? "EVM" : "Solana"} ${networkMode}`;
}

export function tokenBalanceKey(
  chainFamily: ChainFamily,
  tokenId: string,
): string {
  return `${chainFamily}:${tokenId}`;
}

export function tokenDetailPath(
  chainFamily: ChainFamily,
  tokenId: string,
): string {
  return `/wallet/token/${chainFamily}/${tokenId}`;
}

export function tokenQueryParams(
  chainFamily: ChainFamily,
  tokenId: string,
): { chain: string; token: string } {
  return { chain: chainFamily, token: tokenId };
}
