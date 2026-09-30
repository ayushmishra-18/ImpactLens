"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface EvidenceBarChartProps {
  data?: { month: string; count: number; verified: number; active?: boolean }[];
}

export function EvidenceBarChart({
  data = [
    { month: "May", count: 8, verified: 6 },
    { month: "Jun", count: 18, verified: 15 },
    { month: "Jul", count: 29, verified: 26 },
    { month: "Aug", count: 38, verified: 34 },
    { month: "Sep", count: 48, verified: 41, active: true },
  ],
}: EvidenceBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="glass p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted">
            Evidence Velocity
          </span>
          <h3 className="text-base font-semibold text-ink mt-0.5">
            Media Ingestion / Month
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7B6DF2]" />
          <span className="text-xs text-ink-muted font-medium">Active (Sep)</span>
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-44 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            onMouseMove={(state) => {
              if (typeof state.activeTooltipIndex === "number") {
                setHoveredIndex(state.activeTooltipIndex);
              } else if (typeof state.activeTooltipIndex === "string") {
                const parsed = parseInt(state.activeTooltipIndex, 10);
                setHoveredIndex(isNaN(parsed) ? null : parsed);
              }
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id="activeBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7B6DF2" />
                <stop offset="100%" stopColor="#A9CDFF" />
              </linearGradient>
              <linearGradient id="normalBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C4D6F7" />
                <stop offset="100%" stopColor="#E2EBFA" />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#5D6785", fontSize: 12, fontWeight: 500 }}
            />

            <Tooltip
              cursor={{ fill: "rgba(255, 255, 255, 0.4)", radius: 12 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-ink text-white px-3 py-1.5 rounded-xl shadow-xl text-xs flex flex-col gap-0.5 border border-white/10">
                      <span className="font-semibold">{item.month} 2026</span>
                      <span className="text-accent-sky font-medium">
                        {item.count} assets ({item.verified} verified)
                      </span>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar
              dataKey="count"
              radius={[12, 12, 4, 4]}
              maxBarSize={44}
            >
              {data.map((entry, index) => {
                const isActive = entry.active || hoveredIndex === index;
                return (
                  <Cell
                    key={`cell-${entry.month}`}
                    fill={isActive ? "url(#activeBar)" : "url(#normalBar)"}
                    className="transition-all duration-300 cursor-pointer"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between pt-3 border-t border-white/40 text-xs text-ink-muted">
        <span>Growth: +26% vs Aug</span>
        <span className="font-medium text-ink">Peak: 48 Assets</span>
      </div>
    </div>
  );
}
