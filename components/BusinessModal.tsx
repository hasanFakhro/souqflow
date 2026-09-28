"use client";

import { X } from "lucide-react";
import BusinessForm from "./BusinessForm";

type BusinessUser = {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    phone: string;
  };
};

export default function BusinessModal({
  business,
  onClose,
}: {
  business: BusinessUser | null;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Update Business Profile
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update your business information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <BusinessForm
            business={business}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}