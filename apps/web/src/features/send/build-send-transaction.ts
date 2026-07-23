import {
  buildEvmTransferTx,
  buildEvmErc20TransferTx,
  buildSolTransferTx,
  formatEvmTxPreview,
  formatEvmErc20TxPreview,
  formatSolTxPreview,
} from "@hd-wallet/core";
import type { Hex } from "viem";
import type { BuildSendInput, BuildSendResult } from "./types";
import { validateRecipientAddress } from "./validate-recipient";

export function validateSendAmount(
  amount: string,
  availableBalance: string,
): string | null {
  if (!amount || parseFloat(amount) <= 0) {
    return "Enter a valid amount";
  }
  if (parseFloat(amount) > parseFloat(availableBalance)) {
    return "Amount exceeds available balance";
  }
  return null;
}

export async function buildSendTransaction(
  input: BuildSendInput,
): Promise<BuildSendResult> {
  const {
    chainFamily,
    networkMode,
    selectedToken,
    selectedItem,
    account,
    to,
    amount,
  } = input;

  const amountError = validateSendAmount(amount, selectedItem.balance);
  if (amountError) {
    throw new Error(amountError);
  }

  const addressError = validateRecipientAddress(chainFamily, to);
  if (addressError) {
    throw new Error(addressError);
  }

  if (chainFamily === "evm") {
    if (selectedToken.isNative) {
      const { unsignedTx, serializedUnsigned } = await buildEvmTransferTx({
        from: account.address as Hex,
        to: to as Hex,
        amount,
        mode: networkMode,
      });
      const previewData = formatEvmTxPreview(unsignedTx);
      return {
        preview: {
          token: selectedToken.symbol,
          from: account.address,
          to: previewData.to,
          amount: `${previewData.value} ${selectedToken.symbol}`,
          gas: previewData.gas,
          network: networkMode,
        },
        unsignedData: {
          evm: { serializedUnsigned, chainId: previewData.chainId },
        },
      };
    }

    if (!selectedToken.evmContract) {
      throw new Error("Unsupported token");
    }

    const { unsignedTx, serializedUnsigned } = await buildEvmErc20TransferTx({
      from: account.address as Hex,
      to: to as Hex,
      amount,
      mode: networkMode,
      tokenAddress: selectedToken.evmContract as Hex,
      decimals: selectedToken.decimals ?? 18,
    });
    const previewData = formatEvmErc20TxPreview(
      {
        to: to as Hex,
        amount,
        symbol: selectedToken.symbol,
      },
      unsignedTx,
    );
    return {
      preview: {
        token: previewData.token,
        from: account.address,
        to: previewData.to,
        amount: previewData.value,
        gas: previewData.gas,
        network: networkMode,
      },
      unsignedData: {
        evm: { serializedUnsigned, chainId: previewData.chainId },
      },
    };
  }

  const prepared = await buildSolTransferTx({
    from: account.address,
    to,
    amount,
    mode: networkMode,
  });
  const preview = formatSolTxPreview({
    from: account.address,
    to,
    amount,
    mode: networkMode,
  });

  return {
    preview: {
      ...preview,
      token: selectedToken.symbol,
    },
    unsignedData: { solana: prepared },
  };
}
