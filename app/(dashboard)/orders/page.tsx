import OrderTable from "@/components/OrderTable";

import prisma from "@/lib/prisma";

import { serializeOrder } from "@/lib/orders";

const pageSize = 6;


export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
  }>;
}) {
  const params = await searchParams;

  const requestedPage = Number(params.page) || 1;

  const page = Math.max(requestedPage, 1);

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,

      include: {
        items: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },

      orderBy: {
        orderedAt: "desc",
      },
    }),
    prisma.order.count(),
  ]);

  const serializedOrders = orders.map(serializeOrder);

  const totalPages = Math.ceil(
    totalOrders / pageSize,
  );

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Orders
      </h1>

      <OrderTable
        orders={serializedOrders}
        currentPage={page}
        totalPages={totalPages}
        totalOrders={totalOrders}
      />
    </section>
  );
}