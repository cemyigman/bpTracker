"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import type { BPReading } from "@/lib/types";
import { SYSTOLIC_COLOR, DIASTOLIC_COLOR } from "@/lib/constants";

function toDate(ts: Timestamp | Date): Date {
  return ts instanceof Timestamp ? ts.toDate() : ts;
}

export function BPLineChart({ readings }: { readings: BPReading[] }) {
  const data = useMemo(() => {
    return [...readings]
      .sort((a, b) => toDate(a.measuredAt).getTime() - toDate(b.measuredAt).getTime())
      .map((r) => ({
        date: format(toDate(r.measuredAt), "MMM d"),
        fullDate: format(toDate(r.measuredAt), "MMM d, yyyy h:mm a"),
        systolic: r.systolic,
        diastolic: r.diastolic,
        pulse: r.pulse,
      }));
  }, [readings]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No readings to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis
          domain={[40, 200]}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          labelFormatter={(_, payload) => {
            if (payload && payload[0]) {
              return payload[0].payload.fullDate;
            }
            return "";
          }}
        />
        <Legend />
        <ReferenceLine
          y={120}
          stroke="#22c55e"
          strokeDasharray="3 3"
          label={{ value: "Normal", position: "right", fontSize: 10, fill: "#22c55e" }}
        />
        <ReferenceLine
          y={140}
          stroke="#ef4444"
          strokeDasharray="3 3"
          label={{ value: "High", position: "right", fontSize: 10, fill: "#ef4444" }}
        />
        <Line
          type="monotone"
          dataKey="systolic"
          stroke={SYSTOLIC_COLOR}
          name="Systolic"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="diastolic"
          stroke={DIASTOLIC_COLOR}
          name="Diastolic"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
