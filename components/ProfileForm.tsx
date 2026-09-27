"use client";

import Image from "next/image";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { profileSchema, type ProfileFormData } from "@/lib/validations/profile";
import { FolderUp, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import DisableAccount from "./DisableAccount";
import { useSession } from "next-auth/react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

type ProfileUser = {
  id: string;
  name: string | null;
  email: string;
  phone: string;
  image: string | null;
};

export default function ProfileForm({ user }: { user: ProfileUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  const role = (session?.user as { role?: string })?.role;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? "",
      email: user.email,
      phone: user.phone,
      image: user.image ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    reset({
      name: user.name ?? "",
      email: user.email,
      phone: user.phone,
      image: user.image ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setIsEditing(false);
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);

      const response = await axios.put("/api/profile", data);

      console.log(response.data);

      setIsEditing(false);

      reset({
        name: data.name,
        email: data.email,
        phone: data.phone,
        image: data.image,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Profile updated successfully");

      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to update profile",
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
      className="rounded-2xl bg-white p-6 shadow-sm"
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            {user.image ? (
              <Image
                src={user.image}
                alt="Profile"
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold text-gray-400">
                {user.name?.charAt(0).toUpperCase() ?? "U"}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h2>

            <p className="text-sm text-gray-500">
              Manage your profile information.
            </p>
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">
          {!isEditing && (
            <button
              type="button"
              onClick={handleEdit}
              className="group flex items-center gap-2 rounded-xl border border-purple-200 bg-gradient-to-r from-blue-50 via-purple-50 to-white px-4 py-2.5 text-sm font-semibold text-purple-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Pencil className="h-4 w-4" />
              </span>

              <span>Edit Profile</span>
            </button>
          )}

          {role !== "ADMIN" && <DisableAccount />}
        </div>
      </div>

      {isEditing && (
        <div className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              {...register("name")}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              {...register("email")}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>

            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  id="phone"
                  international
                  defaultCountry="LB"
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? "")}
                  onBlur={field.onBlur}
                  placeholder="Enter phone number"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"
                />
              )}
            />

            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="image"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Profile Image URL
            </label>

            <input
              id="image"
              type="text"
              {...register("image")}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />

            {errors.image && (
              <p className="mt-1 text-sm text-red-500">
                {errors.image.message}
              </p>
            )}
          </div>
        </div>
      )}

      {isEditing && (
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            Change Password
          </h2>

          <p className="mb-5 text-sm text-gray-500">
            Leave these fields empty if you do not want to change your password.
          </p>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Current Password
              </label>

              <input
                id="currentPassword"
                type="password"
                autoComplete="off"
                {...register("currentPassword")}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />

              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...register("newPassword")}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />

              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />

              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="group flex items-center gap-2 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 via-red-50 to-white px-5 py-3 text-sm font-semibold text-rose-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <X className="h-4 w-4" />
            </span>

            <span>Cancel</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="group flex items-center gap-2 rounded-xl border border-purple-200 bg-gradient-to-r from-blue-50 via-purple-50 to-white px-4 py-2.5 text-sm font-semibold text-purple-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <FolderUp className="h-4 w-4 animate-bounce" />
            </span>

            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      )}
    </form>
  );
}
