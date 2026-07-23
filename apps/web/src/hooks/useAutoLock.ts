import { useEffect, useRef } from "react";
import { useSessionStore, useSettingsStore } from "@hd-wallet/stores";
import { lockWallet } from "@/lib/wallet-session";
import { useNavigate } from "react-router-dom";

export function useAutoLock() {
  const isUnlocked = useSessionStore((s) => s.isUnlocked);
  const autoLockMinutes = useSettingsStore((s) => s.autoLockMinutes);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isUnlocked) return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(
        () => {
          void lockWallet({ navigate });
        },
        autoLockMinutes * 60 * 1000,
      );
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [isUnlocked, autoLockMinutes, navigate]);
}
