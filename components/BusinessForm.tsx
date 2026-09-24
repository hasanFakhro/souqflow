
"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

import {
  businessSchema,
  type BusinessFormData,
} from "@/lib/validations/businessinfo";

type BusinessUser = {
  id: string;
  name: string;
  phone: string | null;
  logo: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function BusinessForm({
  business,
  onClose,
}: {
  business: BusinessUser | null;
  onClose: () => void;
}) {
  const router = useRouter();

  const [phone, setPhone] = useState<string | undefined>(
    business?.phone ?? "",
  );

  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),

    defaultValues: {
      name: business?.name ?? "",
      phone: business?.phone ?? "",
      logo: business?.logo ?? "",
    },
  });

  const handlePhoneChange = (value: string | undefined) => {
    setPhone(value);

    setValue("phone", value || "", {
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: BusinessFormData) => {
    try {
      setIsSaving(true);

      await axios.put("/api/business", data);

      toast.success("Business profile updated successfully");

      onClose();

      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Failed to update business profile",
        );
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 space-y-5"
    >
      {/* Business Name */}
      <div>
        <label
          htmlFor="businessName"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Business Name
        </label>

        <input
          id="businessName"
          type="text"
          {...register("name")}
          placeholder="Enter your business name"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />

        {errors.name && (
          <p className="mt-1 text-sm text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="businessPhone"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Phone
        </label>

        <PhoneInput
          id="businessPhone"
          international
          defaultCountry="LB"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="Enter phone number"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
        />

        {errors.phone && (
          <p className="mt-1 text-sm text-red-500">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Business Logo */}
      <div>
        <label
          htmlFor="businessLogo"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Business Logo URL
        </label>

        <input
          id="businessLogo"
          type="url"
          {...register("logo")}
          placeholder="https://example.com/logo.png"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />

        {errors.logo && (
          <p className="mt-1 text-sm text-red-500">
            {errors.logo.message}
          </p>
        )}
      </div>

      {/* Save & Update */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-medium text-white transition hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Updating..." : "Save & Update"}
        </button>
      </div>
    </form>
  );
}

