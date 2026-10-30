import { z } from "zod";
import { orderStates, paymentStates } from "@/lib/order-state";
import { isPossiblePhoneNumber } from "libphonenumber-js";

export const orderItemEditSchema = z.object({
  id: z.string().min(1).optional(),
  productId: z.string().min(1).nullable(),
  quantity: z.number().int().min(1).max(10000),
  unitPrice: z.number().finite().min(0).max(100000000),
}).strict();

export const orderEditSchema = z.object({
  orderNumber: z.string().trim().min(1, "Order number is required").max(100),
  customerName: z.string().trim().max(200),
  customerPhone: z.string().trim().max(40).refine((value) => !value || isPossiblePhoneNumber(value), "Enter a valid phone number").optional(),
  customerAddress: z.string().trim().max(500).optional(),
  items: z.array(orderItemEditSchema).min(1, "Add at least one item").max(100).optional(),
  orderedAt: z.iso.datetime(),
}).strict();

export const orderStateSchema = z.object({
  status: z.enum(orderStates),
  previousStatus: z.enum(orderStates),
}).strict();

export const orderRequestActionSchema = z.object({
  action: z.enum(["accept", "reject"]),
}).strict();

export const paymentStateSchema = z.object({
  paymentStatus: z.enum(paymentStates),
  previousPaymentStatus: z.enum(paymentStates),
}).strict();
