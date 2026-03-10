import { z } from "zod";

export const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required").max(200),
  dosage: z.string().max(100).optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  notes: z.string().max(500).optional(),
  frequency: z.enum(["daily", "twice_daily", "weekly", "as_needed"]).optional(),
});

export type MedicationFormValues = z.infer<typeof medicationSchema>;
