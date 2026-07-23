import type { SignedSolanaTransaction } from "../chains/solana/types.js";

export type PublicAccount = {
  index: number;
  name: string;
  address: string;
  path: string;
};

export type PublicWalletState = {
  evmAccounts: PublicAccount[];
  solanaAccounts: PublicAccount[];
};

export type ChainFamily = "evm" | "solana";

export type SignEvmMessageInput = {
  accountIndex: number;
  message: string | Uint8Array;
};

export type SignEvmTransactionInput = {
  accountIndex: number;
  serializedUnsignedTx: `0x${string}`;
  chainId: number;
};

export type SignSolanaMessageInput = {
  accountIndex: number;
  message: Uint8Array;
};

export type SignSolanaTransactionInput = {
  accountIndex: number;
  serializedMessage: Uint8Array;
  expectedSignerAddress: string;
};

export type CryptoWorkerApi = {
  createVault(
    password: string,
  ): Promise<{ state: PublicWalletState; mnemonic: string }>;
  importVault(password: string, mnemonic: string): Promise<PublicWalletState>;
  unlockVault(password: string): Promise<PublicWalletState>;
  lockVault(): Promise<void>;
  addAccount(chainFamily: ChainFamily): Promise<PublicWalletState>;
  renameAccount(
    accountIndex: number,
    label: string,
  ): Promise<PublicWalletState>;
  removeLastAccount(): Promise<PublicWalletState>;
  signEvmMessage(input: SignEvmMessageInput): Promise<string>;
  signEvmTransaction(input: SignEvmTransactionInput): Promise<string>;
  signSolanaMessage(input: SignSolanaMessageInput): Promise<string>;
  signSolanaTransaction(
    input: SignSolanaTransactionInput,
  ): Promise<SignedSolanaTransaction>;
  exportRecoveryPhrase(password: string): Promise<string>;
};
