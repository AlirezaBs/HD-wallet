import { Card, CardContent } from "@/components/ui/card";
import { SendForm } from "@/features/send/SendForm";
import { SendPreview } from "@/features/send/SendPreview";
import { SendSigned } from "@/features/send/SendSigned";
import { SendTokenSelect } from "@/features/send/SendTokenSelect";
import { useSendFlow } from "@/features/send/useSendFlow";

export function SendPage() {
  const flow = useSendFlow();

  if (!flow.isReady) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Unlock your wallet to send tokens.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (flow.step === "signed") {
    return (
      <SendSigned
        chainFamily={flow.chainFamily}
        signedResult={flow.signedResult}
        submittedSignature={flow.submittedSignature}
        solanaBroadcastState={flow.solanaBroadcastState}
        loading={flow.loading}
        solanaBroadcastDisabled={flow.solanaBroadcastDisabled}
        solanaBroadcastLabel={flow.solanaBroadcastLabel}
        error={flow.error}
        onBroadcast={() => void flow.handleBroadcast()}
        onNewTransfer={flow.resetToSelect}
      />
    );
  }

  if (flow.step === "preview") {
    return (
      <SendPreview
        preview={flow.preview}
        onSign={flow.handleSign}
        onBack={flow.goBackToForm}
      />
    );
  }

  if (
    flow.step === "form" &&
    flow.selectedToken &&
    flow.selectedItem &&
    flow.account &&
    flow.chainFamily
  ) {
    return (
      <SendForm
        selectedItem={flow.selectedItem}
        chainFamily={flow.chainFamily}
        to={flow.to}
        amount={flow.amount}
        error={flow.error}
        onToChange={flow.setTo}
        onAmountChange={flow.setAmount}
        onMaxAmount={() => flow.setAmount(flow.selectedItem!.balance)}
        onBack={flow.resetToSelect}
        onContinue={() => void flow.validateAndBuild()}
      />
    );
  }

  return (
    <SendTokenSelect
      items={flow.sendableItems}
      error={flow.error}
      onSelect={flow.handleSelectItem}
    />
  );
}
