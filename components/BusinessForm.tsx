"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Copy, FolderUp } from "lucide-react";

import {
  businessSchema,
  BusinessFormData,
} from "@/lib/validations/businessinfo";

import { useBusiness } from "@/context/BusinessContext";
import { IMAGE_ACCEPT, validateImageFile } from "@/lib/image-file";

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
  const { setBusinessName, setBusinessLogo } = useBusiness();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);
  const displayedLogo = logoPreview || business?.logo;

  const whatsappPhone = business?.user.phone.replace(/\D/g, "");

  const whatsappLink = whatsappPhone ? `https://wa.me/${whatsappPhone}` : "";

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

  const handleCopyWhatsApp = async () => {
    if (!whatsappLink) {
      toast.error("WhatsApp link is not available");
      return;
    }

    try {
      await navigator.clipboard.writeText(whatsappLink);
      toast.success("WhatsApp link copied");
    } catch {
      toast.error("Failed to copy WhatsApp link");
    }
  };

  const onSubmit = async (data: BusinessFormData) => {
    try {
      setIsSaving(true);

      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("description", data.description ?? "");
      formData.append("instagram", data.instagram ?? "");
      formData.append("facebook", data.facebook ?? "");
      formData.append("tiktok", data.tiktok ?? "");

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await axios.put("/api/business", formData);

      setBusinessName(data.name);
      setBusinessLogo(response.data.business.logo ?? null);

      toast.success("Business profile updated successfully");

      onClose();
      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to update business profile",
        );
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Business Name
        </label>

        <input
          id="name"
          type="text"
          maxLength={50}
          {...register("name")}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
        />

        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Description
        </label>

        <textarea
          id="description"
          rows={4}
          {...register("description")}
          className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
        />

        {errors.description && (
          <p className="mt-1 text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="logo"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Business Logo
        </label>

        <input
          id="logo"
          type="file"
          accept={IMAGE_ACCEPT}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            if (file) {
              const validationError = validateImageFile(file);
              if (validationError) {
                toast.error(validationError);
                event.target.value = "";
                setLogoFile(null);
                setLogoPreview(null);
                return;
              }
            }
            setLogoFile(file);
            setLogoPreview(file ? URL.createObjectURL(file) : null);
          }}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm"
        />

        {displayedLogo && (
          <Image
            src={displayedLogo}
            alt="Business logo preview"
            width={96}
            height={96}
            unoptimized
            className="mt-3 h-24 w-24 rounded-lg border border-gray-200 bg-white object-contain p-2"
          />
        )}
        <p className="mt-2 text-xs text-gray-500">
          JPEG, PNG, WebP, or GIF. Maximum 4 MB.
          {" "}Your saved logo appears on order receipts.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>

          <p className="mt-1 text-sm text-gray-500">
            Add your business social media links.
          </p>
        </div>

        <div className="space-y-4">
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
              placeholder="https://instagram.com/yourbusiness"
              {...register("instagram")}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
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
              placeholder="https://facebook.com/yourbusiness"
              {...register("facebook")}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
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
              placeholder="https://tiktok.com/@yourbusiness"
              {...register("tiktok")}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />

            {errors.tiktok && (
              <p className="mt-1 text-sm text-red-500">
                {errors.tiktok.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">WhatsApp</h3>

          <p className="mt-1 text-sm text-gray-500">
            This link is automatically generated from your phone number.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={whatsappLink}
            readOnly
            placeholder="WhatsApp link"
            className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-600 outline-none"
          />

          <button
            type="button"
            onClick={handleCopyWhatsApp}
            disabled={!whatsappLink}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-200 pt-6">
        <button
          type="submit"
          disabled={isSaving}
          className="group flex items-center gap-2 rounded-xl border border-purple-200 bg-gradient-to-r from-blue-50 via-purple-50 to-white px-4 py-2.5 text-sm font-semibold text-purple-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <FolderUp className="h-4 w-4" />
          </span>

          <span>{isSaving ? "Saving..." : "Save & Update"}</span>
        </button>
      </div>
    </form>
  );
}
