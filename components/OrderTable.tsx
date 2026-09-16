"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import OrderTableRow from "@/components/OrderTableRow";
import type { SerializedOrder } from "@/lib/orders";
import { orderStateLabels, orderStates, type OrderState } from "@/lib/order-state";

export default function OrderTable({ orders }: { orders: SerializedOrder[] }) {
  const [search, setSearch] = useState("");
  const [state, setState] = useState<OrderState | "ALL">("ALL");
  const query = search.trim().toLowerCase();
  const filteredOrders = orders.filter((order) =>
    (state === "ALL" || order.status === state) &&
    [order.orderNumber, order.customerName, ...order.items.flatMap((item) => [item.productName, item.category])]
      .some((value) => value?.toLowerCase().includes(query)),
  );

  return (
    <div className="space-y-4">
      <nav aria-label="Order filters" className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search aria-hidden="true" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="search" aria-label="Search orders" placeholder="Search order, customer or product..." value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </div>
        <label className="flex items-center gap-3 text-sm font-medium text-gray-600">
          State
          <select value={state} onChange={(event) => setState(event.target.value as OrderState | "ALL")} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-blue-100">
            <option value="ALL">All states</option>
            {orderStates.map((value) => <option key={value} value={value}>{orderStateLabels[value]}</option>)}
          </select>
        </label>
      </nav>
      <div className="overflow-x-auto rounded-xl bg-white p-4 shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="pb-4 text-left text-gray-500" aria-live="polite">{filteredOrders.length} of {orders.length} orders</caption>
          <thead>
            <tr className="border-b border-gray-200 text-gray-700">
              {["Order", "Customer", "Items", "Total", "Ordered at", "State", "Actions"].map((column) => <th key={column} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => <OrderTableRow key={order.id} order={order} />)}
            {filteredOrders.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-500">{orders.length === 0 ? "No orders yet." : "No orders match your search and state filter."}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
