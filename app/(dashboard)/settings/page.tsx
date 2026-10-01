import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { createCatalogPathSegment } from "@/lib/catalog";
import { redirect } from "next/navigation";

import CatalogShareLink from "@/components/CatalogShareLink";
import ProfileForm from "@/components/ProfileForm";
import SubscriptionSection from "@/components/SubscriptionSection";
import BusinessSection from "@/components/BusinessSection";
import UpdateRate from "@/components/UpdateRate";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const userId = session.user.id;

  const [user, business, subscription] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
        phone: true,
      },
    }),

    prisma.business.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            phone: true,
          },
        },
      },
    }),

    prisma.subscription.findUnique({
      where: {
        userId,
      },
      select: {
        endDate: true,
      },
    }),
  ]);

  if (!user) {
    redirect("/signin");
  }

  const requestHeaders = await headers();

  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";

  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");

  const catalogUrl = `${protocol}://${host}/catalog/${createCatalogPathSegment(user.name, user.id)}`;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
          Good to see you{" "}
          {user.name
            ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
            : ""}
        </h1>

        <span className="text-3xl">👋</span>
      </div>

      <ProfileForm user={user} />

      <BusinessSection business={business} />

      <CatalogShareLink catalogUrl={catalogUrl} />

      <UpdateRate />

      <SubscriptionSection subscription={subscription} />
    </div>
  );
}
