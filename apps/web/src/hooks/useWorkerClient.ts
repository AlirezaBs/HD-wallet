import { useMemo } from "react";
import * as Comlink from "comlink";
import type { CryptoWorkerApi } from "@hd-wallet/core";

let client: Comlink.Remote<CryptoWorkerApi> | null = null;

export function useWorkerClient(): Comlink.Remote<CryptoWorkerApi> {
  return useMemo(() => {
    if (!client) {
      const worker = new Worker(
        new URL("../workers/crypto.worker.ts", import.meta.url),
        { type: "module" },
      );
      client = Comlink.wrap<CryptoWorkerApi>(worker);
    }
    return client;
  }, []);
}

export function getWorkerClient(): Comlink.Remote<CryptoWorkerApi> {
  if (!client) {
    const worker = new Worker(
      new URL("../workers/crypto.worker.ts", import.meta.url),
      { type: "module" },
    );
    client = Comlink.wrap<CryptoWorkerApi>(worker);
  }
  return client;
}
