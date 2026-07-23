import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { loadActivities, type ActivityEntry } from "@hd-wallet/core";
import { ExternalLink } from "lucide-react";

export function ActivityPage() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities()
      .then(setActivities)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse h-32 bg-muted rounded-xl" />;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No activity yet</p>
        <p className="text-xs mt-1">Transactions will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Activity</h2>
      {activities.map((entry) => (
        <Card key={entry.id}>
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium capitalize">{entry.type}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {entry.status}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.amount} → {entry.to.slice(0, 10)}...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
              </div>
              <a
                href={entry.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
