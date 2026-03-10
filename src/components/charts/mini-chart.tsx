"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { BPReading } from "@/lib/types";
import { SYSTOLIC_COLOR, DIASTOLIC_COLOR } from "@/lib/constants";

function toDate(ts: Timestamp | Date): Date {
  return ts instanceof Timestamp ? ts.toDate() : ts;
}

export function MiniChart({ readings }: { readings: BPReading[] }) {
  const data = useMemo(() => {
    return [...readings]
      .sort((a, b) => toDate(a.measuredAt).getTime() - toDate(b.measuredAt).getTime())
      .slice(-14)
      .map((r) => ({
        date: format(toDate(r.measuredAt), "MMM d"),
        systolic: r.systolic,
        diastolic: r.diastolic,
      }));
  }, [readings]);

  if (data.length < 2) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Add at least 2 readings to see a chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={130}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
        <XAxis dataKey="date" hide />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "11px",
          }}
        />
        <Area
          type="monotone"
          dataKey="systolic"
          stroke={SYSTOLIC_COLOR}
          fill={SYSTOLIC_COLOR}
          fillOpacity={0.1}
          strokeWidth={1.5}
          name="Systolic"
        />
        <Area
          type="monotone"
          dataKey="diastolic"
          stroke={DIASTOLIC_COLOR}
          fill={DIASTOLIC_COLOR}
          fillOpacity={0.1}
          strokeWidth={1.5}
          name="Diastolic"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
