import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export const businessSchema = z.object({
  name: z
    .string()
    .min(1, "Business name is required")
    .max(100, "Business name is too long"),

  phone: z
    .string()
    .refine(
      (value) => isValidPhoneNumber(value),
      "Please enter a valid phone number",
    ),

  logo: z
    .string()
    .url("Please enter a valid logo URL")
    .or(z.literal(""))
    .optional(),
});

export type BusinessFormData = z.infer<typeof businessSchema>;