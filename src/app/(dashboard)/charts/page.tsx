"use client";

import { useRef, useMemo, useState } from "react";
import { subDays, subMonths, subYears, startOfDay } from "date-fns";
import { useReadings } from "@/hooks/use-readings";
import { useMedications } from "@/hooks/use-medications";
import type { TimeRange } from "@/lib/types";
import { Topbar } from "@/components/layout/topbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BPLineChart } from "@/components/charts/bp-line-chart";
import { CalendarView } from "@/components/charts/calendar-view";
import { ChartFilter } from "@/components/charts/chart-filter";
import { ChartContainer } from "@/components/charts/chart-container";
import { PDFExportButton } from "@/components/shared/pdf-export-button";
import { EmailShareDialog } from "@/components/shared/email-share-dialog";

function getDateRange(range: TimeRange): Date {
  const now = new Date();
  switch (range) {
    case "day":
      return startOfDay(now);
    case "week":
      return subDays(now, 7);
    case "month":
      return subMonths(now, 1);
    case "year":
      return subYears(now, 1);
  }
}

export default function ChartsPage() {
  const [range, setRange] = useState<TimeRange>("week");
  const chartRef = useRef<HTMLDivElement>(null);

  const startDate = useMemo(() => getDateRange(range), [range]);
  const { readings, loading: readingsLoading } = useReadings(startDate);
  const { medications, loading: medsLoading } = useMedications(startDate);

  const loading = readingsLoading || medsLoading;

  return (
    <div>
      <Topbar title="Charts" />
      <div className="p-4 md:p-6 space-y-6">
        <Tabs defaultValue="line">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="line">Line Chart</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <ChartFilter value={range} onChange={setRange} />
            </div>
          </div>

          <TabsContent value="line">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Blood Pressure Over Time</CardTitle>
                <div className="flex gap-2">
                  <PDFExportButton chartRef={chartRef} title="Blood Pressure Report" />
                  <EmailShareDialog chartRef={chartRef} title="Blood Pressure Report" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <ChartContainer ref={chartRef}>
                    <BPLineChart readings={readings} />
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            {loading ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <CalendarView readings={readings} medications={medications} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
