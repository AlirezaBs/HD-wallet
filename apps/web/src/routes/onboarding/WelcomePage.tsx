import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Download } from "lucide-react";

export function WelcomePage() {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Wallet className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Welcome to HD Wallet</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Create a new wallet or import an existing one with your recovery
          phrase.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Link to="/onboarding/create">
          <Button className="w-full" size="lg">
            <Wallet className="h-4 w-4" />
            Create a new wallet
          </Button>
        </Link>
        <Link to="/onboarding/import">
          <Button variant="outline" className="w-full" size="lg">
            <Download className="h-4 w-4" />
            Import existing wallet
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree that this is experimental software. Never
            share your recovery phrase with anyone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
