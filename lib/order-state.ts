export const orderStates = ["PENDING", "DELIVERING", "DONE", "PROBLEM"] as const;

export type OrderState = (typeof orderStates)[number];

export const orderStateLabels: Record<OrderState, string> = {
  PENDING: "Pending",
  DELIVERING: "Delivering",
  DONE: "Done",
  PROBLEM: "Problem occurred",
};

export const orderStateTransitions: Record<OrderState, readonly OrderState[]> = {
  PENDING: ["DELIVERING", "PROBLEM"],
  DELIVERING: ["DONE", "PROBLEM"],
  DONE: [],
  PROBLEM: ["PENDING", "DELIVERING"],
};

export const orderStateStyles: Record<OrderState, string> = {
  PENDING: "border-amber-300 bg-amber-50 text-amber-800 focus:ring-amber-200",
  DELIVERING: "border-green-300 bg-green-50 text-green-700 focus:ring-green-200",
  DONE: "border-blue-200 bg-blue-50 text-blue-700 focus:ring-blue-200",
  PROBLEM: "border-red-300 bg-red-50 text-red-700 focus:ring-red-200",
};
