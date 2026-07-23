import { privateKeyToAccount } from "viem/accounts";
import { parseTransaction, type Hex, type TransactionSerializable } from "viem";
import {
  CannotRemoveAccountError,
  InvalidAccountIndexError,
  WorkerLockedError,
} from "./errors.js";
import type { VaultPayload } from "../vault/types.js";
import {
  persistVault,
  decryptVault,
  updateVaultWithKey,
} from "../vault/vault-service.js";
import { loadEncryptedVault } from "../vault/storage.js";
import { createMnemonic, normalizeMnemonic } from "../wallet/mnemonic.js";
import { deriveEvmAccount } from "../wallet/derive-evm.js";
import { deriveSolanaAccount } from "../wallet/derive-solana.js";
import {
  getAvailableAccountCount,
  normalizeAccountLabel,
} from "../wallet/account-labels.js";
import {
  buildPublicWalletState,
  createInitialPayload,
} from "../wallet/state.js";
import type {
  ChainFamily,
  PublicWalletState,
  SignEvmMessageInput,
  SignEvmTransactionInput,
  SignSolanaMessageInput,
  SignSolanaTransactionInput,
} from "../wallet/types.js";
import {
  assembleSignedLegacySolanaTransaction,
  toSignedSolanaTransaction,
  validateLegacySigner,
} from "../chains/solana/sign-tx.js";
import type { SignedSolanaTransaction } from "../chains/solana/types.js";
import * as ed25519 from "@noble/ed25519";
import { base58 } from "@scure/base";
import { bytesToHex } from "@noble/hashes/utils";
import { deriveKey, vaultToKdfParams } from "./kdf.js";
import { ensureEd25519 } from "./ed25519-setup.js";

class CryptoWorkerService {
  private payload: VaultPayload | null = null;
  private encryptionKey: Uint8Array | null = null;
  private unlocked = false;

  private assertUnlocked(): void {
    if (!this.unlocked || !this.payload || !this.encryptionKey) {
      throw new WorkerLockedError();
    }
  }

  private clearMemory(): void {
    this.payload = null;
    this.encryptionKey = null;
    this.unlocked = false;
  }

  private async unlockWithPassword(
    password: string,
  ): Promise<PublicWalletState> {
    const vault = await loadEncryptedVault();
    if (!vault) throw new Error("No vault found");

    const kdfParams = vaultToKdfParams(vault);
    const key = await deriveKey(password, kdfParams);
    const payload = await decryptVault(password, vault);

    this.payload = payload;
    this.encryptionKey = key;
    this.unlocked = true;
    return buildPublicWalletState(payload.mnemonic, payload);
  }

  private async persistPayload(payload: VaultPayload): Promise<void> {
    this.assertUnlocked();
    await updateVaultWithKey(this.encryptionKey!, payload);
  }

  async createVault(
    password: string,
  ): Promise<{ state: PublicWalletState; mnemonic: string }> {
    const mnemonic = createMnemonic(12);
    const payload = createInitialPayload(mnemonic);
    await persistVault(password, payload);

    const vault = await loadEncryptedVault();
    const key = await deriveKey(password, vaultToKdfParams(vault!));

    this.payload = payload;
    this.encryptionKey = key;
    this.unlocked = true;

    return {
      state: buildPublicWalletState(mnemonic, payload),
      mnemonic,
    };
  }

  async importVault(
    password: string,
    mnemonic: string,
  ): Promise<PublicWalletState> {
    const normalized = normalizeMnemonic(mnemonic);
    const payload = createInitialPayload(normalized);
    await persistVault(password, payload);

    const vault = await loadEncryptedVault();
    const key = await deriveKey(password, vaultToKdfParams(vault!));

    this.payload = payload;
    this.encryptionKey = key;
    this.unlocked = true;
    return buildPublicWalletState(normalized, payload);
  }

  async unlockVault(password: string): Promise<PublicWalletState> {
    return this.unlockWithPassword(password);
  }

  async lockVault(): Promise<void> {
    this.clearMemory();
  }

  async exportRecoveryPhrase(password: string): Promise<string> {
    const vault = await loadEncryptedVault();
    if (!vault) throw new Error("No vault found");

    const payload = await decryptVault(password, vault);
    return payload.mnemonic;
  }

  async addAccount(chainFamily: ChainFamily): Promise<PublicWalletState> {
    this.assertUnlocked();
    const current = this.payload!;
    const nextPayload: VaultPayload = { ...current };

    if (chainFamily === "evm") {
      nextPayload.evmAccountCount += 1;
    } else {
      nextPayload.solanaAccountCount += 1;
    }

    await this.persistPayload(nextPayload);
    this.payload = nextPayload;
    return buildPublicWalletState(nextPayload.mnemonic, nextPayload);
  }

  async renameAccount(
    accountIndex: number,
    label: string,
  ): Promise<PublicWalletState> {
    this.assertUnlocked();
    const currentPayload = this.payload!;
    const available = getAvailableAccountCount(currentPayload);

    if (
      !Number.isInteger(accountIndex) ||
      accountIndex < 0 ||
      accountIndex >= available
    ) {
      throw new InvalidAccountIndexError();
    }

    const normalized = normalizeAccountLabel(label);
    const nextLabels = [...(currentPayload.accountLabels ?? [])];
    while (nextLabels.length <= accountIndex) {
      nextLabels.push("");
    }
    nextLabels[accountIndex] = normalized;

    const nextPayload: VaultPayload = {
      ...currentPayload,
      accountLabels: nextLabels,
    };

    await this.persistPayload(nextPayload);
    this.payload = nextPayload;
    return buildPublicWalletState(nextPayload.mnemonic, nextPayload);
  }

  async removeLastAccount(): Promise<PublicWalletState> {
    this.assertUnlocked();
    const currentPayload = this.payload!;
    const pairedCount = Math.min(
      currentPayload.evmAccountCount,
      currentPayload.solanaAccountCount,
    );

    if (pairedCount <= 1) {
      throw new CannotRemoveAccountError();
    }

    const nextCount = pairedCount - 1;
    const nextLabels = (currentPayload.accountLabels ?? []).slice(0, nextCount);
    const nextPayload: VaultPayload = {
      ...currentPayload,
      evmAccountCount: nextCount,
      solanaAccountCount: nextCount,
      accountLabels: nextLabels,
    };

    await this.persistPayload(nextPayload);
    this.payload = nextPayload;
    return buildPublicWalletState(nextPayload.mnemonic, nextPayload);
  }

  async signEvmMessage(input: SignEvmMessageInput): Promise<string> {
    this.assertUnlocked();
    const { privateKey } = deriveEvmAccount(
      this.payload!.mnemonic,
      input.accountIndex,
    );
    const account = privateKeyToAccount(`0x${bytesToHex(privateKey)}` as Hex);
    const message =
      typeof input.message === "string"
        ? input.message
        : new TextDecoder().decode(input.message);
    return account.signMessage({ message });
  }

  async signEvmTransaction(input: SignEvmTransactionInput): Promise<string> {
    this.assertUnlocked();
    const { privateKey } = deriveEvmAccount(
      this.payload!.mnemonic,
      input.accountIndex,
    );
    const account = privateKeyToAccount(`0x${bytesToHex(privateKey)}` as Hex);
    const tx = parseTransaction(input.serializedUnsignedTx);
    return account.signTransaction(tx as TransactionSerializable);
  }

  async signSolanaMessage(input: SignSolanaMessageInput): Promise<string> {
    this.assertUnlocked();
    ensureEd25519();
    const { privateKey } = deriveSolanaAccount(
      this.payload!.mnemonic,
      input.accountIndex,
    );
    const signature = await ed25519.sign(input.message, privateKey);
    return base58.encode(signature);
  }

  async signSolanaTransaction(
    input: SignSolanaTransactionInput,
  ): Promise<SignedSolanaTransaction> {
    this.assertUnlocked();
    ensureEd25519();
    const { privateKey, address } = deriveSolanaAccount(
      this.payload!.mnemonic,
      input.accountIndex,
    );

    try {
      validateLegacySigner({
        serializedMessage: input.serializedMessage,
        signerAddress: address,
        expectedSignerAddress: input.expectedSignerAddress,
      });

      const signature = await ed25519.sign(input.serializedMessage, privateKey);
      const wireBytes = assembleSignedLegacySolanaTransaction(
        input.serializedMessage,
        address,
        signature,
      );
      return toSignedSolanaTransaction(wireBytes);
    } finally {
      privateKey.fill(0);
    }
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }
}

export const cryptoWorkerService = new CryptoWorkerService();
