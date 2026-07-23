import { TokenList } from "@/components/TokenList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWalletAccounts } from "@/hooks/useWalletAccounts";
import { ArrowDownLeft, Send } from "lucide-react";
import { Link } from "react-router-dom";

export function HomePage() {
  const { isReady } = useWalletAccounts();

  if (!isReady) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Wallet session is not ready. Unlock your wallet to view tokens.
          </p>
          <Link to="/unlock" className="mt-4 inline-block">
            <Button variant="outline">Go to unlock</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Link to="/wallet/receive">
          <Button variant="outline" className="h-16 w-full flex-col gap-1">
            <ArrowDownLeft className="h-5 w-5" />
            Receive
          </Button>
        </Link>
        <Link to="/wallet/send">
          <Button variant="outline" className="h-16 w-full flex-col gap-1">
            <Send className="h-5 w-5" />
            Send
          </Button>
        </Link>
      </div>

      <TokenList />
    </div>
  );
}
