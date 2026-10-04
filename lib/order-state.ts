export const orderStates = ["PENDING", "DELIVERING", "DONE", "PROBLEM"] as const;

export type OrderState = (typeof orderStates)[number];

export const orderStateLabels: Record<OrderState, string> = {
  PENDING: "Pending",
  DELIVERING: "Delivering",
  DONE: "Done",
  PROBLEM: "Canceled",
};

export const paymentStates = ["UNPAID", "PAID", "REFUNDED"] as const;
export const paymentStateLabels = { UNPAID: "Unpaid", PAID: "Paid", REFUNDED: "Refunded" };
