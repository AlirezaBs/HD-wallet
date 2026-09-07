import { describe, expect, it } from "vitest";
import { FORBIDDEN_SESSION_KEYS, useSessionStore } from "./session-store.js";

describe("session store", () => {
  it("starts locked without secret fields", () => {
    const state = useSessionStore.getState();
    expect(state.isUnlocked).toBe(false);
    expect(state.publicWalletState).toBeNull();

    for (const key of FORBIDDEN_SESSION_KEYS) {
      expect(key in state).toBe(false);
    }
  });

  it("lists all forbidden session keys", () => {
    expect(FORBIDDEN_SESSION_KEYS).toEqual([
      "password",
      "mnemonic",
      "privateKey",
      "encryptionKey",
      "rawSeed",
      "decryptedVault",
    ]);
  });

  it("updates the active chain family", () => {
    const originalChainFamily = useSessionStore.getState().activeChainFamily;

    try {
      useSessionStore.getState().setActiveChainFamily("solana");
      expect(useSessionStore.getState().activeChainFamily).toBe("solana");

      useSessionStore.getState().setActiveChainFamily("evm");
      expect(useSessionStore.getState().activeChainFamily).toBe("evm");
    } finally {
      useSessionStore.getState().setActiveChainFamily(originalChainFamily);
    }
  });
});
