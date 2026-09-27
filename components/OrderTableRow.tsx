"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, ChevronDown, Trash2 } from "lucide-react";
import EditOrderPopup from "@/components/EditOrderPopup";
import OrderItemsPopup from "@/components/OrderItemsPopup";
import { Price } from "@/app/(dashboard)/currency";
import type { SerializedOrder } from "@/lib/orders";
import { orderStateLabels, orderStateStyles, orderStateTransitions, type OrderState } from "@/lib/order-state";

const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });

export default function OrderTableRow({ order }: { order: SerializedOrder }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [refreshing, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const disabled = busy || refreshing;
  const transitions = orderStateTransitions[order.status];
  const total = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  async function downloadReceipt() {
    if (downloading) return;
    setDownloading(true);
    setError("");
    try {
      const { createOrderReceipt } = await import("@/lib/order-receipt");
      const response = await fetch("/api/exchangerate", { cache: "no-store" });
      if (!response.ok || response.redirected) throw new Error("Unable to load the exchange rate. Please try again.");
      const { usdToLbp } = await response.json();
      const receipt = createOrderReceipt(order, usdToLbp);
      const filename = order.orderNumber.replace(/[^a-zA-Z0-9_-]/g, "_") || "order";
      await receipt.save(`receipt-${filename}.pdf`, { returnPromise: true });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to download the receipt. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function mutate(method: "PATCH" | "DELETE", body?: object) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(order.id)}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (response.redirected) throw new Error("Your session expired. Refresh the page and sign in again.");
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to save changes.");
      startTransition(() => router.refresh());
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to save changes. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function changeState(status: OrderState) {
    void mutate("PATCH", { status, previousStatus: order.status });
  }

  return (
    <Fragment>
      <tr className="border-b border-gray-100 align-top hover:bg-gray-50/60" aria-busy={disabled}>
        <td className="max-w-36 break-words px-2 py-3 font-medium text-gray-900">
          {order.orderNumber}
        </td>
        <td className="max-w-36 break-words px-2 py-3 text-gray-600">
          {order.customerName || "Guest"}
        </td>
        <td className="min-w-24 px-2 py-3 text-gray-600">
          {order.items.length ? <OrderItemsPopup order={order} /> : "No items"}
        </td>
        <td className="whitespace-nowrap px-2 py-3 font-medium"><Price amountUsd={total} /></td>
        <td className="whitespace-nowrap px-2 py-3 text-gray-600">
          <time dateTime={order.orderedAt}>{date.format(new Date(order.orderedAt))}</time>
        </td>
        <td className="min-w-36 px-2 py-3">
          <div className="relative">
            <select
              aria-label={`State for order ${order.orderNumber}`}
              value={order.status}
              disabled={disabled || transitions.length === 0}
              title={transitions.length === 0 ? "This order is complete" : "Change order state"}
              onChange={(event) => changeState(event.target.value as OrderState)}
              className={`w-full cursor-pointer appearance-none rounded-lg border py-2 pl-3 pr-9 text-xs font-semibold outline-none focus:ring-2 disabled:cursor-default ${disabled ? "opacity-60" : ""} ${orderStateStyles[order.status]}`}
            >
              <option value={order.status}>{orderStateLabels[order.status]}</option>
              {transitions.map((status) => (
                <option key={status} value={status}>{orderStateLabels[status]}</option>
              ))}
            </select>
            <ChevronDown size={14} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </td>
        <td className="px-2 py-3">
            <div className="flex gap-1">
              <button
                type="button"
                disabled={disabled || downloading}
                aria-label={`Download PDF receipt for order ${order.orderNumber}`}
                title="Download PDF receipt"
                onClick={() => void downloadReceipt()}
                className="shrink-0 rounded-md p-2 text-green-600 transition hover:bg-green-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={18} aria-hidden="true" />
              </button>
              <EditOrderPopup order={order} disabled={disabled} />
              <button
                type="button"
                disabled={disabled}
                aria-label={`Delete order ${order.orderNumber}`}
                title="Delete order"
                onClick={() => {
                  if (window.confirm(`Delete order ${order.orderNumber} and its items? This cannot be undone.`)) void mutate("DELETE");
                }}
                className="shrink-0 rounded-md p-2 text-red-600 transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
        </td>
      </tr>
      {error && <tr><td colSpan={7} className="px-4 py-3 text-sm text-red-600" role="alert">{error}</td></tr>}
    </Fragment>
  );
}
