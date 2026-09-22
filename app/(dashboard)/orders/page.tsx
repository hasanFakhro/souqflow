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

  // Measure orders query.
  console.time("ORDERS findMany");

  const orders = await prisma.order.findMany({
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
  });

  console.timeEnd("ORDERS findMany");

  // Measure count query.
  console.time("ORDERS count");

  const totalOrders = await prisma.order.count();

  console.timeEnd("ORDERS count");

  // Measure serialization.
  console.time("ORDERS serialize");

  const serializedOrders = orders.map(serializeOrder);

  console.timeEnd("ORDERS serialize");

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