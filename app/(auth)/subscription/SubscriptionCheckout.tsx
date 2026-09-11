"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import paymentQr from "@/app/assets/paymentQR.jpg";

const subscriptionFeatures = [
  {
    title: "Order Management",
    description: "Create and manage customer orders from one dashboard.",
  },
  {
    title: "Product Catalog",
    description: "Add, edit, and delete products easily.",
  },
  {
    title: "Invoice Tracking",
    description: "Keep track of invoices and their current status.",
  },
  {
    title: "Sales Analytics",
    description: "View sales statistics and key insights about your business performance.",
  },
];

export default function SubscriptionCheckout() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState("");

  async function completePayment() {
    setIsChecking(true);
    setMessage("Checking your Wish Money payment...");

    try {
      // Give the temporary checkout confirmation the same feedback as a real
      // provider verification while the payment API is not yet available.
      await new Promise((resolve) => window.setTimeout(resolve, 2200));

      const response = await fetch("/api/subscription", { method: "POST" });
      const subscription = (await response.json()) as {
        isActive?: boolean;
        error?: string;
      };

      if (response.ok && subscription.isActive) {
        setMessage("Payment confirmed. Opening SouqFlow...");
        router.replace("/");
        router.refresh();
        return;
      }

      setMessage(subscription.error ?? "We could not confirm your payment. Please try again.");
    } catch {
      setMessage("We could not confirm your payment. Please try again.");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            SouqFlow
          </span>
          <p className="mt-3 text-sm text-gray-500">Simple tools for managing your business</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-blue-100/40 sm:p-10">
          <div className="text-center">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Monthly subscription
            </span>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Activate your SouqFlow account</h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Scan the QR code with your Wish Money wallet, then confirm your payment to unlock the platform.
            </p>
          </div>

          <div className="mt-7 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-center text-white">
            <p className="text-sm font-medium text-blue-100">SouqFlow monthly plan</p>
            <p className="mt-1 text-4xl font-extrabold">$9.99</p>
            <p className="mt-1 text-xs text-blue-100">Billed every month</p>
          </div>

          <section className="mt-7" aria-labelledby="subscription-features">
            <h2 id="subscription-features" className="text-sm font-semibold text-gray-900">
              Everything included
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {subscriptionFeatures.map((feature) => (
                <div key={feature.title} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <Check aria-hidden="true" size={13} strokeWidth={3} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">{feature.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-7 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
            <Image
              src={paymentQr}
              alt="Wish Money payment QR code"
              width={224}
              height={224}
              className="mx-auto h-56 w-56 rounded-xl bg-white p-3"
            />
            <p className="mt-4 text-center text-sm font-semibold text-gray-700">Wish Money payment QR</p>
            <p className="mt-1 text-center text-xs leading-5 text-gray-500">
              Scan this code with your Wish Money wallet to complete the payment.
            </p>
          </div>

          {message && (
            <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3" role="status">
              <p className="text-sm text-amber-900">{message}</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => void completePayment()}
            disabled={isChecking}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChecking ? "Checking payment..." : "I've paid — confirm payment"}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-gray-400">
            Payment confirmation takes a few seconds. You will then be redirected to SouqFlow automatically.
          </p>
        </div>
      </div>
    </main>
  );
}
