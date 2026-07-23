import { bytesToBase64, base64ToBytes } from "../encoding/base64.js";

export interface EncryptResult {
  iv: string;
  ciphertext: string;
}

export async function encrypt(
  key: Uint8Array,
  plaintext: Uint8Array,
): Promise<EncryptResult> {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key.buffer as ArrayBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer, tagLength: 128 },
    cryptoKey,
    plaintext.buffer as ArrayBuffer,
  );

  return {
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
  };
}

export async function decrypt(
  key: Uint8Array,
  iv: string,
  ciphertext: string,
): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key.buffer as ArrayBuffer,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64ToBytes(iv).buffer as ArrayBuffer,
        tagLength: 128,
      },
      cryptoKey,
      base64ToBytes(ciphertext).buffer as ArrayBuffer,
    );
    return new Uint8Array(decrypted);
  } catch {
    throw new Error("Decryption failed");
  }
}

export function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}
