"use client";

import { useId, useRef } from "react";
import { Package, X } from "lucide-react";
import type { SerializedOrder } from "@/lib/orders";
import { Price } from "@/app/(dashboard)/currency";

export default function OrderItemsPopup({ order }: { order: SerializedOrder }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const total = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`View items for order ${order.orderNumber}`}
        onClick={() => dialog.current?.showModal()}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 font-medium text-blue-700 transition hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
      >
        <Package size={16} aria-hidden="true" />
        {quantity} {quantity === 1 ? "item" : "items"}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        className="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-0 text-gray-900 shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm"
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
            dialog.current?.close();
          }
        }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 p-5">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">Order items</h2>
            <p className="mt-1 text-sm text-gray-500">{order.orderNumber}</p>
          </div>
          <button type="button" aria-label="Close order items" onClick={() => dialog.current?.close()} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <ul className="divide-y divide-gray-100 px-5">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-4">
              <div>
                <p className="font-medium">{item.productName}</p>
                {item.category && <p className="mt-1 text-xs text-gray-500">{item.category}</p>}
                <p className="mt-2 text-sm text-gray-600">{item.quantity} × <Price amountUsd={item.unitPrice} /></p>
              </div>
              <span className="whitespace-nowrap font-semibold"><Price amountUsd={item.quantity * item.unitPrice} /></span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-gray-100 bg-gray-50 px-5 py-4 font-semibold">
          <span>Total</span>
          <span><Price amountUsd={total} /></span>
        </div>
      </dialog>
    </>
  );
}
