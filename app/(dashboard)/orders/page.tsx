import OrderTable from "@/components/OrderTable";
import prisma from "@/lib/prisma";
import { serializeOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: { items: { orderBy: { createdAt: "asc" } } },
    orderBy: { orderedAt: "desc" },
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      <OrderTable orders={orders.map(serializeOrder)} />
    </section>
  );
}
