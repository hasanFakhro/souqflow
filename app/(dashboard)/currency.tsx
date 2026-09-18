"use client";

import { useEffect, useState } from "react";

type Currency = "USD" | "LBP";

const storageKey = "souqflow.currency";


const currencyChangeEvent = "souqflow:currency-change";
const exchangeRateChangeEvent = "souqflow:exchange-rate-change";


function getStoredCurrency(): Currency {
  try {
    return localStorage.getItem(storageKey) === "LBP"
      ? "LBP"
      : "USD";
  } catch {
    return "USD";
  }
}



export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>("USD");

  useEffect(() => {
  
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrency(getStoredCurrency());

 
    const handleCurrencyChange = () => {
      setCurrency(getStoredCurrency());
    };

    window.addEventListener(
      currencyChangeEvent,
      handleCurrencyChange,
    );

    return () => {
      window.removeEventListener(
        currencyChangeEvent,
        handleCurrencyChange,
      );
    };
  }, []);

  return currency;
}

export function toggleCurrency() {
  const current = getStoredCurrency();

  const next: Currency =
    current === "USD" ? "LBP" : "USD";

  try {
    localStorage.setItem(storageKey, next);
  } catch {
  }


  window.dispatchEvent(
    new Event(currencyChangeEvent),
  );
}


export function useExchangeRate() {
  // null means the rate has not been loaded yet.
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    // Get the current rate from our backend.
    const loadRate = async () => {
      try {
     
        const response = await fetch(
          "/api/exchangerate",
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (
          typeof data.usdToLbp === "number" &&
          data.usdToLbp > 0
        ) {
          setRate(data.usdToLbp);
        }
      } catch {
      }
    };

    loadRate();

  
    const handleRateChange = () => {
      loadRate();
    };

    window.addEventListener(
      exchangeRateChangeEvent,
      handleRateChange,
    );

    return () => {
      window.removeEventListener(
        exchangeRateChangeEvent,
        handleRateChange,
      );
    };
  }, []);

  return rate;
}


export function formatPrice(
  amountUsd: number,
  currency: Currency,
  usdToLbp: number,
) {
  // User wants to see LBP.
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

  const rate = useExchangeRate();

  if (rate === null) {
    if (currency === "USD") {
      return (
        <>
          {formatPrice(amountUsd, "USD", 0)}
        </>
      );
    }

    return <>LL ...</>;
  }

  
  return (
    <>
      {formatPrice(
        amountUsd,
        currency,
        rate,
      )}
    </>
  );
}