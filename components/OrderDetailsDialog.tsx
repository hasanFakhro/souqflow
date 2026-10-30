"use client";

import { useEffect, useId, useRef, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { customerSchema } from "@/lib/validations/customer";

interface OrderDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (customerName: string, customerAddress: string, customerPhone: string) => void;
    isSubmitting?: boolean;
}

export default function OrderDetailsDialog({ isOpen, onClose, onConfirm, isSubmitting = false }: OrderDetailsDialogProps) {
    const dialog = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const [customerName, setCustomerName] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const customer = customerSchema.safeParse({ customerName, customerAddress, customerPhone });
    const inputClass = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    useEffect(() => {
        if (isOpen) dialog.current?.showModal();
        else dialog.current?.close();
    }, [isOpen]);

    return <dialog ref={dialog} aria-labelledby={titleId} aria-busy={isSubmitting}
        onCancel={(event) => { if (isSubmitting) event.preventDefault(); }}
        onClose={onClose}
        onClick={(event) => {
            if (isSubmitting || event.target !== event.currentTarget) return;
            const bounds = event.currentTarget.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-sm max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-xl backdrop:bg-slate-900/40">
        <form onSubmit={(event) => {
            event.preventDefault();
            if (isSubmitting || !customer.success) return;
            onConfirm(customer.data.customerName, customer.data.customerAddress, customer.data.customerPhone);
        }}>
            <h2 id={titleId} className="text-lg font-semibold">Customer details</h2>
            <p className="mt-1 text-sm text-gray-500">Required to place this order.</p>
            <fieldset disabled={isSubmitting} className="mt-4 space-y-3">
                <label className="block text-xs font-medium text-gray-600">
                    Name
                    <input type="text" autoComplete="name" required maxLength={100} value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Customer name" className={inputClass} />
                </label>
                <label className="block text-xs font-medium text-gray-600">
                    Address
                    <textarea autoComplete="street-address" required maxLength={255} rows={2} value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} placeholder="Delivery address" className={inputClass} />
                </label>
                <label className="block text-xs font-medium text-gray-600">
                    Phone
                    <PhoneInput international defaultCountry="LB" autoComplete="tel" required value={customerPhone} onChange={(value) => setCustomerPhone(value ?? "")} placeholder="Enter phone number" className={`${inputClass} [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:outline-none`} />
                </label>
            </fieldset>
            <div className="mt-5 flex items-center gap-3">
                <button type="button" disabled={isSubmitting} onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={!customer.success || isSubmitting} className="btn-primary flex-1">{isSubmitting ? "Placing..." : "Confirm order"}</button>
            </div>
        </form>
    </dialog>;
}
