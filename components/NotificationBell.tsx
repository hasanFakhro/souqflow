"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Bell } from "lucide-react";

type Notification = {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [isOpen, setIsOpen] = useState(false);

  const bellRef = useRef<SVGSVGElement>(null);

useEffect(() => {
  async function getNotifications() {
    const response = await axios.get("/api/notifications");

    setNotifications(response.data);
  }

  getNotifications();

  const interval = setInterval(getNotifications, 10 * 60 * 1000);

  return () => clearInterval(interval);
}, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  useEffect(() => {
    if (unreadCount === 0 || !bellRef.current) {
      return;
    }

    const animation = bellRef.current.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(15deg)" },
        { transform: "rotate(-15deg)" },
        { transform: "rotate(12deg)" },
        { transform: "rotate(-12deg)" },
        { transform: "rotate(8deg)" },
        { transform: "rotate(-8deg)" },
        { transform: "rotate(0deg)" },
      ],
      {
        duration: 1000,
        iterations: Infinity,
      },
    );

    return () => {
      animation.cancel();
    };
  }, [unreadCount]);

  async function markAsRead(notificationId: string) {
    await axios.patch("/api/notifications", {
      notificationId,
    });

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              isRead: true,
            }
          : notification,
      ),
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell
          ref={bellRef}
          strokeWidth={2.5}
          className={`h-7 w-7 transition-colors ${
            unreadCount > 0
              ? "text-yellow-500"
              : "text-gray-700"
          }`}
        />

        {unreadCount > 0 && (
          <span
            className="
              absolute
              -right-2
              -top-2
              flex
              h-5
              min-w-5
              items-center
              justify-center
              rounded-full
              bg-red-500
              px-1
              text-xs
              font-semibold
              text-white
            "
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="
            absolute
            right-0
            top-10
            z-50
            w-80
            overflow-hidden
            rounded-xl
            border
            border-gray-200
            bg-white
            shadow-xl
          "
        >
          <div className="border-b border-gray-200 px-4 py-3">
            <h3 className="font-semibold text-gray-900">
              Notifications
            </h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">
                No notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() =>
                    !notification.isRead &&
                    markAsRead(notification.id)
                  }
                  className={`block w-full border-b border-gray-100 px-4 py-3 text-left ${
                    !notification.isRead
                      ? "bg-yellow-50 hover:bg-yellow-100"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <p className="text-sm text-gray-800">
                    {notification.message}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(
                      notification.createdAt,
                    ).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}