"use client";


import { X } from "lucide-react";
import BusinessForm from "./BusinessForm";

type BusinessUser = {
  id: string;
  name: string;
  phone: string | null;
  logo: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
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
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900">
          Update Business Profile
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Update your business information.
        </p>

        <BusinessForm
          business={business}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

