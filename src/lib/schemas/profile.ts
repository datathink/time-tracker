import { z } from "zod";

// Validation schemas
export const profileSchema = z.object({
    phoneNumber: z.string().min(8, "Phone number is required"),
    address: z.string().min(10, "Address is required"),
    birthDate: z.string().refine((value) => !isNaN(Date.parse(value)), {
        message: "Invalid date",
    }),
});

export type ProfileFormData = z.infer<typeof profileSchema>;