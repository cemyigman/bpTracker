"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getReadingsRealtime } from "@/lib/firebase/firestore";
import type { BPReading } from "@/lib/types";

export function useReadings(startDate?: Date, endDate?: Date) {
  const { user } = useAuth();
  const [readings, setReadings] = useState<BPReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setReadings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = getReadingsRealtime(
      user.uid,
      (data) => {
        setReadings(data);
        setLoading(false);
      },
      startDate,
      endDate
    );

    return unsubscribe;
  }, [user, startDate?.getTime(), endDate?.getTime()]);

  return { readings, loading };
}
