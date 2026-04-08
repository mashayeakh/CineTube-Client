"use client";

import { PieChart } from "@mui/x-charts/PieChart";

type Slice = {
    label: string;
    value: number;
    color: string;
};

export function SystemSummaryChart({ slices }: { slices: Slice[] }) {
    const visible = slices.filter((s) => s.value > 0);
    const total = visible.reduce((sum, s) => sum + s.value, 0);

    if (visible.length === 0 || total === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                No summary data available
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Donut with center label overlay */}
            <div className="relative flex items-center justify-center">
                <PieChart
                    series={[
                        {
                            data: visible.map((s, i) => ({
                                id: i,
                                value: s.value,
                                label: s.label,
                                color: s.color,
                            })),
                            innerRadius: 72,
                            outerRadius: 128,
                            paddingAngle: 2,
                            cornerRadius: 4,
                            highlightScope: { fade: "global", highlight: "item" },
                            faded: { innerRadius: 72, additionalRadius: -8, color: "#e2e8f0" },
                            valueFormatter: (item) => {
                                const pct = ((item.value / total) * 100).toFixed(1);
                                return `${item.value.toLocaleString("en-US")} (${pct}%)`;
                            },
                        },
                    ]}
                    hideLegend
                    height={300}
                    margin={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    slotProps={{ tooltip: { trigger: "item" } }}
                />
                {/* center label */}
                <div className="pointer-events-none absolute flex flex-col items-center justify-center">
                    <span className="text-[11px] uppercase tracking-widest text-slate-400">Total</span>
                    <span className="text-2xl font-bold text-slate-900">{total.toLocaleString("en-US")}</span>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {visible.map((s) => {
                    const pct = ((s.value / total) * 100).toFixed(1);
                    return (
                        <div key={s.label} className="flex items-center gap-2 min-w-0">
                            <span
                                className="inline-block size-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: s.color }}
                            />
                            <span className="truncate text-slate-600">{s.label}</span>
                            <span className="ml-auto shrink-0 font-semibold text-slate-800">
                                {pct}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
