"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { addMedication } from "@/lib/firebase/firestore";
import { medicationSchema, type MedicationFormValues } from "@/lib/validations/medication";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MedicationForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      date: format(now, "yyyy-MM-dd"),
      time: format(now, "HH:mm"),
    },
  });

  async function onSubmit(data: MedicationFormValues) {
    if (!user) return;
    setLoading(true);
    try {
      const takenAt = new Date(`${data.date}T${data.time}`);
      await addMedication(user.uid, {
        name: data.name,
        dosage: data.dosage || undefined,
        takenAt,
        notes: data.notes || undefined,
        frequency: data.frequency || undefined,
      });
      toast.success("Medication logged");
      reset({
        name: "",
        dosage: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: format(new Date(), "HH:mm"),
        notes: "",
      });
      onSuccess?.();
    } catch (err) {
      console.error("Medication log error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg.includes("Missing or insufficient permissions")) {
        toast.error("Firestore permissions denied. Set your database to test mode in Firebase Console.");
      } else if (msg.includes("offline")) {
        toast.error("Cannot reach Firestore. Make sure you created a database in Firebase Console > Firestore Database.");
      } else {
        toast.error(`Failed to log medication: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Log Medication</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Medication Name</Label>
            <Input
              id="name"
              placeholder="e.g., Lisinopril"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dosage">Dosage - Optional</Label>
            <Input
              id="dosage"
              placeholder="e.g., 10mg"
              {...register("dosage")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="med-date">Date</Label>
              <Input id="med-date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="med-time">Time</Label>
              <Input id="med-time" type="time" {...register("time")} />
              {errors.time && (
                <p className="text-xs text-destructive">{errors.time.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="med-notes">Notes - Optional</Label>
            <Input
              id="med-notes"
              placeholder="e.g., taken with food"
              {...register("notes")}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging..." : "Log Medication"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
