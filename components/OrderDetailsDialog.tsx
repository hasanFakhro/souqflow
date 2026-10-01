"use client";

import { useState } from "react";

interface OrderDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (customerName: string, customerAddress: string, customerPhone: string) => void;
    isSubmitting?: boolean;
}

const OrderDetailsDialog = ({
    isOpen,
    onClose,
    onConfirm,
    isSubmitting = false,
}: OrderDetailsDialogProps) => {
    const [customerName, setCustomerName] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    if (!isOpen) return null;
    const phoneRegex = /^\+?[0-9\s-]{7,15}$/;
    const isPhoneValid = phoneRegex.test(customerPhone.trim());
    const isValid =
        customerName.trim().length > 0 &&
        customerAddress.trim().length > 0 &&
        isPhoneValid;

    const handleConfirm = () => {
        if (!isValid) return;
        onConfirm(customerName.trim(), customerAddress.trim(), customerPhone.trim());
    };

    return (
        <>
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/40 z-[70] transition-opacity duration-200"
            />
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-5 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-900">Customer details</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Required to place this order.
                    </p>

                    <div className="mt-4 space-y-3">
                        <div>
                            <label className="text-xs font-medium text-gray-600" htmlFor="customer-name">
                                Name
                            </label>
                            <input
                                id="customer-name"
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Customer name"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-600" htmlFor="customer-address">
                                Address
                            </label>
                            <input
                                id="customer-address"
                                type="text"
                                value={customerAddress}
                                onChange={(e) => setCustomerAddress(e.target.value)}
                                placeholder="Delivery address"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-600" htmlFor="customer-phone">
                                Phone
                            </label>
                            <input
                                id="customer-phone"
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="+961 70 123 456"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!isValid || isSubmitting}
                            className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50"
                        >
                            {isSubmitting ? "Placing…" : "Confirm order"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderDetailsDialog;