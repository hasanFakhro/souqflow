import { z } from "zod";

export const businessSchema = z.object({
  name: z
    .string()
    .min(1, "Business name is required")
    .max(50, "Business name is too long"),

  description: z
    .string()
    .max(500, "Description is too long")
    .optional(),

  instagram: z
    .string()
    .url("Please enter a valid Instagram URL")
    .optional()
    .or(z.literal("")),

  facebook: z
    .string()
    .url("Please enter a valid Facebook URL")
    .optional()
    .or(z.literal("")),

  tiktok: z
    .string()
    .url("Please enter a valid TikTok URL")
    .optional()
    .or(z.literal("")),
});

export type BusinessFormData = z.infer<typeof businessSchema>;