"use client";

import { HeartPulse } from "lucide-react";
import { useReadings } from "@/hooks/use-readings";
import { Topbar } from "@/components/layout/topbar";
import { ReadingForm } from "@/components/readings/reading-form";
import { ReadingList } from "@/components/readings/reading-list";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReadingsPage() {
  const { readings, loading } = useReadings();

  return (
    <div>
      <Topbar title="Blood Pressure Readings" />
      <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
        <ReadingForm />

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : readings.length === 0 ? (
          <EmptyState
            icon={HeartPulse}
            title="No readings yet"
            description="Add your first blood pressure reading above to start tracking."
          />
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-3">
              History ({readings.length} readings)
            </h2>
            <ReadingList readings={readings} />
          </div>
        )}
      </div>
    </div>
  );
}
