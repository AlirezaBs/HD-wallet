import type { ChainFamily, NetworkMode } from "./types.js";

export type TokenDefinition = {
  id: string;
  name: string;
  symbol: string;
  coingeckoId?: string;
  iconUrl: string;
  isNative: boolean;
  decimals?: number;
  evmContract?: string;
  solanaMint?: string;
};

const ETH_ICON =
  "https://assets.coingecko.com/coins/images/279/small/ethereum.png";
const SOL_ICON =
  "https://assets.coingecko.com/coins/images/4128/small/solana.png";
const USDC_ICON =
  "https://assets.coingecko.com/coins/images/6319/small/usdc.png";
const USDT_ICON =
  "https://assets.coingecko.com/coins/images/325/small/Tether.png";
const RAY_ICON =
  "https://assets.coingecko.com/coins/images/13928/small/PSigc4ie_400x400.jpg";

export const NETWORK_TOKENS: Record<
  ChainFamily,
  Record<NetworkMode, TokenDefinition[]>
> = {
  evm: {
    mainnet: [
      {
        id: "native",
        name: "Ethereum",
        symbol: "ETH",
        coingeckoId: "ethereum",
        iconUrl: ETH_ICON,
        isNative: true,
      },
      {
        id: "usdc",
        name: "USD Coin",
        symbol: "USDC",
        coingeckoId: "usd-coin",
        iconUrl: USDC_ICON,
        isNative: false,
        decimals: 6,
        evmContract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      },
      {
        id: "usdt",
        name: "Tether",
        symbol: "USDT",
        coingeckoId: "tether",
        iconUrl: USDT_ICON,
        isNative: false,
        decimals: 6,
        evmContract: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      },
    ],
    testnet: [
      {
        id: "native",
        name: "Sepolia ETH",
        symbol: "ETH",
        iconUrl: ETH_ICON,
        isNative: true,
      },
      {
        id: "usdc",
        name: "USD Coin",
        symbol: "USDC",
        iconUrl: USDC_ICON,
        isNative: false,
        decimals: 6,
        evmContract: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      },
    ],
  },
  solana: {
    mainnet: [
      {
        id: "native",
        name: "Solana",
        symbol: "SOL",
        coingeckoId: "solana",
        iconUrl: SOL_ICON,
        isNative: true,
      },
      {
        id: "usdc",
        name: "USD Coin",
        symbol: "USDC",
        coingeckoId: "usd-coin",
        iconUrl: USDC_ICON,
        isNative: false,
        decimals: 6,
        solanaMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      },
      {
        id: "usdt",
        name: "Tether",
        symbol: "USDT",
        coingeckoId: "tether",
        iconUrl: USDT_ICON,
        isNative: false,
        decimals: 6,
        solanaMint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      },
      {
        id: "ray",
        name: "Raydium",
        symbol: "RAY",
        coingeckoId: "raydium",
        iconUrl: RAY_ICON,
        isNative: false,
        decimals: 6,
        solanaMint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
      },
    ],
    testnet: [
      {
        id: "native",
        name: "Solana",
        symbol: "SOL",
        iconUrl: SOL_ICON,
        isNative: true,
      },
      {
        id: "usdc",
        name: "USD Coin",
        symbol: "USDC",
        iconUrl: USDC_ICON,
        isNative: false,
        decimals: 6,
        solanaMint: "4zMMC9srt5Ri5X14GPhXUKgMcU2PxuA6F59kE7MT9YB",
      },
    ],
  },
};

export function getNetworkTokens(
  chainFamily: ChainFamily,
  networkMode: NetworkMode,
): TokenDefinition[] {
  return NETWORK_TOKENS[chainFamily]?.[networkMode] ?? [];
}
