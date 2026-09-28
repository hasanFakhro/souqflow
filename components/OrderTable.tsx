"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import OrderTableRow from "@/components/OrderTableRow";
import { filterOrderIndex, orderPage, type OrderSearchEntry } from "@/lib/order-pagination";
import type { SerializedOrder } from "@/lib/orders";
import {
  orderStateLabels,
  orderStates,
  type OrderState,
} from "@/lib/order-state";

export default function OrderTable({
  initialOrders,
  index,
}: {
  initialOrders: SerializedOrder[];
  index: OrderSearchEntry[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const search = params.get("search") ?? "";
  const requestedState = params.get("state");

  const state = orderStates.includes(requestedState as OrderState)
    ? (requestedState as OrderState)
    : "ALL";

  const filters = { search, state };

  const [cache, setCache] = useState(
    () => new Map(initialOrders.map((order) => [order.id, order]))
  );

  const [attempt, setAttempt] = useState(0);

  const [failure, setFailure] = useState<{
    key: string;
    attempt: number;
    message: string;
  } | null>(null);

  const matches = useMemo(
    () => filterOrderIndex(index, search, state),
    [index, search, state]
  );

  const totalOrders = matches.length;

  const {
    page: currentPage,
    totalPages,
    offset,
    size,
  } = orderPage(totalOrders, Number(params.get("page")));

  const visibleIds = matches
    .slice(offset, offset + size)
    .map((entry) => entry.id);

  const missingKey = JSON.stringify(
    visibleIds.filter((id) => !cache.has(id))
  );

  const error =
    failure?.key === missingKey && failure.attempt === attempt
      ? failure.message
      : "";

  const pending = missingKey !== "[]" && !error;

  const orders = visibleIds.flatMap((id) => {
    const order = cache.get(id);
    return order ? [order] : [];
  });

  useEffect(() => {
    const ids: string[] = JSON.parse(missingKey);

    if (!ids.length) return;

    const controller = new AbortController();

    async function loadPage() {
      try {
        const query = new URLSearchParams();

        ids.forEach((id) => query.append("id", id));

        const response = await fetch(`/api/orders?${query}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (response.redirected) {
          throw new Error(
            "Your session expired. Refresh the page and sign in again."
          );
        }

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to load orders."
          );
        }

        const loaded: SerializedOrder[] = result.orders;

        if (
          !Array.isArray(loaded) ||
          ids.some(
            (id) =>
              !loaded.some((order) => order.id === id)
          )
        ) {
          throw new Error(
            "The orders list changed. Refresh and try again."
          );
        }

        if (controller.signal.aborted) return;

        setCache((previous) => {
          const next = new Map(previous);

          loaded.forEach((order) =>
            next.set(order.id, order)
          );

          return next;
        });
      } catch (cause) {
        if (!controller.signal.aborted) {
          setFailure({
            key: missingKey,
            attempt,
            message:
              cause instanceof Error
                ? cause.message
                : "Unable to load orders. Please try again.",
          });
        }
      }
    }

    void loadPage();

    return () => controller.abort();
  }, [missingKey, attempt]);

  function pageHref(
    page: number,
    values = { search, state }
  ) {
    const params = new URLSearchParams();

    if (values.search) {
      params.set("search", values.search);
    }

    if (values.state !== "ALL") {
      params.set("state", values.state);
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    return `/orders${params.size ? `?${params}` : ""}`;
  }

  function updateFilters(values: typeof filters) {
    window.history.replaceState(
      null,
      "",
      pageHref(1, values)
    );
  }

  function navigatePage(page: number) {
    window.history.pushState(
      null,
      "",
      pageHref(page)
    );
  }

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
            value={filters.search}
            onChange={(event) =>
              updateFilters({
                ...filters,
                search: event.target.value,
              })
            }
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <label className="flex items-center gap-3 text-sm font-medium text-gray-600">
          State

          <select
            value={filters.state}
            onChange={(event) =>
              updateFilters({
                ...filters,
                state: event.target.value as
                  | OrderState
                  | "ALL",
              })
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
      <div
        aria-busy={pending}
        className="min-w-0 overflow-x-auto rounded-xl bg-white p-3 shadow-sm"
      >
        <table className="w-full border-collapse text-left text-sm">
          <caption
            className="pb-4 text-left text-gray-500"
            aria-live="polite"
          >
            {pending
              ? "Updating orders..."
              : `${orders.length} of ${totalOrders} orders`}
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
                  className="whitespace-nowrap px-2 py-3 font-semibold"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {!pending &&
              !error &&
              orders.map((order) => (
                <OrderTableRow
                  key={order.id}
                  order={order}
                />
              ))}

            {pending && (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-gray-500"
                  role="status"
                >
                  Loading orders...
                </td>
              </tr>
            )}

            {error && (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center"
                >
                  <p
                    role="alert"
                    className="text-red-600"
                  >
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setAttempt(
                        (value) => value + 1
                      )
                    }
                    className="mt-3 rounded-lg px-3 py-2 text-blue-600 hover:bg-blue-50"
                  >
                    Retry
                  </button>

                  <button
                    type="button"
                    onClick={() => router.refresh()}
                    className="mt-3 rounded-lg px-3 py-2 text-blue-600 hover:bg-blue-50"
                  >
                    Refresh orders
                  </button>
                </td>
              </tr>
            )}

            {totalOrders === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-gray-500"
                >
                  {!search && state === "ALL"
                    ? "No orders yet."
                    : "No orders match your search and state filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            aria-label="Order pages"
            className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-gray-100 pt-4"
          >
            {/* Previous */}
            {currentPage > 1 ? (
              <button
                type="button"
                onClick={() =>
                  navigatePage(currentPage - 1)
                }
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Previous
              </button>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-gray-100 px-3 py-2 text-sm font-medium text-gray-300">
                Previous
              </span>
            )}

            {/* Page Numbers */}
            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                type="button"
                key={page}
                onClick={() => {
                  if (page !== currentPage) {
                    navigatePage(page);
                  }
                }}
                aria-current={
                  page === currentPage
                    ? "page"
                    : undefined
                }
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  page === currentPage
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            {currentPage < totalPages ? (
              <button
                type="button"
                onClick={() =>
                  navigatePage(currentPage + 1)
                }
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Next
              </button>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-gray-100 px-3 py-2 text-sm font-medium text-gray-300">
                Next
              </span>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}