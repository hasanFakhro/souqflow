import { z } from "zod";
import { isPossiblePhoneNumber } from "libphonenumber-js";

export const customerSchema = z.object({
  customerName: z.string().trim().min(1, "Customer name is required").max(100),
  customerAddress: z.string().trim().min(1, "Customer address is required").max(255),
  customerPhone: z.string().trim().max(40).refine(isPossiblePhoneNumber, "Enter a valid international phone number"),
});
