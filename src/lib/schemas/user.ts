import { z } from "zod";

// Validation schemas
export const usernameSchema = z.object({
    fullName: z.string().min(3, "Full name is required"),
});

export type UsernameUpdateData = z.infer<typeof usernameSchema>;