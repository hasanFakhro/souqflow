import prisma from "@/lib/prisma";
import ProductsGrid from "@/components/ProductsGrid";
import CartBar from "@/components/CartBar";
export default async function DashboardPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },include:{category:true}
  });
  

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <ProductsGrid products={products} />
      <CartBar />
    </section>
  );
}
