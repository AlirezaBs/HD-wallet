import type { PreparedSolanaTransaction } from "@hd-wallet/core";
import type { Hex } from "viem";
import type { TokenDisplayItem } from "@/features/tokens/types";

export type SendStep = "select" | "form" | "preview" | "signed";

export type SolanaBroadcastState =
  "idle" | "submitting" | "confirming" | "confirmed" | "failed";

export type SendUnsignedData = {
  evm?: { serializedUnsigned: Hex; chainId: number };
  solana?: PreparedSolanaTransaction;
};

export type SendFlowAccount = {
  address: string;
};

export type BuildSendInput = {
  chainFamily: "evm" | "solana";
  networkMode: "testnet" | "mainnet";
  selectedToken: TokenDisplayItem["entry"]["token"];
  selectedItem: TokenDisplayItem;
  account: SendFlowAccount;
  to: string;
  amount: string;
};

export type BuildSendResult = {
  preview: Record<string, string>;
  unsignedData: SendUnsignedData;
};
