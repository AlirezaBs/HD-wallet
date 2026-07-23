import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useWalletPortfolioContext } from "@/features/tokens/WalletPortfolioProvider";
import { useWalletAccounts } from "@/hooks/useWalletAccounts";
import { useSessionStore } from "@hd-wallet/stores";
import { useWorkerClient } from "@/hooks/useWorkerClient";
import { canSendToken } from "@/features/tokens/tokenCapabilities";
import { getErrorMessage } from "@/lib/errors";
import { openSignConfirmDialog } from "@/features/signing/SignConfirmDialog";
import { updateActivityStatus } from "@hd-wallet/core";
import type { SignedSolanaTransaction } from "@hd-wallet/core";
import type { TokenDisplayItem } from "@/features/tokens/types";
import {
  buildSendTransaction,
  broadcastEvmSend,
  submitSolanaSend,
  confirmSolanaSend,
  getSolanaBroadcastLabel,
  isSolanaBroadcastDisabled,
  SolanaBlockhashExpiredError,
} from "./send-actions";
import type { SendStep, SendUnsignedData, SolanaBroadcastState } from "./types";

export function useSendFlow() {
  const [searchParams, setSearchParams] = useSearchParams();
  const chainParam = searchParams.get("chain");
  const tokenParam = searchParams.get("token");
  const appliedDeepLinkRef = useRef<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<TokenDisplayItem | null>(
    null,
  );
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<SendStep>("select");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Record<string, string>>({});
  const [signedResult, setSignedResult] = useState("");
  const [signedSolana, setSignedSolana] =
    useState<SignedSolanaTransaction | null>(null);
  const [solanaBroadcastState, setSolanaBroadcastState] =
    useState<SolanaBroadcastState>("idle");
  const [submittedSignature, setSubmittedSignature] = useState<string | null>(
    null,
  );
  const [hasRecordedActivity, setHasRecordedActivity] = useState(false);
  const [unsignedData, setUnsignedData] = useState<SendUnsignedData>({});

  const { evmAccount, solanaAccount, isReady } = useWalletAccounts();
  const { portfolio } = useWalletPortfolioContext();
  const activeEvmIndex = useSessionStore((s) => s.activeEvmAccountIndex);
  const activeSolanaIndex = useSessionStore((s) => s.activeSolanaAccountIndex);
  const worker = useWorkerClient();

  const sendableItems = useMemo(
    () =>
      portfolio.displayItems.filter((item) =>
        canSendToken(item.entry.token, item.entry.chainFamily),
      ),
    [portfolio.displayItems],
  );

  const chainFamily = selectedItem?.entry.chainFamily;
  const networkMode = selectedItem?.entry.networkMode;
  const selectedToken = selectedItem?.entry.token ?? null;
  const account = useMemo(() => {
    if (chainFamily === "evm") return evmAccount;
    if (chainFamily === "solana") return solanaAccount;
    return null;
  }, [chainFamily, evmAccount, solanaAccount]);

  const deepLinkKey =
    chainParam && tokenParam ? `${chainParam}:${tokenParam}` : null;

  useEffect(() => {
    if (!deepLinkKey) {
      appliedDeepLinkRef.current = null;
      return;
    }
    if (sendableItems.length === 0) return;
    if (appliedDeepLinkRef.current === deepLinkKey) return;

    const item = sendableItems.find(
      (entry) =>
        entry.entry.chainFamily === chainParam &&
        entry.entry.token.id === tokenParam,
    );
    if (!item) return;

    appliedDeepLinkRef.current = deepLinkKey;
    setSelectedItem(item);
    setStep("form");
    setError("");
  }, [deepLinkKey, chainParam, tokenParam, sendableItems]);

  const resetToSelect = () => {
    appliedDeepLinkRef.current = null;
    if (chainParam || tokenParam) {
      setSearchParams({}, { replace: true });
    }
    setStep("select");
    setSelectedItem(null);
    setTo("");
    setAmount("");
    setError("");
    setPreview({});
    setSignedResult("");
    setSignedSolana(null);
    setSolanaBroadcastState("idle");
    setSubmittedSignature(null);
    setHasRecordedActivity(false);
    setUnsignedData({});
  };

  const handleSelectItem = (item: TokenDisplayItem) => {
    setError("");
    setSelectedItem(item);
    setStep("form");
  };

  const validateAndBuild = async () => {
    setError("");
    if (
      !account ||
      !selectedToken ||
      !chainFamily ||
      !networkMode ||
      !selectedItem
    ) {
      return;
    }

    try {
      const result = await buildSendTransaction({
        chainFamily,
        networkMode,
        selectedToken,
        selectedItem,
        account,
        to,
        amount,
      });
      setPreview(result.preview);
      setUnsignedData(result.unsignedData);
      setStep("preview");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to build transaction"));
    }
  };

  const handleSign = () => {
    openSignConfirmDialog({
      title: "Sign Transaction",
      description:
        "You are about to sign this transaction. This action cannot be undone.",
      details: preview,
      confirmLabel: "Sign",
      onConfirm: async () => {
        if (chainFamily === "evm" && unsignedData.evm) {
          const signed = await worker.signEvmTransaction({
            accountIndex: activeEvmIndex,
            serializedUnsignedTx: unsignedData.evm.serializedUnsigned,
            chainId: unsignedData.evm.chainId,
          });
          setSignedResult(signed);
          setStep("signed");
        } else if (unsignedData.solana && account) {
          const signed = await worker.signSolanaTransaction({
            accountIndex: activeSolanaIndex,
            serializedMessage: unsignedData.solana.serializedMessage,
            expectedSignerAddress: account.address,
          });
          setSignedSolana(signed);
          setSolanaBroadcastState("idle");
          setSubmittedSignature(null);
          setHasRecordedActivity(false);
          setStep("signed");
        }
      },
    });
  };

  const handleBroadcast = async () => {
    if (!account || !networkMode) return;

    if (chainFamily === "evm") {
      if (!signedResult) return;
      setLoading(true);
      setError("");
      try {
        const hash = await broadcastEvmSend({
          signedResult,
          networkMode,
          accountAddress: account.address,
          to,
          amount,
        });
        setSignedResult(hash);
      } catch (err) {
        setError(getErrorMessage(err, "Broadcast failed"));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (
      chainFamily !== "solana" ||
      !signedSolana ||
      !unsignedData.solana ||
      hasRecordedActivity ||
      solanaBroadcastState === "submitting" ||
      solanaBroadcastState === "confirming" ||
      solanaBroadcastState === "confirmed"
    ) {
      return;
    }

    setLoading(true);
    setError("");
    setSolanaBroadcastState("submitting");

    let signature: string | null = null;
    let activityRecorded = false;
    try {
      signature = await submitSolanaSend({
        signedSolana,
        networkMode,
        accountAddress: account.address,
        to,
        amount,
      });
      setSubmittedSignature(signature);
      activityRecorded = true;
      setHasRecordedActivity(true);

      setSolanaBroadcastState("confirming");
      await confirmSolanaSend({
        signature,
        unsignedSolana: unsignedData.solana,
        networkMode,
      });

      setSolanaBroadcastState("confirmed");
      setSignedResult(signature);
    } catch (err) {
      if (signature && activityRecorded) {
        await updateActivityStatus(signature, "failed");
      }
      setSolanaBroadcastState("failed");
      if (err instanceof SolanaBlockhashExpiredError) {
        setError(err.message);
      } else {
        setError(getErrorMessage(err, "Broadcast failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const solanaBroadcastDisabled = isSolanaBroadcastDisabled(
    loading,
    solanaBroadcastState,
    hasRecordedActivity,
  );

  const solanaBroadcastLabel = getSolanaBroadcastLabel(solanaBroadcastState);

  return {
    isReady,
    step,
    error,
    sendableItems,
    selectedItem,
    selectedToken,
    chainFamily,
    account,
    to,
    amount,
    preview,
    signedResult,
    submittedSignature,
    solanaBroadcastState,
    loading,
    solanaBroadcastDisabled,
    solanaBroadcastLabel,
    setTo,
    setAmount,
    resetToSelect,
    handleSelectItem,
    validateAndBuild,
    handleSign,
    handleBroadcast,
    goBackToForm: () => setStep("form"),
  };
}
