import { randomUUID } from "node:crypto";

import { auth } from "@/lib/auth";
import OrderTable from "@/components/OrderTable";
import prisma from "@/lib/prisma";
import { serializeOrder } from "@/lib/orders";
import { orderStates, type OrderState } from "@/lib/order-state";
import {
  filterOrderIndex,
  orderPage,
  ordersPerPage,
  preloadedOrderPages,
} from "@/lib/order-pagination";
import { redirect } from "next/navigation";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    state?: string;
    view?: string;
  }>;
}) {
  const [session, params] = await Promise.all([
    auth(),
    searchParams,
  ]);

  const userId = session?.user?.id;

  if (!userId) {
    redirect("/signin");
  }

  const search =
    typeof params.search === "string"
      ? params.search
      : "";

  const state = orderStates.includes(
    params.state as OrderState
  )
    ? (params.state as OrderState)
    : "ALL";

  // Search uses this compact index; full details load only as needed.
  const summaries = await prisma.order.findMany({
    where: {
      ownerId: userId,
    },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      status: true,
      source: true,
      items: {
        select: {
          productName: true,
          category: true,
        },
      },
    },
    orderBy: [
      { orderedAt: "desc" },
      { id: "desc" },
    ],
  });

  const index = summaries.map((order) => ({
    id: order.id,
    status: order.status,
    source: order.source,
    searchText: [
      order.orderNumber,
      order.customerName,
      ...order.items.flatMap((item) => [
        item.productName,
        item.category,
      ]),
    ]
      .filter(Boolean)
      .join("\n")
      .toLowerCase(),
  }));

  const matches = filterOrderIndex(
    index,
    search,
    state,
    params.view === "requests" ? "STOREFRONT" : "MANUAL"
  );

  const { firstPageSize } = orderPage(
    matches.length,
    1
  );

  const ids = matches
    .slice(
      0,
      firstPageSize +
        (preloadedOrderPages - 1) *
          ordersPerPage
    )
    .map((order) => order.id);

  const orders = ids.length
    ? await prisma.order.findMany({
        where: {
          id: {
            in: ids,
          },
          ownerId: userId,
        },
        include: {
          items: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      })
    : [];

  return (
    <section className="min-w-0 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Orders
      </h1>

      {/* A refresh after a mutation replaces the snapshot and its page cache. */}
      <OrderTable
        key={randomUUID()}
        index={index}
        initialOrders={orders.map(serializeOrder)}
      />
    </section>
  );
}
