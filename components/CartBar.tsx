/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Price } from "@/app/(dashboard)/currency";

import { useEffect, useRef, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import {
  incrementQuantity,
  decrementQuantity,
  useCartStore,
  clearCart,
} from "@/stores/cartStore";

import { toast } from "sonner";
import OrderDetailsDialog from "./OrderDetailsDialog"; // adjust path if needed

const CartBar = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pendingClear = useRef(false);

  const items = useCartStore((state) => state.items);
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [snapshot, setSnapshot] = useState<typeof items>([]);
  const hasItems = items.length > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep a copy of the last non-empty cart so the bar can slide out
  useEffect(() => {
    if (hasItems) setSnapshot(items);
  }, [hasItems, items]);

  useEffect(() => {
    if (pendingClear.current && !isPending) {
      clearCart();
      pendingClear.current = false;
    }
  }, [isPending]);

  if (!mounted) return null;

  const displayItems = hasItems ? items : snapshot;

  const totalPrice = displayItems.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0,
  );
  const totalQuantity = displayItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  const handleCreateOrder = async (
    customerName: string,
    customerAddress: string,
    customerPhone: string,
  ) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerName,
          customerAddress,
          customerPhone,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        window.dispatchEvent(new Event("notification-created"));

        setIsDialogOpen(false);
        setIsOpen(false);
        toast.success(result.message);

        pendingClear.current = true;
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Couldn't send request: " + error);
      toast.error("Couldn't reach the server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearCart = () => {
    clearCart();
    setIsOpen(false);
  };

  return (
    <>
      <div
        inert={!hasItems}
        className={`fixed bottom-0 left-0 right-0 md:left-64 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] bg-white z-50 md:z-20 md:rounded-none md:shadow-none md:border-t md:border-gray-200 pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-out ${
          hasItems ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="w-full flex items-center justify-between px-5 py-4 md:px-10">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="dashboard-order-details"
            aria-label={isOpen ? "Hide order details" : "View order details"}
            className="flex-1 flex items-center gap-3 active:opacity-70 transition"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold">
              {totalQuantity}
            </div>
            <span className="text-base font-semibold text-gray-900">
              <Price amountUsd={totalPrice} />
            </span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClearCart}
              className="text-sm font-medium text-gray-400 hover:text-red-600 transition"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="dashboard-order-details"
              className="flex items-center gap-1 text-sm font-medium text-blue-600"
            >
              {isOpen ? "Hide" : "View order"}
              <span
                className={`transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                ⌃
              </span>
            </button>
          </div>
        </div>

        <div
          id="dashboard-order-details"
          inert={!isOpen}
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden flex flex-col min-h-0 max-h-[70dvh]">
            <div className="px-5 md:px-10 pb-3 overflow-y-auto border-t border-gray-100 flex-1 min-h-0">
              <ul className="divide-y divide-gray-100">
                {displayItems.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-center justify-between py-3.5"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        <Price amountUsd={item.unitPrice} /> each
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => decrementQuantity(item.productId)}
                        className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => incrementQuantity(item.productId)}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition disabled:opacity-40"
                      >
                        +
                      </button>
                      <span className="text-sm font-semibold text-gray-900 w-14 text-right">
                        <Price amountUsd={item.unitPrice * item.quantity} />
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-5 md:px-10 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setIsDialogOpen(true)}
                disabled={isPending}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-purple-700 active:scale-[0.98] transition disabled:opacity-50"
              >
                {isPending ? (
                  "Placing order…"
                ) : (
                  <>
                    Create Order · <Price amountUsd={totalPrice} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <OrderDetailsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleCreateOrder}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default CartBar;