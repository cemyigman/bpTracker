"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Pill } from "lucide-react";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { deleteMedication } from "@/lib/firebase/firestore";
import type { Medication } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

function toDate(ts: Timestamp | Date): Date {
  return ts instanceof Timestamp ? ts.toDate() : ts;
}

const frequencyLabels: Record<string, string> = {
  daily: "Daily",
  twice_daily: "Twice Daily",
  weekly: "Weekly",
  as_needed: "As Needed",
};

export function MedicationList({ medications }: { medications: Medication[] }) {
  const { user } = useAuth();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!user || !deleteId) return;
    setDeleting(true);
    try {
      await deleteMedication(user.uid, deleteId);
      toast.success("Medication deleted");
    } catch {
      toast.error("Failed to delete medication");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  if (medications.length === 0) return null;

  return (
    <>
      <div className="space-y-3">
        {medications.map((med) => (
          <Card key={med.id}>
            <CardContent className="flex items-center justify-between py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Pill className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {med.name}
                    {med.dosage && (
                      <span className="text-sm text-muted-foreground ml-1">({med.dosage})</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(toDate(med.takenAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                {med.frequency && (
                  <Badge variant="secondary" className="text-xs">
                    {frequencyLabels[med.frequency] || med.frequency}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(med.id)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Medication"
        description="Are you sure you want to delete this medication log? This cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
