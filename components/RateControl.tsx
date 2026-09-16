"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

type RateControlProps = {
  role?: string;
};

export default function RateControl({
  role,
}: RateControlProps) {
  const [rate, setRate] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadRate() {
      try {
        const response = await fetch("/api/exchange-rate", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load rate");
        }

        const data = await response.json();

        setRate(data.usdToLbp);
      } catch {
        setMessage("Could not load exchange rate.");
      }
    }

    loadRate();
  }, []);

  if (role !== "ADMIN") {
    return null;
  }

  function openModal() {
    setValue(rate?.toString() ?? "");
    setMessage("");
    setIsOpen(true);
  }

  async function handleUpdate() {
    const newRate = Number(value);

    if (!Number.isFinite(newRate) || newRate <= 0) {
      setMessage("Please enter a valid rate.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/exchange-rate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usdToLbp: newRate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "Could not update rate.");
        return;
      }

      setRate(data.usdToLbp);
      setIsOpen(false);
      setMessage("Exchange rate updated.");
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
      >
        <RefreshCw size={20} aria-hidden="true" />

        <span className="flex-1">
          Update Rate
          <span className="block text-xs text-gray-400">
            1 USD = {rate?.toLocaleString("en-US") ?? "..."} LBP
          </span>
        </span>
      </button>

      {message && !isOpen && (
        <p className="mt-2 px-3 text-xs text-gray-600">
          {message}
        </p>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-blue-100 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Update Exchange Rate
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Set the value of 1 USD in Lebanese lira.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <label
              htmlFor="usdToLbp"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              USD to LBP
            </label>

            <input
              id="usdToLbp"
              type="number"
              min="1"
              step="1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="89500"
            />

            {message && (
              <p className="mt-2 text-xs text-red-600">
                {message}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={isLoading}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}