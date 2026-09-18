"use client";

import { useState } from "react";
import { Power } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
export default function DisableAccount() {
  const [showModal, setShowModal] = useState(false);
  const [disableText, setDisableText] = useState("");
  const [isDisabling, setIsDisabling] = useState(false);

  const router = useRouter();

  const handleDisableAccount = async () => {
    if (disableText !== "Disable") {
      return;
    }

    try {
      setIsDisabling(true);

      await axios.patch("/api/profile/disable");

      toast.success("Account disabled successfully");

      router.push("/signin");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to disable account",
        );
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsDisabling(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setDisableText("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={isDisabling}
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Disable Account
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <Power className="h-5 w-5 text-red-600" />
              </div>

              <h2 className="text-xl font-semibold text-gray-900">
                Disable your account?
              </h2>
            </div>

            <p className="mt-4 text-sm leading-6 text-gray-600">
              Your subscription will be deactivated, and you will need to
              purchase a new subscription to regain access to your account.
            </p>

            <label
              htmlFor="disable-confirmation"
              className="mt-5 block text-sm font-medium text-gray-700"
            >
              Type <span className="font-semibold">Disable</span> to confirm
            </label>

            <input
              id="disable-confirmation"
              type="text"
              value={disableText}
              onChange={(e) => setDisableText(e.target.value)}
              placeholder="Disable"
              disabled={isDisabling}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:bg-gray-50"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isDisabling}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDisableAccount}
                disabled={disableText !== "Disable" || isDisabling}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDisabling ? (
                  <>
                    <Power className="h-4 w-4 animate-pulse" />
                    Disabling...
                  </>
                ) : (
                  "Disable Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
