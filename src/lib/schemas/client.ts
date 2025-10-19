import { z } from "zod";

// Validation schemas
export const clientSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    company: z.string().optional(),
    hourlyRate: z
        .string()
        .optional()
        .transform((val) => {
            if (!val || val === "") return null;
            const parsed = parseFloat(val);
            return isNaN(parsed) ? null : parsed;
        }),
});

export type ClientFormData = z.infer<typeof clientSchema>;
