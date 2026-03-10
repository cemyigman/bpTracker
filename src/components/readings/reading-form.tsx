"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { addReading } from "@/lib/firebase/firestore";
import { readingSchema, type ReadingFormValues } from "@/lib/validations/reading";
import { getBPCategory, BP_CATEGORY_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReadingForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ReadingFormValues>({
    resolver: zodResolver(readingSchema),
    defaultValues: {
      date: format(now, "yyyy-MM-dd"),
      time: format(now, "HH:mm"),
      systolic: "",
      diastolic: "",
    },
  });

  const systolicValue = watch("systolic");
  const diastolicValue = watch("diastolic");
  const sysNum = Number(systolicValue);
  const diaNum = Number(diastolicValue);
  const showCategory = systolicValue && diastolicValue && sysNum >= 60 && diaNum >= 30;

  async function onSubmit(data: ReadingFormValues) {
    if (!user) return;
    setLoading(true);
    try {
      const measuredAt = new Date(`${data.date}T${data.time}`);
      await addReading(user.uid, {
        systolic: Number(data.systolic),
        diastolic: Number(data.diastolic),
        pulse: data.pulse ? Number(data.pulse) : undefined,
        measuredAt,
        notes: data.notes || undefined,
        arm: data.arm || undefined,
        position: data.position || undefined,
      });
      toast.success("Reading added");
      reset({
        date: format(new Date(), "yyyy-MM-dd"),
        time: format(new Date(), "HH:mm"),
        systolic: "",
        diastolic: "",
      });
      onSuccess?.();
    } catch (err) {
      console.error("Reading add error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg.includes("Missing or insufficient permissions")) {
        toast.error("Firestore permissions denied. Set your database to test mode in Firebase Console.");
      } else if (msg.includes("offline")) {
        toast.error("Cannot reach Firestore. Make sure you created a database in Firebase Console > Firestore Database.");
      } else {
        toast.error(`Failed to add reading: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Blood Pressure Reading</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="systolic">Systolic (mmHg)</Label>
              <Input
                id="systolic"
                type="number"
                placeholder="120"
                {...register("systolic")}
              />
              {errors.systolic && (
                <p className="text-xs text-destructive">{errors.systolic.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
              <Input
                id="diastolic"
                type="number"
                placeholder="80"
                {...register("diastolic")}
              />
              {errors.diastolic && (
                <p className="text-xs text-destructive">{errors.diastolic.message}</p>
              )}
            </div>
          </div>

          {showCategory && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Category:</span>
              <span
                className={`text-sm font-medium px-2 py-0.5 rounded ${
                  BP_CATEGORY_CONFIG[getBPCategory(sysNum, diaNum)].bgClass
                }`}
              >
                {BP_CATEGORY_CONFIG[getBPCategory(sysNum, diaNum)].label}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" {...register("time")} />
              {errors.time && (
                <p className="text-xs text-destructive">{errors.time.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pulse">Pulse (BPM) - Optional</Label>
            <Input
              id="pulse"
              type="number"
              placeholder="72"
              {...register("pulse")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes - Optional</Label>
            <Input
              id="notes"
              placeholder="e.g., after exercise"
              {...register("notes")}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Reading"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
