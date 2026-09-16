"use client";

import { useState } from "react";
import { incrementQuantity, decrementQuantity, useCartStore, clearCart } from '@/stores/cartStore'
import {toast} from "sonner";

const CartBar = () => {
    const items = useCartStore((state) => state.items);
    const [isOpen, setIsOpen] = useState(false);

    if (items.length === 0) return null;

    const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    const handleCreateOrder = async () => {
        try {
            const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({items}) });
            const result = await response.json();
            if(response.ok){
                setIsOpen(false);
                clearCart();
                toast.success(result.message);
            }
            else{
                toast.error(result.error || "Something went wrong");
            }

        } catch (error) {
            console.error('Couldnt send request: '+ error);
        }
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] rounded-t-2xl">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-5 py-4 active:bg-gray-50 transition"
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-xs font-semibold">
                        {totalQuantity}
                    </div>
                    <span className="text-base font-semibold text-gray-900">
                        ${totalPrice.toFixed(2)}
                    </span>
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-primary">
                    {isOpen ? "Hide" : "View order"}
                    <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>⌃</span>
                </span>
            </button>

            {isOpen && (
                <div className="px-5 pb-5 max-h-[55vh] overflow-y-auto border-t border-gray-100">
                    <ul className="divide-y divide-gray-100">
                        {items.map(item => (
                            <li key={item.productId} className="flex items-center justify-between py-3.5">
                                <div className="min-w-0 flex-1 pr-3">
                                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">${item.price.toFixed(2)} each</p>
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
                                        className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
                                    >
                                        +
                                    </button>
                                    <span className="text-sm font-semibold text-gray-900 w-14 text-right">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => handleCreateOrder()}>Create Order</button>
                </div>
            )}
        </div>
    )
}

export default CartBar