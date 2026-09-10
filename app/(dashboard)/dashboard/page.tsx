import ProductsGrid from "@/components/ProductsGrid";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <ProductsGrid products={products} />
    </section>
  );
}
