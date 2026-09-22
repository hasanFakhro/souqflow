"use client";

import { useEffect, useState } from "react";

type Currency = "USD" | "LBP";

const storageKey = "souqflow.currency";

const currencyChangeEvent = "souqflow:currency-change";
const exchangeRateChangeEvent = "souqflow:exchange-rate-change";



// Stores the latest rate in memory so all Price components
// can share the same value.
let cachedRate: number | null = null;

// Stores the current request.
// If several components ask for the rate at the same time,
// they can all use the same request instead of creating
// multiple requests.
let rateRequest: Promise<number | null> | null = null;


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
    // Read the saved currency when the component loads.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrency(getStoredCurrency());

    // Runs when another component changes the currency.
    const handleCurrencyChange = () => {
      setCurrency(getStoredCurrency());
    };

    // Listen for the custom currency event.
    window.addEventListener(
      currencyChangeEvent,
      handleCurrencyChange,
    );

    // Remove listener when component unmounts.
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
  // Get the current currency.
  const current = getStoredCurrency();

  // Change USD → LBP
  // or LBP → USD.
  const next: Currency =
    current === "USD"
      ? "LBP"
      : "USD";

  try {
    // Save the new currency in the browser.
    localStorage.setItem(
      storageKey,
      next,
    );
  } catch {
    // Ignore localStorage errors.
  }

  // Tell all useCurrency() components
  // that the currency changed.
  window.dispatchEvent(
    new Event(currencyChangeEvent),
  );
}


async function loadExchangeRate() {
  // If we already have the rate,
  // return it without making another request.
  if (cachedRate !== null) {
    return cachedRate;
  }

  // If another component is already requesting the rate,
  // reuse that same request.
  if (rateRequest) {
    return rateRequest;
  }

  // Create the one request.
  rateRequest = fetch(
    "/api/exchangerate",
    {
      cache: "no-store",
    },
  )
    .then(async (response) => {
      // Stop if backend returned an error.
      if (!response.ok) {
        return null;
      }

      // Convert response to JavaScript object.
      const data = await response.json();

      // Make sure the rate is valid.
      if (
        typeof data.usdToLbp === "number" &&
        data.usdToLbp > 0
      ) {
        // Save the rate in memory.
        cachedRate = data.usdToLbp;

        return cachedRate;
      }

      return null;
    })
    .catch(() => {
      // Return null if the request fails.
      return null;
    })
    .finally(() => {
      // The request is finished,
      // so allow a future request if needed.
      rateRequest = null;
    });

  return rateRequest;
}


export function useExchangeRate() {
  // Start with the cached value if we already have one.
  const [rate, setRate] =
    useState<number | null>(cachedRate);

  useEffect(() => {
    // Load the rate when the component starts.
    loadExchangeRate().then((newRate) => {
      if (newRate !== null) {
        setRate(newRate);
      }
    });

    // Runs when UpdateRate tells us
    // that the database rate changed.
    const handleRateChange = () => {
      // Remove old value from memory.
      cachedRate = null;

      // Get the new rate.
      loadExchangeRate().then((newRate) => {
        if (newRate !== null) {
          setRate(newRate);
        }
      });
    };

    // Listen for exchange-rate changes.
    window.addEventListener(
      exchangeRateChangeEvent,
      handleRateChange,
    );

    // Cleanup listener.
    return () => {
      window.removeEventListener(
        exchangeRateChangeEvent,
        handleRateChange,
      );
    };
  }, []);

  return rate;
}


// amountUsd = original product price in USD
// currency = USD or LBP
// usdToLbp = current exchange rate

export function formatPrice(
  amountUsd: number,
  currency: Currency,
  usdToLbp: number,
) {
  // User wants LBP.
  if (currency === "LBP") {
    return `LL ${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(
      amountUsd * usdToLbp,
    )}`;
  }

  // User wants USD.
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountUsd);
}

// --------------------------------------------------
// PRICE COMPONENT
// --------------------------------------------------

export function Price({
  amountUsd,
}: {
  amountUsd: number;
}) {
  // Get selected currency.
  const currency = useCurrency();

  // Get shared exchange rate.
  const rate = useExchangeRate();

  // Rate is still loading.
  if (rate === null) {
    // USD doesn't need the exchange rate.
    if (currency === "USD") {
      return (
        <>
          {formatPrice(
            amountUsd,
            "USD",
            0,
          )}
        </>
      );
    }

    // LBP needs the rate,
    // so show a temporary value.
    return <>LL ...</>;
  }

  // Display the final price.
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