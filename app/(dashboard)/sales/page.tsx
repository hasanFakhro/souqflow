import prisma from "@/lib/prisma";
import SalesAnalytics from "./SalesAnalytics";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const [orders, products] = await Promise.all([
    prisma.order.findMany({
      where: { status: "DONE" },
      orderBy: { orderedAt: "asc" },
      select: {
        id: true,
        orderedAt: true,
        items: {
          select: {
            productId: true,
            category: true,
            productName: true,
            quantity: true,
            unitCost: true,
            unitPrice: true,
          },
        },
      },
    }),
    prisma.product.findMany({
      select: {
        id: true,
        sku: true,
        name: true,
        category: true,
        costPrice: true,
        sellPrice: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue-600">Business intelligence</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Sales analytics</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Track revenue, costs, profit, and the products driving your sales.
        </p>
      </div>
      <SalesAnalytics
        orders={orders.map((order) => ({
          ...order,
          orderedAt: order.orderedAt.toISOString(),
        }))}
        products={products.map((p) => ({
          ...p,
          costPrice: Number(p.costPrice),
          sellPrice: Number(p.sellPrice),
        }))}
      />
    </section>
  );
}
