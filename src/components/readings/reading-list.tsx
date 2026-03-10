"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { deleteReading } from "@/lib/firebase/firestore";
import type { BPReading } from "@/lib/types";
import { BPCategoryBadge } from "./bp-category-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

function toDate(ts: Timestamp | Date): Date {
  return ts instanceof Timestamp ? ts.toDate() : ts;
}

export function ReadingList({ readings }: { readings: BPReading[] }) {
  const { user } = useAuth();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!user || !deleteId) return;
    setDeleting(true);
    try {
      await deleteReading(user.uid, deleteId);
      toast.success("Reading deleted");
    } catch {
      toast.error("Failed to delete reading");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  if (readings.length === 0) return null;

  return (
    <>
      <div className="space-y-3">
        {readings.map((reading) => (
          <Card key={reading.id}>
            <CardContent className="flex items-center justify-between py-3 px-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-lg font-bold">
                    {reading.systolic}/{reading.diastolic}
                    <span className="text-sm font-normal text-muted-foreground ml-1">mmHg</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(toDate(reading.measuredAt), "MMM d, yyyy 'at' h:mm a")}
                    {reading.pulse && ` | ${reading.pulse} BPM`}
                  </p>
                </div>
                <BPCategoryBadge systolic={reading.systolic} diastolic={reading.diastolic} />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(reading.id)}
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
        title="Delete Reading"
        description="Are you sure you want to delete this blood pressure reading? This cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
