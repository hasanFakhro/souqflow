import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ProductsGrid from "@/components/ProductsGrid";
import CartBar from "@/components/CartBar";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/signin");
  }

  const products = await prisma.product.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="lg:flex lg:items-start lg:min-h-screen">
      <section className="flex-1 min-w-0 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <ProductsGrid products={products} />
      </section>
      <CartBar />
    </div>
  );
}