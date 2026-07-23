import { InvalidAccountLabelError } from "../crypto/errors.js";
import type { VaultPayload } from "../vault/types.js";

export const MAX_ACCOUNT_LABEL_CODE_POINTS = 32;

export function getAvailableAccountCount(payload: VaultPayload): number {
  return Math.max(payload.evmAccountCount, payload.solanaAccountCount);
}

export function normalizeAccountLabel(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) {
    throw new InvalidAccountLabelError("Account label cannot be empty");
  }
  if (Array.from(trimmed).length > MAX_ACCOUNT_LABEL_CODE_POINTS) {
    throw new InvalidAccountLabelError(
      `Account label must be at most ${MAX_ACCOUNT_LABEL_CODE_POINTS} characters`,
    );
  }
  return trimmed;
}

export function resolveAccountLabel(labels: unknown, index: number): string {
  const stored = Array.isArray(labels) ? labels[index] : undefined;

  if (typeof stored !== "string") {
    return `Account ${index + 1}`;
  }

  const trimmed = stored.trim();
  if (!trimmed) {
    return `Account ${index + 1}`;
  }

  return trimmed;
}
