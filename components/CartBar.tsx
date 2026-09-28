"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { incrementQuantity, decrementQuantity, useCartStore, clearCart } from '@/stores/cartStore'
import { toast } from "sonner";

const CartBar = () => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const pendingClear = useRef(false);

    const items = useCartStore((state) => state.items);
    const [isOpen, setIsOpen] = useState(false);
    const hasItems = items.length > 0;

    const [mounted, setMounted] = useState(hasItems);
    const [snapshot, setSnapshot] = useState(items);

    useEffect(() => {
        if (hasItems) {
            setSnapshot(items);
            setMounted(true);
        } else {
            setIsOpen(false);
            const timeout = setTimeout(() => setMounted(false), 300);
            return () => clearTimeout(timeout);
        }
    }, [hasItems, items]);

    useEffect(() => {
        if (pendingClear.current && !isPending) {
            clearCart();
            pendingClear.current = false;
        }
    }, [isPending]);

    if (!mounted) return null;

    const displayItems = hasItems ? items : snapshot;
    const totalPrice = displayItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const totalQuantity = displayItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleCreateOrder = async () => {
        try {
            const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) });
            const result = await response.json();
            if (response.ok) {
                setIsOpen(false);
                toast.success(result.message);
                pendingClear.current = true;
                startTransition(() => {
                    router.refresh();
                });
            }
            else {
                toast.error(result.error || "Something went wrong");
            }

        } catch (error) {
            console.error('Couldnt send request: ' + error);
            toast.error("Couldn't reach the server");
        }
    }

    const handleClearCart = () => {
        clearCart();
        setIsOpen(false);
    }

    return (
        <div className={`fixed bottom-0 left-0 right-0 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] bg-white z-50 transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:bottom-auto lg:left-auto lg:right-auto lg:w-96 lg:shrink-0 lg:h-dvh lg:rounded-none lg:shadow-none lg:border-l lg:border-gray-100 lg:flex lg:flex-col lg:overflow-hidden ${
            hasItems ? "translate-y-0 lg:translate-x-0" : "translate-y-full lg:translate-y-0 lg:translate-x-full"
        }`}>
            <div className="w-full flex items-center justify-between px-5 py-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex-1 flex items-center gap-3 active:opacity-70 transition lg:cursor-default"
                >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold">
                        {totalQuantity}
                    </div>
                    <span className="text-base font-semibold text-gray-900">
                        ${totalPrice.toFixed(2)}
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
                        className="flex items-center gap-1 text-sm font-medium text-blue-600 lg:hidden"
                    >
                        {isOpen ? "Hide" : "View order"}
                        <span className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>⌃</span>
                    </button>
                </div>
            </div>

            <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out lg:grid-rows-[1fr] lg:flex-1 lg:min-h-0 ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
            >
                <div className="overflow-hidden flex flex-col min-h-0 max-h-[70dvh] lg:max-h-none lg:h-full">
                    <div className="px-5 pb-3 overflow-y-auto border-t border-gray-100 flex-1 min-h-0">
                        <ul className="divide-y divide-gray-100">
                            {displayItems.map(item => (
                                <li key={item.productId} className="flex items-center justify-between py-3.5">
                                    <div className="min-w-0 flex-1 pr-3">
                                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">${item.unitPrice.toFixed(2)} each</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <button
                                            onClick={() => decrementQuantity(item.productId)}
                                            className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
                                        >
                                            −
                                        </button>
                                        <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => incrementQuantity(item.productId)}
                                            disabled={item.quantity >= item.stock}
                                            className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition disabled:opacity-40"
                                        >+</button>
                                        <span className="text-sm font-semibold text-gray-900 w-14 text-right">
                                            ${(item.unitPrice * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="px-5 py-4 border-t border-gray-100 shrink-0">
                        <button
                            onClick={() => handleCreateOrder()}
                            disabled={isPending}
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-purple-700 active:scale-[0.98] transition disabled:opacity-50"
                        >
                            {isPending ? "Placing order…" : `Create Order · $${totalPrice.toFixed(2)}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartBar;