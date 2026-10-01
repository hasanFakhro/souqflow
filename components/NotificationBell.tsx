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

type NotificationResponse = {
  notifications: Notification[];
  unreadCount: number;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [isOpen, setIsOpen] = useState(false);

  const bellRef = useRef<SVGSVGElement>(null);

  async function getNotifications() {
    try {
      const response =
        await axios.get<NotificationResponse>(
          "/api/notifications",
        );

      setNotifications(response.data.notifications);

      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error,
      );
    }
  }

  async function markDisplayedNotificationsAsRead() {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.isRead,
    );

    if (unreadNotifications.length === 0) {
      return;
    }

    try {
      await Promise.all(
        unreadNotifications.map((notification) =>
          axios.patch("/api/notifications", {
            notificationId: notification.id,
          }),
        ),
      );

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      setUnreadCount((currentCount) =>
        Math.max(
          0,
          currentCount - unreadNotifications.length,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to mark notifications as read:",
        error,
      );

      await getNotifications();
    }
  }

  async function handleBellClick() {
    const nextIsOpen = !isOpen;

    setIsOpen(nextIsOpen);

    if (nextIsOpen) {
      await markDisplayedNotificationsAsRead();
    } else {
      await getNotifications();
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getNotifications();

    // Listen for new notifications created elsewhere in the app.
    function handleNotificationCreated() {
      void getNotifications();
    }

    window.addEventListener(
      "notification-created",
      handleNotificationCreated,
    );

    const interval = setInterval(
      getNotifications,
      10 * 60 * 1000,
    );

    return () => {
      window.removeEventListener(
        "notification-created",
        handleNotificationCreated,
      );

      clearInterval(interval);
    };
  }, []);

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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleBellClick}
        className="relative mr-10 -translate-y-3"
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
            {unreadCount > 99 ? "99+" : unreadCount}
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
                No new notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="block w-full border-b border-gray-100 bg-white px-4 py-3 text-left"
                >
                  <p className="text-sm text-gray-800">
                    {notification.message}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(
                      notification.createdAt,
                    ).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}