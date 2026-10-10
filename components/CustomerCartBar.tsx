"use client";

import OrderDetailsDialog from "./OrderDetailsDialog";
import { useEffect, useState } from "react";
import { clearCart, decrementQuantity, incrementQuantity, useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
interface CustomerCartBarProps {
    isOpen: boolean;
    onClose: () => void;
    sellerId:string;
}

const CustomerCartBar = ({ isOpen, onClose, sellerId }: CustomerCartBarProps) => {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const cartScope = `catalog:${sellerId}`;
    const items = useCartStore((state) => state.items, cartScope);
    const handleOrder = async (customerName: string, customerAddress: string, customerPhone: string) => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const response = await fetch(`/api/catalog/${sellerId}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items, customerName, customerAddress, customerPhone }),
            });
            const result = await response.json();
            if (response.ok) {
                setDetailsOpen(false);
                clearCart(cartScope);
                onClose();
                toast.success(result.message);
            }
            else {
                toast.error(result.error || "Something went wrong");
            }
        } catch (error) {
            console.error('Couldnt send request: ' + error);
            toast.error("Couldn't reach the server");
        } finally { setSubmitting(false); }
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    return (
        <>
            <OrderDetailsDialog isOpen={detailsOpen} onClose={() => { if (!submitting) setDetailsOpen(false); }} onConfirm={handleOrder} isSubmitting={submitting} />
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
            />

            <div inert={!isOpen} className={`fixed bottom-0 left-0 right-0 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] bg-white z-50 transition-transform duration-300 ease-out pb-[env(safe-area-inset-bottom)] lg:top-0 lg:bottom-0 lg:left-auto lg:right-0 lg:w-96 lg:rounded-none lg:shadow-2xl lg:border-l lg:border-gray-100 lg:flex lg:flex-col lg:overflow-hidden lg:pb-0 ${isOpen ? "translate-y-0 lg:translate-x-0" : "translate-y-full lg:translate-x-full lg:translate-y-0"
                }`}>
                <div className="w-full flex items-center justify-between px-5 py-4">
                    <button
                        className="flex-1 flex items-center gap-3 active:opacity-70 transition lg:cursor-default"
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold">
                            {items.reduce((acc, item) => acc + item.quantity, 0)}
                        </div>
                        <span className="text-base font-semibold text-gray-900">
                            ${items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0).toFixed(2)}
                        </span>
                    </button>

                    <div className="flex items-center gap-3">
                        <button onClick={() => clearCart(cartScope)} className="text-sm font-medium text-gray-400 hover:text-red-600 transition">
                            Clear
                        </button>
                        <button onClick={onClose} className="flex items-center justify-center w-9 h-9 -mr-1 rounded-full text-blue-600 hover:bg-gray-50">
                            <span className="transition-transform duration-300">⌃</span>
                        </button>
                    </div>
                </div>

                <div className="grid transition-[grid-template-rows] duration-300 ease-in-out lg:grid-rows-[1fr] lg:flex-1 lg:min-h-0">
                    <div className="overflow-hidden flex flex-col min-h-0 max-h-[70dvh] lg:max-h-none lg:h-full">
                        <div className="px-5 pb-3 overflow-y-auto border-t border-gray-100 flex-1 min-h-0">
                            <ul className="divide-y divide-gray-100">
                                {items.map(item => <li key={item.productId} className="flex items-center justify-between py-3.5">
                                    <div className="min-w-0 flex-1 pr-3">
                                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">${item.unitPrice.toFixed(2)} each</p>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                        <button className="w-9 h-9 sm:w-7 sm:h-7 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition" onClick={() => decrementQuantity(item.productId, cartScope)}>
                                            -
                                        </button>
                                        <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                                        <button className="w-9 h-9 sm:w-7 sm:h-7 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition disabled:opacity-40" onClick={() => incrementQuantity(item.productId, { allowBeyondStock: true, scope: cartScope })}>
                                            +
                                        </button>
                                        <span className="text-sm font-semibold text-gray-900 w-14 text-right">
                                            ${(item.unitPrice * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </li>)}
                            </ul>
                        </div>

                        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
                            <button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-purple-700 active:scale-[0.98] transition disabled:opacity-50" disabled={submitting || !items.length} onClick={() => setDetailsOpen(true)}>
                                Order now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CustomerCartBar;