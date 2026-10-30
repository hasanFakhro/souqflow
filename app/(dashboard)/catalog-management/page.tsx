
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createCatalogPathSegment } from "@/lib/catalog";
import prisma from "@/lib/prisma";
import CatalogProductTable from "@/components/CatalogProductTable";
import CategoryOrderManager from "@/components/CategoryOrderManager";

export const dynamic = "force-dynamic";

export default async function CatalogManagementPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/signin");
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),

    prisma.category.findMany({
      where: { ownerId: userId },
      orderBy: [
        { catalogOrder: "asc" },
        { name: "asc" },
      ],
    }),
  ]);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Catalog Management
        </h1>

        <Link
          href={`/catalog/${createCatalogPathSegment(session?.user?.name, userId)}`}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Go to Catalog
        </Link>
      </div>

      <CategoryOrderManager initialCategories={categories} />

      <CatalogProductTable products={products} />
    </section>
  );
}
