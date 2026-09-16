"use client";

import { useEffect, useSyncExternalStore } from "react";

type Currency = "USD" | "LBP";

const storageKey = "souqflow.currency";
const changeEvent = "souqflow:currency-change";

let sessionCurrency: Currency | undefined;
let exchangeRate = 89_500;

function getCurrency(): Currency {
  if (sessionCurrency) return sessionCurrency;

  try {
    return localStorage.getItem(storageKey) === "LBP"
      ? "LBP"
      : "USD";
  } catch {
    return "USD";
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(changeEvent, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(changeEvent, callback);
  };
}

export function useCurrency() {
  return useSyncExternalStore(
    subscribe,
    getCurrency,
    (): Currency => "USD"
  );
}

export function toggleCurrency() {
  const next = getCurrency() === "USD" ? "LBP" : "USD";

  try {
    localStorage.setItem(storageKey, next);
    sessionCurrency = undefined;
  } catch {
    sessionCurrency = next;
  }

  window.dispatchEvent(new Event(changeEvent));
}

export function useExchangeRate() {
  useEffect(() => {
    async function loadRate() {
      try {
        const response = await fetch("/api/exchange-rate", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (
          typeof data.usdToLbp === "number" &&
          data.usdToLbp > 0
        ) {
          exchangeRate = data.usdToLbp;

          window.dispatchEvent(
            new Event(changeEvent)
          );
        }
      } catch {
        // Keep the existing rate if fetching fails.
      }
    }

    loadRate();
  }, []);

  return exchangeRate;
}

// Always convert from the original USD amount to avoid rounding drift on toggles.
export function formatPrice(
  amountUsd: number,
  currency: Currency,
  usdToLbp: number
) {
  if (currency === "LBP") {
    return `LL ${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(amountUsd * usdToLbp)}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountUsd);
}

export function Price({
  amountUsd,
}: {
  amountUsd: number;
}) {
  const currency = useCurrency();
  const usdToLbp = useExchangeRate();

  return (
    <>
      {formatPrice(amountUsd, currency, usdToLbp)}
    </>
  );
}