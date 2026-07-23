import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SendPreviewProps = {
  preview: Record<string, string>;
  onSign: () => void;
  onBack: () => void;
};

export function SendPreview({ preview, onSign, onBack }: SendPreviewProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Review Transaction</h2>
      <Card>
        <CardContent className="pt-4 space-y-2 text-sm">
          {Object.entries(preview).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-2">
              <span className="text-muted-foreground capitalize">{key}</span>
              <span className="font-mono text-xs break-all text-right">
                {value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Button onClick={onSign} className="w-full">
        Review & Sign
      </Button>
      <Button variant="outline" className="w-full" onClick={onBack}>
        Back
      </Button>
    </div>
  );
}
