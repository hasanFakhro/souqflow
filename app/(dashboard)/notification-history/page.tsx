import {
  Bell,
  Package,
  Clock,
  ShoppingCart,
  CreditCard,
} from "lucide-react";

import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";

type NotificationFilter =
  | "ALL"
  | "LOW_STOCK"
  | "ORDER"
  | "SUBSCRIPTION";

const NOTIFICATIONS_PER_PAGE = 7;

function getNotificationType(type: string) {
  switch (type) {
    case "LOW_STOCK":
      return {
        label: "Low Stock",
        icon: Package,
        iconStyle: "bg-yellow-100 text-yellow-600",
        badgeStyle:
          "bg-yellow-50 text-yellow-700 border-yellow-200",
      };

    case "ORDER":
      return {
        label: "Order",
        icon: ShoppingCart,
        iconStyle: "bg-blue-100 text-blue-600",
        badgeStyle:
          "bg-blue-50 text-blue-700 border-blue-200",
      };

    case "SUBSCRIPTION":
      return {
        label: "Subscription",
        icon: CreditCard,
        iconStyle: "bg-purple-100 text-purple-600",
        badgeStyle:
          "bg-purple-50 text-purple-700 border-purple-200",
      };

    default:
      return {
        label: "Notification",
        icon: Bell,
        iconStyle: "bg-gray-100 text-gray-600",
        badgeStyle:
          "bg-gray-50 text-gray-700 border-gray-200",
      };
  }
}

function isValidFilter(
  type: string | undefined,
): type is NotificationFilter {
  return (
    type === "ALL" ||
    type === "LOW_STOCK" ||
    type === "ORDER" ||
    type === "SUBSCRIPTION"
  );
}

export default async function NotificationHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    page?: string;
  }>;
}) {
  const session = await auth();

  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const params = await searchParams;

  const selectedType: NotificationFilter =
    isValidFilter(params.type)
      ? params.type
      : "ALL";

  const requestedPage = Number(params.page);

  const currentPage =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const where = {
    userId,
    ...(selectedType !== "ALL"
      ? {
          type: selectedType,
        }
      : {}),
  };

  const totalNotifications =
    await prisma.notificationHistory.count({
      where,
    });

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalNotifications / NOTIFICATIONS_PER_PAGE,
    ),
  );

  const page =
    currentPage > totalPages
      ? totalPages
      : currentPage;

  const skip =
    (page - 1) * NOTIFICATIONS_PER_PAGE;

  const notifications =
    await prisma.notificationHistory.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: NOTIFICATIONS_PER_PAGE,
    });

  const filters = [
    {
      label: "All",
      value: "ALL",
    },
    {
      label: "Low Stock",
      value: "LOW_STOCK",
    },
    {
      label: "Orders",
      value: "ORDER",
    },
    {
      label: "Subscriptions",
      value: "SUBSCRIPTION",
    },
  ] as const;

  function getFilterUrl(
    filter: NotificationFilter,
  ) {
    if (filter === "ALL") {
      return "/notification-history";
    }

    return `/notification-history?type=${filter}`;
  }

  function getPageUrl(pageNumber: number) {
    const params = new URLSearchParams();

    if (selectedType !== "ALL") {
      params.set("type", selectedType);
    }

    params.set("page", pageNumber.toString());

    return `/notification-history?${params.toString()}`;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-sm">
            <Bell className="h-5 w-5" />
          </span>

          <div>
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
              Notification History
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View your previous notifications and activity.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Previous Notifications
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your notification history is stored here.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <a
                  key={filter.value}
                  href={getFilterUrl(filter.value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    selectedType === filter.value
                      ? "border-purple-200 bg-gradient-to-r from-blue-50 via-purple-50 to-white text-purple-700 shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {filter.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {notifications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <Bell className="h-6 w-6" />
              </div>

              <p className="mt-4 text-sm font-medium text-gray-700">
                No notification history
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Your previous notifications will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const notificationType =
                getNotificationType(notification.type);

              const Icon = notificationType.icon;

              return (
                <div
                  key={notification.id}
                  className="flex items-start gap-4 px-6 py-5 transition-colors hover:bg-gray-50"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notificationType.iconStyle}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${notificationType.badgeStyle}`}
                      >
                        {notificationType.label}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-medium text-gray-800">
                      {notification.message}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="h-3.5 w-3.5" />

                      <span>
                        {notification.createdAt.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalNotifications > NOTIFICATIONS_PER_PAGE && (
          <div className="flex items-center justify-center gap-2 border-t border-gray-100 px-6 py-4">
            <a
              href={page > 1 ? getPageUrl(page - 1) : "#"}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                page > 1
                  ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  : "pointer-events-none border-gray-100 bg-gray-50 text-gray-300"
              }`}
            >
              Previous
            </a>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1,
            ).map((pageNumber) => (
              <a
                key={pageNumber}
                href={getPageUrl(pageNumber)}
                className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors ${
                  page === pageNumber
                    ? "border-purple-200 bg-gradient-to-r from-blue-50 via-purple-50 to-white text-purple-700 shadow-sm"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {pageNumber}
              </a>
            ))}

            <a
              href={
                page < totalPages
                  ? getPageUrl(page + 1)
                  : "#"
              }
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                page < totalPages
                  ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  : "pointer-events-none border-gray-100 bg-gray-50 text-gray-300"
              }`}
            >
              Next
            </a>
          </div>
        )}
      </div>
    </div>
  );
}