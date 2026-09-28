"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import axios from "axios";

import { toast } from "sonner";

import { useRouter } from "next/navigation";

import {
  businessSchema,
  BusinessFormData,
} from "@/lib/validations/businessinfo";

import { useBusiness } from "@/context/BusinessContext";

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

export default function BusinessForm({
  business,
  onClose,
}: {
  business: BusinessUser | null;
  onClose: () => void;
}) {
  const router = useRouter();

  const { setBusinessName } = useBusiness();

  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const whatsappPhone = business?.user.phone.replace(/\D/g, "");

  const whatsappLink = whatsappPhone
    ? `https://wa.me/${whatsappPhone}`
    : "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),

    defaultValues: {
      name: business?.name ?? "",
      description: business?.description ?? "",
      instagram: business?.instagram ?? "",
      facebook: business?.facebook ?? "",
      tiktok: business?.tiktok ?? "",
    },
  });

  const onSubmit = async (data: BusinessFormData) => {
    try {
      setIsSaving(true);

      const formData = new FormData();

      formData.append("name", data.name);

      formData.append(
        "description",
        data.description ?? "",
      );

      formData.append(
        "instagram",
        data.instagram ?? "",
      );

      formData.append(
        "facebook",
        data.facebook ?? "",
      );

      formData.append(
        "tiktok",
        data.tiktok ?? "",
      );

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      await axios.put("/api/business", formData);

      setBusinessName(data.name);

      toast.success(
        "Business profile updated successfully",
      );

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

      <div>
        <label
          htmlFor="businessDescription"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Business Description
        </label>

        <textarea
          id="businessDescription"
          {...register("description")}
          rows={4}
          placeholder="Tell your customers about your business..."
          className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />

        {errors.description && (
          <p className="mt-1 text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="businessLogo"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Business Logo
        </label>

        <input
          id="businessLogo"
          type="file"
          accept="image/*"
          onChange={(e) => {
            setLogoFile(e.target.files?.[0] ?? null);
          }}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium"
        />

        <p className="mt-1 text-xs text-gray-500">
          Select an image for your business logo.
        </p>
      </div>

      <div>
        <label
          htmlFor="instagram"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Instagram
        </label>

        <input
          id="instagram"
          type="url"
          {...register("instagram")}
          placeholder="https://instagram.com/yourbusiness"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />

        {errors.instagram && (
          <p className="mt-1 text-sm text-red-500">
            {errors.instagram.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="facebook"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Facebook
        </label>

        <input
          id="facebook"
          type="url"
          {...register("facebook")}
          placeholder="https://facebook.com/yourbusiness"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />

        {errors.facebook && (
          <p className="mt-1 text-sm text-red-500">
            {errors.facebook.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="tiktok"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          TikTok
        </label>

        <input
          id="tiktok"
          type="url"
          {...register("tiktok")}
          placeholder="https://tiktok.com/@yourbusiness"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />

        {errors.tiktok && (
          <p className="mt-1 text-sm text-red-500">
            {errors.tiktok.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="whatsappLink"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          WhatsApp Link
        </label>

        <div className="flex gap-2">
          <input
            id="whatsappLink"
            type="text"
            value={whatsappLink}
            readOnly
            className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-600 outline-none"
          />

          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(
                whatsappLink,
              );

              toast.success("WhatsApp link copied");
            }}
            disabled={!whatsappLink}
            className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copy
          </button>
        </div>

        <p className="mt-1 text-xs text-gray-500">
          This link is automatically generated from your phone
          number.
        </p>
      </div>

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