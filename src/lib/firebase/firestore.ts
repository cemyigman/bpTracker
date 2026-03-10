import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  setDoc,
  getDoc,
  type Unsubscribe,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import type { BPReading, Medication, UserProfile } from "../types";

// --- User Profile ---

export async function createUserProfile(
  userId: string,
  email: string,
  displayName?: string | null,
  photoURL?: string | null
): Promise<void> {
  const ref = doc(db, "users", userId);
  const existing = await getDoc(ref);
  if (existing.exists()) return;

  await setDoc(ref, {
    uid: userId,
    email,
    displayName: displayName || null,
    photoURL: photoURL || null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    settings: {
      theme: "system",
      defaultTimeRange: "week",
    },
  });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<void> {
  const ref = doc(db, "users", userId);
  await updateDoc(ref, { ...data, updatedAt: Timestamp.now() });
}

// Strip undefined values — Firestore rejects them
function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

// --- BP Readings ---

export async function addReading(
  userId: string,
  data: {
    systolic: number;
    diastolic: number;
    pulse?: number;
    measuredAt: Date;
    notes?: string;
    arm?: "left" | "right";
    position?: "sitting" | "standing" | "lying";
  }
): Promise<string> {
  const ref = collection(db, "users", userId, "bp_readings");
  const docRef = await addDoc(ref, stripUndefined({
    ...data,
    measuredAt: Timestamp.fromDate(data.measuredAt),
    createdAt: Timestamp.now(),
  }));
  return docRef.id;
}

export function getReadingsRealtime(
  userId: string,
  callback: (readings: BPReading[]) => void,
  startDate?: Date,
  endDate?: Date
): Unsubscribe {
  const ref = collection(db, "users", userId, "bp_readings");
  const constraints: QueryConstraint[] = [orderBy("measuredAt", "desc")];

  if (startDate) {
    constraints.push(where("measuredAt", ">=", Timestamp.fromDate(startDate)));
  }
  if (endDate) {
    constraints.push(where("measuredAt", "<=", Timestamp.fromDate(endDate)));
  }

  const q = query(ref, ...constraints);
  return onSnapshot(
    q,
    (snapshot) => {
      const readings: BPReading[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BPReading[];
      callback(readings);
    },
    (error) => {
      console.error("Readings listener error:", error);
      callback([]);
    }
  );
}

export async function updateReading(
  userId: string,
  readingId: string,
  data: Partial<Omit<BPReading, "id" | "createdAt">>
): Promise<void> {
  const ref = doc(db, "users", userId, "bp_readings", readingId);
  const updateData: Record<string, unknown> = { ...data };
  if (data.measuredAt && data.measuredAt instanceof Date) {
    updateData.measuredAt = Timestamp.fromDate(data.measuredAt as unknown as Date);
  }
  await updateDoc(ref, updateData);
}

export async function deleteReading(userId: string, readingId: string): Promise<void> {
  const ref = doc(db, "users", userId, "bp_readings", readingId);
  await deleteDoc(ref);
}

// --- Medications ---

export async function addMedication(
  userId: string,
  data: {
    name: string;
    dosage?: string;
    takenAt: Date;
    notes?: string;
    frequency?: "daily" | "twice_daily" | "weekly" | "as_needed";
  }
): Promise<string> {
  const ref = collection(db, "users", userId, "medications");
  const docRef = await addDoc(ref, stripUndefined({
    ...data,
    takenAt: Timestamp.fromDate(data.takenAt),
    createdAt: Timestamp.now(),
  }));
  return docRef.id;
}

export function getMedicationsRealtime(
  userId: string,
  callback: (medications: Medication[]) => void,
  startDate?: Date,
  endDate?: Date
): Unsubscribe {
  const ref = collection(db, "users", userId, "medications");
  const constraints: QueryConstraint[] = [orderBy("takenAt", "desc")];

  if (startDate) {
    constraints.push(where("takenAt", ">=", Timestamp.fromDate(startDate)));
  }
  if (endDate) {
    constraints.push(where("takenAt", "<=", Timestamp.fromDate(endDate)));
  }

  const q = query(ref, ...constraints);
  return onSnapshot(
    q,
    (snapshot) => {
      const medications: Medication[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Medication[];
      callback(medications);
    },
    (error) => {
      console.error("Medications listener error:", error);
      callback([]);
    }
  );
}

export async function updateMedication(
  userId: string,
  medId: string,
  data: Partial<Omit<Medication, "id" | "createdAt">>
): Promise<void> {
  const ref = doc(db, "users", userId, "medications", medId);
  const updateData: Record<string, unknown> = { ...data };
  if (data.takenAt && data.takenAt instanceof Date) {
    updateData.takenAt = Timestamp.fromDate(data.takenAt as unknown as Date);
  }
  await updateDoc(ref, updateData);
}

export async function deleteMedication(userId: string, medId: string): Promise<void> {
  const ref = doc(db, "users", userId, "medications", medId);
  await deleteDoc(ref);
}
