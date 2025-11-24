import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";

// Validation schemas
export const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  clientId: z.string().min(5, "Client is required"),
  description: z.string().optional(),
  budgetAmount: z.union([z.number(), z.instanceof(Decimal)]).nullable(),
  status: z.enum(["active", "archived", "completed"]).default("active"),
  color: z.string().default("#6366f1"),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
