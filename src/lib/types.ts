import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings: {
    theme: "light" | "dark" | "system";
    defaultTimeRange: "week" | "month" | "year";
  };
}

export interface BPReading {
  id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  measuredAt: Timestamp;
  createdAt: Timestamp;
  notes?: string;
  arm?: "left" | "right";
  position?: "sitting" | "standing" | "lying";
}

export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  takenAt: Timestamp;
  createdAt: Timestamp;
  notes?: string;
  frequency?: "daily" | "twice_daily" | "weekly" | "as_needed";
}

export type BPCategory = "normal" | "elevated" | "high_stage1" | "high_stage2" | "crisis";

export type TimeRange = "day" | "week" | "month" | "year";
