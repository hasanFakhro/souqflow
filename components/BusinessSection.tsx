"use client";

import { useState } from "react";
import { Building2, Camera, Check, Copy, MessageCircle, Music2, Users } from "lucide-react";
import { toast } from "sonner";
import BusinessModal from "./BusinessModal";

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

export default function BusinessSection({
  business,
}: {
  business: BusinessUser | null;
}) {
  const [showBusinessModal, setShowBusinessModal] = useState(false);

  const [copied, setCopied] = useState<string | null>(null);

  const whatsappPhone = business?.user.phone.replace(/\D/g, "");

  const whatsappLink = whatsappPhone ? `https://wa.me/${whatsappPhone}` : null;

  const copyLink = async (name: string, link: string) => {
    try {
      await navigator.clipboard.writeText(link);

      setCopied(name);
      toast.success(`${name} link copied`);

      setTimeout(() => {
        setCopied(null);
      }, 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <Building2 className="h-6 w-6 text-gray-500" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Business Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage your business information and social links.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBusinessModal(true)}
              className="group flex items-center gap-2 rounded-xl border border-purple-200 bg-gradient-to-r from-blue-50 via-purple-50 to-white px-4 py-2.5 text-sm font-semibold text-purple-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Building2 className="h-4 w-4" />
              </span>

              <span>Update Business Profile</span>
            </button>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <div className="flex flex-wrap items-center gap-3">
              {whatsappLink && (
                <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open WhatsApp"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-green-600 transition hover:bg-green-100"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => copyLink("WhatsApp", whatsappLink)}
                    aria-label="Copy WhatsApp link"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white hover:text-gray-900"
                  >
                    {copied === "WhatsApp" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}

              {business?.instagram && (
                <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
                  <a
                    href={business.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open Instagram"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-pink-600 transition hover:bg-pink-100"
                  >
                    <Camera className="h-5 w-5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => copyLink("Instagram", business.instagram!)}
                    aria-label="Copy Instagram link"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white hover:text-gray-900"
                  >
                    {copied === "Instagram" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}

              {business?.facebook && (
                <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
                  <a
                    href={business.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open Facebook"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 transition hover:bg-blue-100"
                  >
                    <Users className="h-5 w-5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => copyLink("Facebook", business.facebook!)}
                    aria-label="Copy Facebook link"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white hover:text-gray-900"
                  >
                    {copied === "Facebook" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}

              {business?.tiktok && (
                <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
                  <a
                    href={business.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open TikTok"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-800 transition hover:bg-gray-200"
                  >
                    <Music2 className="h-5 w-5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => copyLink("TikTok", business.tiktok!)}
                    aria-label="Copy TikTok link"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white hover:text-gray-900"
                  >
                    {copied === "TikTok" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBusinessModal && (
        <BusinessModal
          business={business}
          onClose={() => setShowBusinessModal(false)}
        />
      )}
    </>
  );
}
