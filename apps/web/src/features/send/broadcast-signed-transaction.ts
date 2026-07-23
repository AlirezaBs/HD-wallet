import type { SolanaBroadcastState } from "./types";

export function getSolanaBroadcastLabel(state: SolanaBroadcastState): string {
  if (state === "submitting") return "Submitting...";
  if (state === "confirming") return "Confirming...";
  if (state === "confirmed") return "Broadcast complete";
  if (state === "failed") return "Broadcast failed";
  return "Broadcast Transaction";
}

export function isSolanaBroadcastDisabled(
  loading: boolean,
  state: SolanaBroadcastState,
  hasRecordedActivity: boolean,
): boolean {
  return (
    loading ||
    state === "submitting" ||
    state === "confirming" ||
    state === "confirmed" ||
    hasRecordedActivity
  );
}
