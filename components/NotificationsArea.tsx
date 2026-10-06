import { Bell } from "lucide-react";
import type { NotificationHistory } from "@prisma/client";
import NotificationCard from "./NotificationCard";

export default function NotificationsArea({ notifications }: { notifications: NotificationHistory[] }) {
  return (
    <section aria-label="Notifications" className="space-y-3 p-4">
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
        notifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))
      )}
    </section>

  );
}
