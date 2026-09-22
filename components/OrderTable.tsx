"use client";

import Link from "next/link";
import { useState } from "react";

import { Search } from "lucide-react";

import OrderTableRow from "@/components/OrderTableRow";

import type { SerializedOrder } from "@/lib/orders";

import {
  orderStateLabels,
  orderStates,
  type OrderState,
} from "@/lib/order-state";

export default function OrderTable({
  orders,
  currentPage,
  totalPages,
  totalOrders,
}: {
  orders: SerializedOrder[];
  currentPage: number;
  totalPages: number;
  totalOrders: number;
}) {
  const [search, setSearch] = useState("");
  const [state, setState] =
    useState<OrderState | "ALL">("ALL");

  const query = search.trim().toLowerCase();

  const filteredOrders = orders.filter(
    (order) =>
      (state === "ALL" || order.status === state) &&
      [
        order.orderNumber,
        order.customerName,
        ...order.items.flatMap((item) => [
          item.productName,
          item.category,
        ]),
      ].some((value) =>
        value?.toLowerCase().includes(query),
      ),
  );

  return (
    <div className="space-y-4">
      {/* Search + State Filter */}
      <nav
        aria-label="Order filters"
        className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            aria-label="Search orders"
            placeholder="Search order, customer or product..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <label className="flex items-center gap-3 text-sm font-medium text-gray-600">
          State

          <select
            value={state}
            onChange={(event) =>
              setState(
                event.target.value as
                  | OrderState
                  | "ALL",
              )
            }
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">
              All states
            </option>

            {orderStates.map((value) => (
              <option
                key={value}
                value={value}
              >
                {orderStateLabels[value]}
              </option>
            ))}
          </select>
        </label>
      </nav>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-xl bg-white p-4 shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
       <caption
  className="pb-4 text-left text-gray-500"
  aria-live="polite"
>
  {filteredOrders.length} of {totalOrders} orders
</caption>

          <thead>
            <tr className="border-b border-gray-200 text-gray-700">
              {[
                "Order",
                "Customer",
                "Items",
                "Total",
                "Ordered at",
                "State",
                "Actions",
              ].map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 font-semibold"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <OrderTableRow
                key={order.id}
                order={order}
              />
            ))}

            {filteredOrders.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-gray-500"
                >
                  {orders.length === 0
                    ? "No orders yet."
                    : "No orders match your search and state filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2 border-t border-gray-100 pt-4">
            {/* Previous */}
            {currentPage > 1 ? (
              <Link
                href={`/orders?page=${currentPage - 1}`}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Previous
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-gray-100 px-3 py-2 text-sm font-medium text-gray-300">
                Previous
              </span>
            )}

            {/* Page Numbers */}
            {Array.from(
              { length: totalPages },
              (_, index) => index + 1,
            ).map((page) => (
              <Link
                key={page}
                href={`/orders?page=${page}`}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  page === currentPage
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {page}
              </Link>
            ))}

            {/* Next */}
            {currentPage < totalPages ? (
              <Link
                href={`/orders?page=${currentPage + 1}`}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Next
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-gray-100 px-3 py-2 text-sm font-medium text-gray-300">
                Next
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}