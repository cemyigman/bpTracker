"use client";

import { useMemo } from "react";
import { subDays, startOfDay, isSameDay } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { HeartPulse, Pill, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useReadings } from "@/hooks/use-readings";
import { useMedications } from "@/hooks/use-medications";
import { getBPCategory, BP_CATEGORY_CONFIG } from "@/lib/constants";
import type { BPReading, Medication } from "@/lib/types";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BPCategoryBadge } from "@/components/readings/bp-category-badge";
import { MiniChart } from "@/components/charts/mini-chart";

function toDate(ts: Timestamp | Date): Date {
  return ts instanceof Timestamp ? ts.toDate() : ts;
}

export default function DashboardPage() {
  const { readings, loading: readingsLoading } = useReadings();
  const { medications, loading: medsLoading } = useMedications();

  const stats = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    const today = startOfDay(now);

    const latest = readings[0] || null;

    const weekReadings = readings.filter(
      (r: BPReading) => toDate(r.measuredAt).getTime() >= sevenDaysAgo.getTime()
    );
    const avgSys = weekReadings.length
      ? Math.round(weekReadings.reduce((s: number, r: BPReading) => s + r.systolic, 0) / weekReadings.length)
      : null;
    const avgDia = weekReadings.length
      ? Math.round(weekReadings.reduce((s: number, r: BPReading) => s + r.diastolic, 0) / weekReadings.length)
      : null;

    const todayMeds = medications.filter((m: Medication) =>
      isSameDay(toDate(m.takenAt), today)
    );

    return { latest, avgSys, avgDia, weekReadings, todayMeds, totalReadings: readings.length };
  }, [readings, medications]);

  const loading = readingsLoading || medsLoading;

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="p-4 md:p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Latest Reading
              </CardTitle>
              <HeartPulse className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : stats.latest ? (
                <div>
                  <p className="text-2xl font-bold">
                    {stats.latest.systolic}/{stats.latest.diastolic}
                  </p>
                  <BPCategoryBadge
                    systolic={stats.latest.systolic}
                    diastolic={stats.latest.diastolic}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No readings yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                7-Day Average
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : stats.avgSys ? (
                <div>
                  <p className="text-2xl font-bold">
                    {stats.avgSys}/{stats.avgDia}
                  </p>
                  <BPCategoryBadge systolic={stats.avgSys} diastolic={stats.avgDia!} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No data</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Readings
              </CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats.totalReadings}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Meds Today
              </CardTitle>
              <Pill className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats.todayMeds.length}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mini Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <MiniChart readings={readings} />
            )}
          </CardContent>
        </Card>

        {/* Quick Add */}
        <div className="flex gap-3">
          <Link
            href="/readings"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            <HeartPulse className="h-4 w-4" />
            Add Reading
          </Link>
          <Link
            href="/medications"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background text-foreground px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Pill className="h-4 w-4" />
            Log Medication
          </Link>
        </div>
      </div>
    </div>
  );
}
