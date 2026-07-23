import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { copyWithClear } from "@/lib/utils";
import {
  getExplorerAddressUrl,
  type ChainFamily,
  type NetworkMode,
} from "@hd-wallet/core";
import { Check, Copy } from "lucide-react";

type ReceiveAddressCardProps = {
  address: string;
  chainFamily: ChainFamily;
  networkMode: NetworkMode;
  compact?: boolean;
};

export function ReceiveAddressCard({
  address,
  chainFamily,
  networkMode,
  compact = false,
}: ReceiveAddressCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyWithClear(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardContent
        className={
          compact ? "space-y-3 pt-4" : "flex flex-col items-center gap-4 pt-6"
        }
      >
        {!compact ? (
          <div className="rounded-xl bg-white p-4">
            <QRCodeSVG value={address} size={180} />
          </div>
        ) : null}
        <p className="font-mono text-xs break-all text-center">{address}</p>
        <Button variant="outline" onClick={handleCopy} className="w-full">
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy Address"}
        </Button>
        <a
          href={getExplorerAddressUrl(chainFamily, networkMode, address)}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-primary hover:underline"
        >
          View on explorer
        </a>
      </CardContent>
    </Card>
  );
}
