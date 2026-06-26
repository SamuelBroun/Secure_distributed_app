import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export interface TrendPoint {
  label: string;
  value: number | null;
}

export function TrendChart({
  data, color = "#163A5F", unit = "", height = 180,
}: {
  data: TrendPoint[];
  color?: string;
  unit?: string;
  height?: number;
}) {
  const id = `grad-${color.replace("#", "")}`;
  return (
    <div style={{ height }} dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                 tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                 tickLine={false} axisLine={false} width={28} />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              direction: "rtl",
              fontSize: 13,
            }}
            labelStyle={{ color: "var(--text-muted)" }}
            formatter={(v: number) => [`${v}${unit}`, ""]}
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5}
                fill={`url(#${id})`} connectNulls dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
