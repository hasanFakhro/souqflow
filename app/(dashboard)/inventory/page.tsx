import prisma from "@/lib/prisma";
import ProductTable from "@/components/ProductTable";
import { AddProductSection } from "@/components/AddProductButton";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } , include:{category:true}});
  return <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
      <AddProductSection />
    </div>
    <div className="rounded-xl bg-white p-4 shadow-sm"><ProductTable products={products} /></div>
  </section>;
}
