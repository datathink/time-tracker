import { z } from "zod";

// Validation schemas
export const clientSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    company: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
