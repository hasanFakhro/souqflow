import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createCatalogPathSegment } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CatalogManagementPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/signin");
  }

  const seller = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      business: true,
    },
  });

  if (!seller?.business) {
    return null;
  }

  const catalogPath = createCatalogPathSegment(
    seller.business.name,
    seller.id
  );

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Catalog Management
        </h1>

        <Link
          href={`/catalog/${catalogPath}`}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
        >
          Go to Catalog
        </Link>
      </div>
    </section>
  );
}