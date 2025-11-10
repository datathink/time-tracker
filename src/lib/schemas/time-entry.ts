import { z } from "zod";

// Validation schemas
export const timeEntrySchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  projectId: z.string().optional().nullable(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  description: z.string().min(10, "Description is required"),
});

export type TimeEntryFormData = z.infer<typeof timeEntrySchema>;
