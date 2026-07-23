import { argon2id } from "hash-wasm";
import { DEFAULT_KDF_PARAMS } from "../vault/types.js";
import { base64ToBytes, bytesToBase64 } from "../encoding/base64.js";

export type KdfParams = {
  memoryKiB: number;
  iterations: number;
  parallelism: number;
  salt: Uint8Array;
};

export function generateSalt(): Uint8Array {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return salt;
}

export async function deriveKey(
  password: string,
  params: KdfParams,
): Promise<Uint8Array> {
  const hash = await argon2id({
    password,
    salt: params.salt,
    parallelism: params.parallelism,
    iterations: params.iterations,
    memorySize: params.memoryKiB,
    hashLength: 32,
    outputType: "binary",
  });
  return new Uint8Array(hash);
}

export function kdfParamsToVault(params: KdfParams): {
  name: "argon2id";
  memoryKiB: number;
  iterations: number;
  parallelism: number;
  salt: string;
} {
  return {
    name: "argon2id",
    memoryKiB: params.memoryKiB,
    iterations: params.iterations,
    parallelism: params.parallelism,
    salt: bytesToBase64(params.salt),
  };
}

export function vaultToKdfParams(vault: {
  kdf: {
    memoryKiB: number;
    iterations: number;
    parallelism: number;
    salt: string;
  };
}): KdfParams {
  return {
    memoryKiB: vault.kdf.memoryKiB,
    iterations: vault.kdf.iterations,
    parallelism: vault.kdf.parallelism,
    salt: base64ToBytes(vault.kdf.salt),
  };
}

export function createDefaultKdfParams(): KdfParams {
  return {
    ...DEFAULT_KDF_PARAMS,
    salt: generateSalt(),
  };
}
