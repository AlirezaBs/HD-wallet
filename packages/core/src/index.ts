// Vault
export type {
  EncryptedVault,
  VaultPayload,
  VaultMetadata,
} from "./vault/types.js";
export { DEFAULT_KDF_PARAMS } from "./vault/types.js";
export {
  saveEncryptedVault,
  loadEncryptedVault,
  saveVaultMetadata,
  loadVaultMetadata,
  clearVault,
} from "./vault/storage.js";
export { getVaultMetadata, hasVault } from "./vault/metadata.js";
export {
  encryptVault,
  decryptVault,
  persistVault,
  unlockVaultPayload,
} from "./vault/vault-service.js";
export type { ActivityEntry } from "./vault/activity.js";
export {
  saveActivity,
  loadActivities,
  clearActivities,
  updateActivityStatus,
} from "./vault/activity.js";

// Crypto
export {
  WorkerLockedError,
  WrongPasswordError,
  VaultExistsError,
  InvalidMnemonicError,
  InvalidAccountLabelError,
  InvalidAccountIndexError,
  CannotRemoveAccountError,
  SolanaSignerNotRequiredError,
  SolanaSignerMismatchError,
  InvalidSolanaMessageError,
  InvalidSolanaSignatureError,
  SolanaConfirmationFailedError,
  SolanaBlockhashExpiredError,
} from "./crypto/errors.js";

// Wallet
export type {
  PublicWalletState,
  PublicAccount,
  ChainFamily,
  CryptoWorkerApi,
  SignEvmMessageInput,
  SignEvmTransactionInput,
  SignSolanaMessageInput,
  SignSolanaTransactionInput,
} from "./wallet/types.js";
export {
  createMnemonic,
  isValidMnemonic,
  normalizeMnemonic,
} from "./wallet/mnemonic.js";
export {
  MAX_ACCOUNT_LABEL_CODE_POINTS,
  getAvailableAccountCount,
  normalizeAccountLabel,
  resolveAccountLabel,
} from "./wallet/account-labels.js";
export { evmDerivationPath, getEvmAddress } from "./wallet/derive-evm.js";
export {
  solanaDerivationPath,
  getSolanaAddress,
} from "./wallet/derive-solana.js";

// Chains
export type { NetworkMode, NetworkConfig } from "./chains/types.js";
export {
  EVM_NETWORKS,
  SOLANA_NETWORKS,
  getFaucetUrl,
  getExplorerAddressUrl,
  getExplorerTxUrl,
} from "./chains/types.js";
export type { TokenDefinition } from "./chains/tokens.js";
export { NETWORK_TOKENS, getNetworkTokens } from "./chains/tokens.js";
export { getEvmBalance, estimateEvmGas } from "./chains/evm/balance.js";
export { getErc20Balance } from "./chains/evm/erc20-balance.js";
export {
  buildEvmTransferTx,
  buildEvmErc20TransferTx,
  formatEvmTxPreview,
  formatEvmErc20TxPreview,
} from "./chains/evm/build-tx.js";
export { broadcastEvmTransaction } from "./chains/evm/broadcast.js";
export {
  getSolanaBalance,
  getSolanaRecentBlockhash,
  estimateSolanaFee,
} from "./chains/solana/balance.js";
export { getSplTokenBalance } from "./chains/solana/spl-balance.js";
export {
  buildSolTransferTx,
  formatSolTxPreview,
} from "./chains/solana/build-tx.js";
export type {
  PreparedSolanaTransaction,
  SignedSolanaTransaction,
  SolanaConfirmationContext,
} from "./chains/solana/types.js";
export {
  submitSignedSolanaTransaction,
  confirmSolanaTransaction,
} from "./chains/solana/broadcast.js";
