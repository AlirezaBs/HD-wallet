import {
  broadcastEvmTransaction,
  submitSignedSolanaTransaction,
  confirmSolanaTransaction,
  saveActivity,
  updateActivityStatus,
  getExplorerTxUrl,
  SolanaBlockhashExpiredError,
} from "@hd-wallet/core";
import type { Hex } from "viem";
import type { SignedSolanaTransaction } from "@hd-wallet/core";
import type { SendUnsignedData } from "./types";

export { buildSendTransaction } from "./build-send-transaction";
export {
  getSolanaBroadcastLabel,
  isSolanaBroadcastDisabled,
} from "./broadcast-signed-transaction";
export { SolanaBlockhashExpiredError };

export async function broadcastEvmSend(params: {
  signedResult: string;
  networkMode: "testnet" | "mainnet";
  accountAddress: string;
  to: string;
  amount: string;
}): Promise<string> {
  const hash = await broadcastEvmTransaction(
    params.signedResult as Hex,
    params.networkMode,
  );
  await saveActivity({
    id: hash,
    chainFamily: "evm",
    type: "send",
    hash,
    from: params.accountAddress,
    to: params.to,
    amount: params.amount,
    status: "pending",
    timestamp: Date.now(),
    explorerUrl: getExplorerTxUrl("evm", params.networkMode, hash),
  });
  return hash;
}

export async function confirmSolanaSend(params: {
  signature: string;
  unsignedSolana: NonNullable<SendUnsignedData["solana"]>;
  networkMode: "testnet" | "mainnet";
}): Promise<void> {
  await confirmSolanaTransaction(
    params.signature,
    {
      blockhash: params.unsignedSolana.blockhash,
      lastValidBlockHeight: params.unsignedSolana.lastValidBlockHeight,
    },
    params.networkMode,
  );
  await updateActivityStatus(params.signature, "confirmed");
}

export async function submitSolanaSend(params: {
  signedSolana: SignedSolanaTransaction;
  networkMode: "testnet" | "mainnet";
  accountAddress: string;
  to: string;
  amount: string;
}): Promise<string> {
  const signature = await submitSignedSolanaTransaction(
    params.signedSolana,
    params.networkMode,
  );
  await saveActivity({
    id: signature,
    chainFamily: "solana",
    type: "send",
    hash: signature,
    from: params.accountAddress,
    to: params.to,
    amount: params.amount,
    status: "pending",
    timestamp: Date.now(),
    explorerUrl: getExplorerTxUrl("solana", params.networkMode, signature),
  });
  return signature;
}
