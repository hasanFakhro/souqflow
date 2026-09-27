"use client";

import { useId, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import type { SerializedOrder } from "@/lib/orders";

const inputStyle = "mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 disabled:opacity-60";

export default function EditOrderPopup({ order, disabled }: { order: SerializedOrder; disabled: boolean }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const titleId = useId();
  const phoneId = useId();
  const [customerPhone, setCustomerPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [open, setOpen] = useState(false);
  const phoneInvalid = phoneTouched && customerPhone !== "" && !isValidPhoneNumber(customerPhone);
  const [saving, setSaving] = useState(false);
  const [refreshing, startTransition] = useTransition();
  const [error, setError] = useState("");
  const busy = saving || refreshing;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    const values = new FormData(event.currentTarget);
    const orderedAt = new Date(`${values.get("orderedAt")}${order.orderedAt.slice(10)}`);
    if (Number.isNaN(orderedAt.getTime())) {
      setError("Enter a valid order date.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(order.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: values.get("orderNumber"),
          customerName: values.get("customerName"),
          orderedAt: orderedAt.toISOString(),
        }),
      });
      if (response.redirected) throw new Error("Your session expired. Refresh the page and sign in again.");
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to save changes.");
      dialog.current?.close();
      startTransition(() => router.refresh());
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled || busy}
        aria-label={`Edit order ${order.orderNumber}`}
        aria-haspopup="dialog"
        title="Edit order"
        onClick={() => {
          setError("");
          setCustomerPhone("");
          setPhoneTouched(false);
          setOpen(true);
          form.current?.reset();
          dialog.current?.showModal();
        }}
        className="shrink-0 rounded-md p-2 text-blue-600 transition hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Pencil size={18} aria-hidden="true" />
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        aria-busy={busy}
        onClose={() => setOpen(false)}
        onCancel={(event) => { if (busy) event.preventDefault(); }}
        onClick={(event) => {
          if (busy || event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current?.close();
        }}
        className="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-0 text-gray-900 shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 p-5">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">Edit order</h2>
            <p className="mt-1 text-sm text-gray-500">{order.orderNumber}</p>
          </div>
          <button type="button" aria-label="Close edit order" disabled={busy} onClick={() => dialog.current?.close()} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <form ref={form} onSubmit={save} className="space-y-5 p-5">
          <label className="block text-sm font-medium">
            Order number
            <input name="orderNumber" defaultValue={order.orderNumber} required maxLength={100} disabled={busy} className={inputStyle} />
          </label>
          <label className="block text-sm font-medium">
            Customer name
            <input name="customerName" defaultValue={order.customerName ?? ""} maxLength={200} disabled={busy} className={inputStyle} />
          </label>
          <div>
            <label htmlFor={phoneId} className="block text-sm font-medium">Customer phone (optional)</label>
            {open && <PhoneInput
              id={phoneId}
              international
              defaultCountry="LB"
              autoComplete="tel"
              placeholder="Enter phone number"
              value={customerPhone}
              onChange={(value) => setCustomerPhone(value ?? "")}
              onBlur={() => setPhoneTouched(true)}
              maxLength={40}
              disabled={busy}
              aria-invalid={phoneInvalid}
              aria-describedby={`${phoneId}-hint${phoneInvalid ? ` ${phoneId}-error` : ""}`}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:outline-none"
            />}
            <p id={`${phoneId}-hint`} className="mt-2 text-xs text-gray-500">This number is not saved yet.</p>
            {phoneInvalid && <p id={`${phoneId}-error`} role="alert" className="mt-2 text-xs text-red-600">Enter a valid phone number.</p>}
          </div>
          <label className="block text-sm font-medium">
            Ordered at
            <input type="date" name="orderedAt" defaultValue={order.orderedAt.slice(0, 10)} required disabled={busy} className={inputStyle} />
          </label>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" disabled={busy} onClick={() => dialog.current?.close()} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300">{busy ? "Saving..." : "Save changes"}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
