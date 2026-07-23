import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { formatFiat, formatPriceTimestamp } from "@/lib/tokens";

type TokenPriceChartProps = {
  data: { timestamp: number; price: number }[];
  className?: string;
};

type ChartPoint = {
  timestamp: number;
  price: number;
  label: string;
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
}) {
  if (!active || !payload?.[0]) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-card px-2 py-1 text-xs shadow-md">
      <p className="font-medium">{formatFiat(point.price)}</p>
      <p className="text-muted-foreground">{point.label}</p>
    </div>
  );
}

export function TokenPriceChart({ data, className }: TokenPriceChartProps) {
  const chartData = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        label: formatPriceTimestamp(point.timestamp),
      })),
    [data],
  );

  const { minPoint, maxPoint } = useMemo(() => {
    if (chartData.length === 0) {
      return { minPoint: null, maxPoint: null };
    }

    let min = chartData[0]!;
    let max = chartData[0]!;

    for (const point of chartData) {
      if (point.price < min.price) min = point;
      if (point.price > max.price) max = point;
    }

    return { minPoint: min, maxPoint: max };
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div
        className={cn(
          "flex h-48 items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground",
          className,
        )}
      >
        No chart data
      </div>
    );
  }

  return (
    <div className={cn("relative h-52 w-full", className)}>
      {maxPoint ? (
        <span className="absolute left-2 top-2 z-10 text-xs text-muted-foreground">
          {formatFiat(maxPoint.price)}
        </span>
      ) : null}
      {minPoint ? (
        <span className="absolute bottom-8 right-2 z-10 text-xs text-muted-foreground">
          {formatFiat(minPoint.price)}
        </span>
      ) : null}

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="tokenPriceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="timestamp" hide />
          <YAxis domain={["dataMin", "dataMax"]} hide />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "hsl(var(--foreground))", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#tokenPriceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
