import type { OrderState } from "./order-state";

export const ordersPerPage = 10;
export const preloadedOrderPages = 5;
export type OrderSearchEntry = { id: string; status: OrderState; searchText: string };

export function filterOrderIndex(index: OrderSearchEntry[], search: string, state: OrderState | "ALL") {
  const query = search.trim().toLowerCase();
  return index.filter((order) => (state === "ALL" || order.status === state) && order.searchText.includes(query));
}

export function orderPage(total: number, requestedPage: number) {
  const totalPages = Math.ceil(total / ordersPerPage);
  const page = Math.min(Math.max(1, totalPages), Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1);
  const firstPageSize = total ? ((total - 1) % ordersPerPage) + 1 : 0;
  const offset = page === 1 ? 0 : firstPageSize + (page - 2) * ordersPerPage;
  return { page, totalPages, offset, size: page === 1 ? firstPageSize : ordersPerPage, firstPageSize };
}
