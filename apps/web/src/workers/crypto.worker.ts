import * as Comlink from "comlink";
import { cryptoWorkerService } from "@hd-wallet/core-worker-service";
import type { CryptoWorkerApi } from "@hd-wallet/core";

const api: CryptoWorkerApi = {
  createVault: (password) => cryptoWorkerService.createVault(password),
  importVault: (password, mnemonic) =>
    cryptoWorkerService.importVault(password, mnemonic),
  unlockVault: (password) => cryptoWorkerService.unlockVault(password),
  lockVault: () => cryptoWorkerService.lockVault(),
  addAccount: (chainFamily) => cryptoWorkerService.addAccount(chainFamily),
  renameAccount: (accountIndex, label) =>
    cryptoWorkerService.renameAccount(accountIndex, label),
  removeLastAccount: () => cryptoWorkerService.removeLastAccount(),
  signEvmMessage: (input) => cryptoWorkerService.signEvmMessage(input),
  signEvmTransaction: (input) => cryptoWorkerService.signEvmTransaction(input),
  signSolanaMessage: (input) => cryptoWorkerService.signSolanaMessage(input),
  signSolanaTransaction: (input) =>
    cryptoWorkerService.signSolanaTransaction(input),
  exportRecoveryPhrase: (password) =>
    cryptoWorkerService.exportRecoveryPhrase(password),
};

Comlink.expose(api);
