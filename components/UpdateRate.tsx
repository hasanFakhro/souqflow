"use client";

import { useState } from "react";
import axios from "axios";
import { ArrowLeftRight, X } from "lucide-react";
import toast from "react-hot-toast";

export default function UpdateRate() {
  const [isOpen, setIsOpen] = useState(false);
  const [rate, setRate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const openModal = async () => {
    setIsOpen(true);
    setIsLoading(true);

    try {
      const response = await axios.get("/api/exchangerate");

      setRate(String(response.data.usdToLbp));
    } catch {
      toast.error("Could not load exchange rate");
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    if (isUpdating) {
      return;
    }

    setIsOpen(false);
    setRate("");
  };

  const handleUpdate = async () => {
    const newRate = Number(rate);

    if (!Number.isFinite(newRate) || newRate <= 0) {
      toast.error("Please enter a valid exchange rate");
      return;
    }

    try {
      setIsUpdating(true);

      await axios.put("/api/exchangerate", {
        usdToLbp: newRate,
      });

      toast.success("Exchange rate updated successfully");

      setIsOpen(false);
      setRate("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error ||
            "Could not update exchange rate",
        );
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="group flex items-center gap-2 rounded-xl border border-purple-200 bg-gradient-to-r from-blue-50 via-purple-50 to-white px-4 py-2.5 text-sm font-semibold text-purple-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
          <ArrowLeftRight className="h-4 w-4" />
        </span>

        <span>Update Rate</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-2xl border border-blue-100 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Update Exchange Rate
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Set the value of 1 USD in Lebanese lira.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isUpdating}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5">
              <label
                htmlFor="usdToLbp"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                USD to LBP
              </label>

              {isLoading ? (
                <div className="flex h-11 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-400">
                  Loading current rate...
                </div>
              ) : (
                <input
                  id="usdToLbp"
                  type="number"
                  min="1"
                  step="1"
                  value={rate}
                  onChange={(event) =>
                    setRate(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="89500"
                />
              )}

              <p className="mt-2 text-xs text-gray-400">
                Example: 89500 means 1 USD = 89,500 LBP.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={isLoading || isUpdating}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={
                  isLoading ||
                  isUpdating ||
                  !rate
                }
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}