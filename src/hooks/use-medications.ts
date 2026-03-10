"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getMedicationsRealtime } from "@/lib/firebase/firestore";
import type { Medication } from "@/lib/types";

export function useMedications(startDate?: Date, endDate?: Date) {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMedications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = getMedicationsRealtime(
      user.uid,
      (data) => {
        setMedications(data);
        setLoading(false);
      },
      startDate,
      endDate
    );

    return unsubscribe;
  }, [user, startDate?.getTime(), endDate?.getTime()]);

  return { medications, loading };
}
