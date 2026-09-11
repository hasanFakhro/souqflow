"use client";

import { useSyncExternalStore } from "react";

export const LBP_PER_USD = 89_500;
type Currency = "USD" | "LBP";
const storageKey = "souqflow.currency";
const changeEvent = "souqflow:currency-change";
let sessionCurrency: Currency | undefined;

function getCurrency(): Currency {
  if (sessionCurrency) return sessionCurrency;
  try {
    return localStorage.getItem(storageKey) === "LBP" ? "LBP" : "USD";
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
  return useSyncExternalStore(subscribe, getCurrency, (): Currency => "USD");
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

// Always convert from the original USD amount to avoid rounding drift on toggles.
export function formatPrice(amountUsd: number, currency: Currency) {
  if (currency === "LBP") {
    return `LL ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amountUsd * LBP_PER_USD)}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amountUsd);
}

export function Price({ amountUsd }: { amountUsd: number }) {
  const currency = useCurrency();
  return <>{formatPrice(amountUsd, currency)}</>;
}
