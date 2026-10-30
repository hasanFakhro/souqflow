import { Bell, Package, Clock, ShoppingCart, CreditCard } from "lucide-react";
import type { NotificationHistory } from "@prisma/client";

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

export default function NotificationCard({ notification }: { notification: NotificationHistory }) {
  const notificationType =
    getNotificationType(notification.type);

  const Icon = notificationType.icon;

  return (
    <article
      className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm"
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
    </article>
  );
}
