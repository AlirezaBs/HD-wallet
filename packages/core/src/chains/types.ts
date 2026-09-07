export type NetworkMode = "mainnet" | "testnet";
export type ChainFamily = "evm" | "solana";

export type NetworkConfig = {
  name: string;
  chainId?: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeSymbol: string;
  nativeDecimals: number;
  /** External faucet for testnet funding; omit on mainnet. */
  faucetUrl?: string;
};

export const EVM_NETWORKS: Record<NetworkMode, NetworkConfig> = {
  mainnet: {
    name: "Ethereum",
    chainId: 1,
    rpcUrl: "https://ethereum-rpc.publicnode.com",
    explorerUrl: "https://etherscan.io",
    nativeSymbol: "ETH",
    nativeDecimals: 18,
  },
  testnet: {
    name: "Sepolia",
    chainId: 11155111,
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    explorerUrl: "https://sepolia.etherscan.io",
    nativeSymbol: "ETH",
    nativeDecimals: 18,
    faucetUrl: "https://www.alchemy.com/faucets/ethereum-sepolia",
  },
};

export const SOLANA_NETWORKS: Record<NetworkMode, NetworkConfig> = {
  mainnet: {
    name: "Solana Mainnet",
    rpcUrl: "https://solana-rpc.publicnode.com",
    explorerUrl: "https://explorer.solana.com",
    nativeSymbol: "SOL",
    nativeDecimals: 9,
  },
  testnet: {
    name: "Solana Devnet",
    rpcUrl: "https://api.devnet.solana.com",
    explorerUrl: "https://explorer.solana.com/?cluster=devnet",
    nativeSymbol: "SOL",
    nativeDecimals: 9,
    faucetUrl: "https://faucet.solana.com",
  },
};

export function getFaucetUrl(
  family: ChainFamily,
  mode: NetworkMode,
): string | null {
  const config = family === "evm" ? EVM_NETWORKS[mode] : SOLANA_NETWORKS[mode];
  return config.faucetUrl ?? null;
}

function getExplorerEntityUrl(
  config: NetworkConfig,
  entity: "address" | "tx",
  identifier: string,
): string {
  const url = new URL(config.explorerUrl);
  const basePath = url.pathname.endsWith("/")
    ? url.pathname.slice(0, -1)
    : url.pathname;
  url.pathname = `${basePath}/${entity}/${identifier}`;
  return url.toString();
}

export function getExplorerAddressUrl(
  family: ChainFamily,
  mode: NetworkMode,
  address: string,
): string {
  const config = family === "evm" ? EVM_NETWORKS[mode] : SOLANA_NETWORKS[mode];
  return getExplorerEntityUrl(config, "address", address);
}

export function getExplorerTxUrl(
  family: ChainFamily,
  mode: NetworkMode,
  hash: string,
): string {
  const config = family === "evm" ? EVM_NETWORKS[mode] : SOLANA_NETWORKS[mode];
  return getExplorerEntityUrl(config, "tx", hash);
}
