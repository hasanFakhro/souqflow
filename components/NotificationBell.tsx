/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Bell, X } from "lucide-react";

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const bellRef = useRef<SVGSVGElement>(null);

  async function getNotifications() {
    try {
      const response =
        await axios.get<NotificationResponse>("/api/notifications");

      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Failed to load notifications:", error);
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
        Math.max(0, currentCount - unreadNotifications.length),
      );
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);

      await getNotifications();
    }
  }

  async function handleBellClick() {
    if (!isOpen) {
      setIsOpen(true);
      await markDisplayedNotificationsAsRead();
      return;
    }

    setIsOpen(false);
    await getNotifications();
  }

  async function handleClose() {
    setIsOpen(false);
    await getNotifications();
  }

  useEffect(() => {
    void getNotifications();

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
        aria-label="Notifications"
        className="
          relative
          flex h-10 w-10
          items-center justify-center
          rounded-full
          transition-colors
          hover:bg-gray-100
        "
      >
        <Bell
          ref={bellRef}
          strokeWidth={2}
          className={`
            h-5 w-5
            transition-colors
            ${
              unreadCount > 0
                ? "text-yellow-500"
                : "text-gray-400"
            }
          `}
        />

        {unreadCount > 0 && (
          <span
            className="
              absolute
              right-0 top-0
              flex h-5 min-w-5
              items-center justify-center
              rounded-full
              bg-red-500
              px-1
              text-xs font-semibold
              text-white
            "
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="
              fixed
              inset-x-0
              bottom-0
              top-28
              z-40
              md:hidden
            "
            onClick={handleClose}
          />

          <div
            className="
              fixed
              left-4
              right-4
              top-32
              z-50
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-white
              shadow-2xl

              md:absolute
              md:left-auto
              md:right-0
              md:top-10
              md:w-80
              md:rounded-xl
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-gray-200
                px-4
                py-3
              "
            >
              <div>
                <h3
                  className="
                    font-semibold
                    text-gray-900
                  "
                >
                  Notifications
                </h3>

                {unreadCount > 0 && (
                  <p
                    className="
                      mt-0.5
                      text-xs
                      text-gray-500
                    "
                  >
                    {unreadCount} new{" "}
                    {unreadCount === 1
                      ? "notification"
                      : "notifications"}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close notifications"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  text-gray-500
                  transition
                  hover:bg-gray-100
                  hover:text-gray-800
                "
              >
                <X size={18} />
              </button>
            </div>

            <div
              className="
                max-h-[320px]
                overflow-y-auto
              "
            >
              {notifications.length === 0 ? (
                <div
                  className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    px-6
                    py-8
                    text-center
                  "
                >
                  <div
                    className="
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-gray-100
                    "
                  >
                    <Bell
                      size={30}
                      strokeWidth={1.7}
                      className="
                        text-gray-400
                      "
                    />
                  </div>

                  <p
                    className="
                      mt-3
                      font-medium
                      text-gray-800
                    "
                  >
                    No new notifications
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-gray-400
                    "
                  >
                    You&apos;re all caught up.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="
                      block
                      w-full
                      border-b
                      border-gray-100
                      bg-white
                      px-4
                      py-3
                      text-left
                      transition
                      last:border-b-0
                      hover:bg-gray-50
                    "
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-amber-50
                        "
                      >
                        <Bell
                          size={18}
                          className="
                            text-amber-500
                          "
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className="
                            text-sm
                            leading-5
                            text-gray-800
                          "
                        >
                          {notification.message}
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-gray-400
                          "
                        >
                          {new Date(
                            notification.createdAt,
                          ).toLocaleString()}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <span
                          className="
                            mt-2
                            h-2
                            w-2
                            shrink-0
                            rounded-full
                            bg-violet-500
                          "
                        />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/inventory"
              onClick={() => setIsOpen(false)}
              className="
                flex
                items-center
                justify-center
                border-t
                border-gray-200
                bg-white
                px-4
                py-3
                text-sm
                font-medium
                text-violet-600
                transition
                hover:bg-gray-50
                hover:text-violet-700
              "
            >
              View inventory →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
