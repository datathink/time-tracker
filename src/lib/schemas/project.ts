import { z } from "zod";

// Validation schemas
export const projectSchema = z.object({
    name: z.string().min(1, "Name is required"),
    clientId: z.string().optional().nullable(),
    description: z.string().optional(),
    budgetHours: z.number().optional(),
    status: z.enum(["active", "archived", "completed"]).default("active"),
    color: z.string().default("#6366f1"),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
