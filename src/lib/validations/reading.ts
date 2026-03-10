import { z } from "zod";

export const readingSchema = z.object({
  systolic: z.string().min(1, "Required").refine((v) => {
    const n = Number(v);
    return !isNaN(n) && n >= 60 && n <= 300;
  }, "Must be 60-300"),
  diastolic: z.string().min(1, "Required").refine((v) => {
    const n = Number(v);
    return !isNaN(n) && n >= 30 && n <= 200;
  }, "Must be 30-200"),
  pulse: z.string().optional().refine((v) => {
    if (!v) return true;
    const n = Number(v);
    return !isNaN(n) && n >= 30 && n <= 250;
  }, "Must be 30-250"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  notes: z.string().max(500).optional(),
  arm: z.enum(["left", "right"]).optional(),
  position: z.enum(["sitting", "standing", "lying"]).optional(),
});

export type ReadingFormValues = z.infer<typeof readingSchema>;
