"use client";

import NextLink from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AlertTriangle, X } from "lucide-react";

type SessionUserWithSubscription = {
  subscriptionActive?: boolean;
  subscriptionEndDate?: Date | string | null;
};

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

export default function SubscriptionWarning() {

  const { data: session } = useSession();
  const sessionUser = session?.user as SessionUserWithSubscription | undefined;

  const [timeLeft, setTimeLeft] = useState(0);
  const [dismissedDate, setDismissedDate] = useState<string | null>(null);

  useEffect(() => {
    const savedDate = localStorage.getItem("subscription-warning-dismissed");

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissedDate(savedDate);
  }, []);

  useEffect(() => {
    const endDate = sessionUser?.subscriptionEndDate ?? null;

    if (!endDate) {
      return;
    }

    const updateCountdown = () => {
      const endTime = new Date(endDate).getTime();
      const now = Date.now();

      const difference = endTime - now;

      setTimeLeft(Math.max(difference, 0));
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [sessionUser?.subscriptionEndDate]);

  const handleDismiss = () => {
    const today = getToday();

    localStorage.setItem("subscription-warning-dismissed", today);

    setDismissedDate(today);
  };

  const today = getToday();

  if (
    !sessionUser?.subscriptionActive ||
    !sessionUser.subscriptionEndDate ||
    timeLeft <= 0 ||
    dismissedDate === today
  ) {
    return null;
  }

  const fiveDays = 5 * 24 * 60 * 60 * 1000;

  if (timeLeft > fiveDays) {
    return null;
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));

  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);

  const format = (value: number) => value.toString().padStart(2, "0");

  return (
    <div className="mb-6 flex justify-center">
      <div className="flex w-max max-w-[calc(100vw-2rem)] items-center gap-2 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-purple-50 px-3 py-2.5 shadow-lg shadow-blue-100/40">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-blue-100">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
        </div>

        <p className="whitespace-nowrap text-xs font-semibold text-gray-900 sm:text-sm">
          Subscription ends in
        </p>

        <div className="flex items-center gap-1 text-xs font-bold sm:text-sm">
          <span className="rounded-md bg-blue-50 px-1.5 py-1 text-blue-700">
            {days}d
          </span>

          <span className="text-gray-300">:</span>

          <span className="rounded-md bg-purple-50 px-1.5 py-1 text-purple-700">
            {format(hours)}h
          </span>
        </div>

        <NextLink
          href="/settings#subscription"
          className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-purple-700"
        >
          Renew
        </NextLink>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-white hover:text-gray-600"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
