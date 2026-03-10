"use client";

import { Pill } from "lucide-react";
import { useMedications } from "@/hooks/use-medications";
import { Topbar } from "@/components/layout/topbar";
import { MedicationForm } from "@/components/medications/medication-form";
import { MedicationList } from "@/components/medications/medication-list";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function MedicationsPage() {
  const { medications, loading } = useMedications();

  return (
    <div>
      <Topbar title="Medications" />
      <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
        <MedicationForm />

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : medications.length === 0 ? (
          <EmptyState
            icon={Pill}
            title="No medications logged"
            description="Log your first medication above to start tracking."
          />
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-3">
              History ({medications.length} entries)
            </h2>
            <MedicationList medications={medications} />
          </div>
        )}
      </div>
    </div>
  );
}
