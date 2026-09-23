import { auth } from "@/lib/auth";
import OrderTable from "@/components/OrderTable";
import prisma from "@/lib/prisma";
import { serializeOrder } from "@/lib/orders";
import { redirect } from "next/navigation";

const pageSize = 6;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/signin");
  }

  const requestedPage = Number(params.page) || 1;
  const page = Math.max(requestedPage, 1);

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      where: { ownerId: userId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        items: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { orderedAt: "desc" },
    }),
    prisma.order.count({ where: { ownerId: userId } }),
  ]);

  const totalPages = Math.ceil(totalOrders / pageSize);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      <OrderTable
        orders={orders.map(serializeOrder)}
        currentPage={page}
        totalPages={totalPages}
        totalOrders={totalOrders}
      />
    </section>
  );
}
