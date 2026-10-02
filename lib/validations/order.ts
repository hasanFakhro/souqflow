import { z } from "zod";
import { orderStates } from "@/lib/order-state";

export const orderEditSchema = z.object({
  orderNumber: z.string().trim().min(1, "Order number is required").max(100),
  customerName: z.string().trim().max(200),
  orderedAt: z.iso.datetime(),
}).strict();

export const orderStateSchema = z.object({
  status: z.enum(orderStates),
  previousStatus: z.enum(orderStates),
}).strict();

export const orderRequestActionSchema = z.object({
  action: z.enum(["accept", "reject"]),
}).strict();
