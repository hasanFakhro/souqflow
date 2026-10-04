import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import CatalogProductTable from "@/components/CatalogProductTable";

export const dynamic = "force-dynamic";

export default async function CatalogManagementPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/signin");
  }

  const products = await prisma.product.findMany({
    where: {
      ownerId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
    },
  });

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Catalog Management
        </h1>

        <Link
          href="/catalog"
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:from-blue-700 hover:to-purple-700"
        >
          Go to Catalog
        </Link>
      </div>

      <CatalogProductTable products={products} />
    </section>
  );
}