import { Bell } from "lucide-react";
import { Prisma } from "@prisma/client";
import NotificationsArea from "@/components/NotificationsArea";

import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";

type NotificationFilter =
  | "ALL"
  | "LOW_STOCK"
  | "ORDER"
  | "SUBSCRIPTION";

const NOTIFICATIONS_PER_PAGE = 7;

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
    q?: string;
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

  const searchTerm = params.q?.trim() ?? "";

  const requestedPage = Number(params.page);

  const currentPage =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const where: Prisma.NotificationHistoryWhereInput = {
    userId,
    ...(searchTerm ? { message: { contains: searchTerm, mode: "insensitive" } } : {}),
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
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("type", filter);
    if (searchTerm) params.set("q", searchTerm);
    return `/notification-history?${params.toString()}`;
  }

  function getPageUrl(pageNumber: number) {
    const params = new URLSearchParams();

    if (selectedType !== "ALL") {
      params.set("type", selectedType);
    }

    if (searchTerm) params.set("q", searchTerm);
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
          <form action="/notification-history" className="mb-4 flex gap-2">
            {selectedType !== "ALL" && <input type="hidden" name="type" value={selectedType} />}
            <input type="search" name="q" defaultValue={searchTerm} aria-label="Search notifications" placeholder="Search notifications?" className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">Search</button>
          </form>
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
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {filter.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <NotificationsArea notifications={notifications} />

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
