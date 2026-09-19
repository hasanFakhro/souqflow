"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  profileSchema,
  type ProfileFormData,
} from "@/lib/validations/profile";
import { FolderUp } from "lucide-react";
import toast from "react-hot-toast";
import DisableAccount from "./DisableAccount";
import { useSession } from "next-auth/react";
import UpdateRate from "./UpdateRate";

type ProfileUser = {
  id: string;
  name: string | null;
  email: string;
  phone: string;
  image: string | null;
};

export default function ProfileForm({
  user,
}: {
  user: ProfileUser;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  const role = (session?.user as { role?: string })?.role;

  const {
    register,
    handleSubmit,
    reset,
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
      reset({
        name: data.name,
        email: data.email,
        phone: data.phone,
        image: data.image,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Failed to update profile",
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
      <div className="mb-8 flex items-center justify-between gap-4">
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

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          {role !== "ADMIN" && <UpdateRate />}

          <DisableAccount />
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
              <p className="mt-1 text-sm text-red-500">
                {errors.name.message}
              </p>
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
              Phone
            </label>

            <input
              id="phone"
              type="text"
              {...register("phone")}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
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

      {/* Change Password */}
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

      <div className="mt-8 flex justify-end gap-3">
        {!isEditing ? (
          <button
            type="button"
            onClick={handleEdit}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <FolderUp className="h-5 w-5 animate-bounce" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </>
        )}
      </div>
    </form>
  );
}