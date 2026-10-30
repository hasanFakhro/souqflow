"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import SubscriptionCheckout from "@/app/(auth)/subscription/SubscriptionCheckout";

type Subscription = {
  endDate: Date | null;
};

export default function SubscriptionSection({
  subscription,
}: {
  subscription: Subscription | null;
}) {
  const router = useRouter();
  const [isRenewalOpen, setIsRenewalOpen] = useState(false);

  if (!subscription) {
    return null;
  }

  function handleRenewalComplete() {
    setIsRenewalOpen(false);
    router.refresh();
  }

  return (
    <>
      <div id="subscription" className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Subscription
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage your current subscription.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">
                Subscription Expires
              </span>

              <span className="rounded-lg border border-purple-200 bg-gradient-to-r from-blue-50 via-purple-50 to-white px-3 py-1.5 text-sm font-semibold text-purple-700 shadow-sm">
                {subscription.endDate
                  ? subscription.endDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "No expiration date"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsRenewalOpen(true)}
              className="group flex items-center gap-2 rounded-xl border border-purple-200 bg-gradient-to-r from-blue-50 via-purple-50 to-white px-4 py-2.5 text-sm font-semibold text-purple-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                <RefreshCw className="h-4 w-4" />
              </span>

              <span>Renew Subscription</span>
            </button>
          </div>
        </div>
      </div>

      {isRenewalOpen && (
        <SubscriptionCheckout
          variant="modal"
          onClose={() => setIsRenewalOpen(false)}
          onComplete={handleRenewalComplete}
        />
      )}
    </>
  );
}
