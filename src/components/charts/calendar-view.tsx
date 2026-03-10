"use client";

import { useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  addMonths,
  subMonths,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Pill } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { getBPCategory, BP_CATEGORY_CONFIG } from "@/lib/constants";
import type { BPReading, Medication } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BPCategoryBadge } from "@/components/readings/bp-category-badge";

function toDate(ts: Timestamp | Date): Date {
  return ts instanceof Timestamp ? ts.toDate() : ts;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView({
  readings,
  medications,
}: {
  readings: BPReading[];
  medications: Medication[];
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startPadding = getDay(days[0]);

  const readingsByDay = useMemo(() => {
    const map = new Map<string, BPReading[]>();
    readings.forEach((r) => {
      const key = format(toDate(r.measuredAt), "yyyy-MM-dd");
      const arr = map.get(key) || [];
      arr.push(r);
      map.set(key, arr);
    });
    return map;
  }, [readings]);

  const medsByDay = useMemo(() => {
    const map = new Map<string, Medication[]>();
    medications.forEach((m) => {
      const key = format(toDate(m.takenAt), "yyyy-MM-dd");
      const arr = map.get(key) || [];
      arr.push(m);
      map.set(key, arr);
    });
    return map;
  }, [medications]);

  const selectedDayReadings = selectedDay
    ? readingsByDay.get(format(selectedDay, "yyyy-MM-dd")) || []
    : [];
  const selectedDayMeds = selectedDay
    ? medsByDay.get(format(selectedDay, "yyyy-MM-dd")) || []
    : [];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">{format(currentMonth, "MMMM yyyy")}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: startPadding }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayReadings = readingsByDay.get(key) || [];
              const dayMeds = medsByDay.get(key) || [];
              const hasData = dayReadings.length > 0 || dayMeds.length > 0;
              const isToday = isSameDay(day, new Date());

              const avgSys = dayReadings.length
                ? Math.round(dayReadings.reduce((s, r) => s + r.systolic, 0) / dayReadings.length)
                : null;
              const avgDia = dayReadings.length
                ? Math.round(dayReadings.reduce((s, r) => s + r.diastolic, 0) / dayReadings.length)
                : null;

              const category = avgSys && avgDia ? getBPCategory(avgSys, avgDia) : null;

              return (
                <button
                  key={key}
                  className={`relative flex flex-col items-center gap-0.5 rounded-md p-1.5 text-sm transition-colors hover:bg-accent ${
                    isToday ? "ring-1 ring-primary" : ""
                  } ${hasData ? "cursor-pointer" : "cursor-default"}`}
                  onClick={() => hasData && setSelectedDay(day)}
                >
                  <span className={isToday ? "font-bold" : ""}>{format(day, "d")}</span>
                  <div className="flex items-center gap-0.5">
                    {category && (
                      <div
                        className={`h-2 w-2 rounded-full ${BP_CATEGORY_CONFIG[category].dotClass}`}
                      />
                    )}
                    {dayMeds.length > 0 && (
                      <Pill className="h-2.5 w-2.5 text-primary" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDay && format(selectedDay, "MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDayReadings.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Blood Pressure Readings</h4>
                <div className="space-y-2">
                  {selectedDayReadings.map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-sm">
                      <span>
                        {r.systolic}/{r.diastolic} mmHg
                        {r.pulse && ` | ${r.pulse} BPM`}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {format(toDate(r.measuredAt), "h:mm a")}
                        </span>
                        <BPCategoryBadge systolic={r.systolic} diastolic={r.diastolic} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedDayMeds.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Medications</h4>
                <div className="space-y-2">
                  {selectedDayMeds.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-sm">
                      <span>
                        {m.name}
                        {m.dosage && ` (${m.dosage})`}
                      </span>
                      <span className="text-muted-foreground">
                        {format(toDate(m.takenAt), "h:mm a")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
