import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(100, "Product name must be less than 100 characters"),

  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),

  imageUrl: z
    .string()
    .optional()
    .or(z.literal("")),

  sku: z
    .string()
    .trim()
    .max(50, "SKU must be less than 50 characters")
    .optional()
    .or(z.literal("")),

  color: z
    .string()
    .trim()
    .max(50, "Color must be less than 50 characters")
    .optional()
    .or(z.literal("")),

  size: z
    .string()
    .trim()
    .max(20, "Size must be less than 20 characters")
    .optional()
    .or(z.literal("")),

  categoryId: z
  .string()
  .optional()
  .or(z.literal("")),

  costPrice: z
    .coerce
    .number()
    .min(0, "Cost price cannot be negative"),

  sellPrice: z
    .coerce
    .number()
    .min(0, "Sell price cannot be negative"),

  quantity: z
    .coerce
    .number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),

  lowStockAt: z
    .coerce
    .number()
    .int("Low stock level must be a whole number")
    .min(0, "Low stock level cannot be negative")
    .optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type ProductFormInput = z.input<typeof productSchema>;
