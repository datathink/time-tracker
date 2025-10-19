import { z } from "zod";

// Validation schemas
export const projectSchema = z.object({
    name: z.string().min(1, "Name is required"),
    clientId: z.string().optional().nullable(),
    description: z.string().optional(),
    budgetHours: z
        .string()
        .optional()
        .transform((val) => {
            if (!val || val === "") return null;
            const parsed = parseFloat(val);
            return isNaN(parsed) ? null : parsed;
        }),
    hourlyRate: z
        .string()
        .optional()
        .transform((val) => {
            if (!val || val === "") return null;
            const parsed = parseFloat(val);
            return isNaN(parsed) ? null : parsed;
        }),
    status: z.enum(["active", "archived", "completed"]).default("active"),
    color: z.string().default("#6366f1"),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
