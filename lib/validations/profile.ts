import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const profileSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name is too long"),

    email: z
      .string()
      .email("Please enter a valid email"),

    phone: z
      .string()
      .refine(
        (phone) => isValidPhoneNumber(phone),
        "Please enter a valid phone number"
      ),

    image: z
      .string()
      .refine((value) => !value || /^\/[a-zA-Z0-9/_-]+\.(png|jpg|jpeg|webp|gif)$/.test(value) || /^https?:\/\//.test(value), "Invalid profile image")
      .optional()
      .or(z.literal("")),

    currentPassword: z
      .string()
      .optional(),

    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional()
      .or(z.literal("")),

    confirmPassword: z
      .string()
      .optional(),
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export type ProfileFormData = z.infer<typeof profileSchema>;