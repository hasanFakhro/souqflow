"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import paymentQr from "@/app/assets/paymentQR.jpg";
import { Price } from "@/app/(dashboard)/currency";

type SubscriptionPlan = "monthly" | "yearly";
type SubscriptionCheckoutProps = {
  variant?: "page" | "modal";
  onClose?: () => void;
  onComplete?: () => void;
};

const subscriptionPlans = [
  {
    id: "monthly" as const,
    name: "Monthly",
    price: 9.99,
    duration: "Billed every month",
    monthlyEquivalent: 9.99,
    savings: undefined,
  },
  {
    id: "yearly" as const,
    name: "Yearly",
    price: 99.99,
    duration: "Billed once a year",
    monthlyEquivalent: 8.33,
    savings: 19.89,
  },
] as const;

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

export default function SubscriptionCheckout({
  variant = "page",
  onClose,
  onComplete,
}: SubscriptionCheckoutProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>("monthly");
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState("");
  const isModal = variant === "modal";
  const plan = subscriptionPlans.find((item) => item.id === selectedPlan) ?? subscriptionPlans[0];

  async function completePayment() {
    setIsChecking(true);
    setMessage("Checking your Wish Money payment...");

    try {
      // Temporary feedback while a payment-provider API is not available.
      await new Promise((resolve) => window.setTimeout(resolve, 2200));

      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const subscription = (await response.json()) as {
        isActive?: boolean;
        error?: string;
        plan?: SubscriptionPlan;
      };
      if (response.ok && subscription.isActive && subscription.plan === selectedPlan) {
        setMessage(`Payment confirmed. Your ${plan.name.toLowerCase()} plan is active.`);
        await new Promise((resolve) => window.setTimeout(resolve, 650));

        if (onComplete) {
          onComplete();
        } else {
          router.replace("/");
          router.refresh();
        }
        return;
      }

      setMessage(subscription.error ?? "The selected plan could not be confirmed. Please reload and try again.");
    } catch {
      setMessage("We could not confirm your payment. Please try again.");
    } finally {
      setIsChecking(false);
    }
  }

  function closeModal() {
    if (!isChecking) {
      onClose?.();
    }
  }

  const checkout = (
    <div className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-blue-100/40 sm:p-8">
      {isModal && (
        <button
          type="button"
          onClick={closeModal}
          disabled={isChecking}
          aria-label="Close subscription renewal"
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-wait disabled:opacity-50"
        >
          <X aria-hidden="true" size={20} />
        </button>
      )}

      <div className="text-center">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {isModal ? "Renew subscription" : "Choose your subscription"}
        </span>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          {isModal ? "Keep your SouqFlow account active" : "Activate your SouqFlow account"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Choose a plan, scan the QR code with your Wish Money wallet, then confirm your payment.
        </p>
      </div>

      <section className="mt-7" aria-labelledby="subscription-plan-heading">
        <div className="flex items-center justify-between gap-3">
          <h2 id="subscription-plan-heading" className="text-sm font-semibold text-gray-900">
            Select a plan
          </h2>
          <span className="text-xs font-medium text-gray-500">Yearly saves more</span>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {subscriptionPlans.map((option) => {
            const isSelected = option.id === selectedPlan;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedPlan(option.id)}
                disabled={isChecking}
                aria-pressed={isSelected}
                className={`relative rounded-xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                {option.savings && (
                  <span className="absolute -top-2.5 right-3 rounded-full bg-green-100 px-2 py-1 text-[11px] font-bold text-green-700">
                    Save <Price amountUsd={option.savings} />
                  </span>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{option.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{option.duration}</p>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-extrabold text-gray-900">
                  <Price amountUsd={option.price} />
                </p>
                <p className="mt-1 text-xs font-medium text-gray-500">
                  <Price amountUsd={option.monthlyEquivalent} /> / month
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-center text-white">
        <p className="text-sm font-medium text-blue-100">SouqFlow {plan.name.toLowerCase()} plan</p>
        <p className="mt-1 text-4xl font-extrabold"><Price amountUsd={plan.price} /></p>
        <p className="mt-1 text-xs text-blue-100">{plan.duration}</p>
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
          Scan this code with your Wish Money wallet to pay for the {plan.name.toLowerCase()} plan.
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
        {isChecking ? "Checking payment..." : `I've paid — activate ${plan.name.toLowerCase()} plan`}
      </button>

      <p className="mt-4 text-center text-xs leading-5 text-gray-400">
        Payment confirmation takes a few seconds. Your subscription will then be activated automatically.
      </p>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="presentation">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="subscription-plan-heading"
          className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl"
        >
          {checkout}
        </div>
      </div>
    );
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
        {checkout}
      </div>
    </main>
  );
}
