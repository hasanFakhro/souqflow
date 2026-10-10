/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Package, X } from "lucide-react";

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

export default function OrderCustomerNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const iconRef = useRef<SVGSVGElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const processedNotificationIds = useRef<Set<string>>(new Set());

  async function getNotifications() {
    try {
      const response =
        await axios.get<NotificationResponse>(
          "/api/notifications/orderCustomer",
        );

      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error(
        "Failed to load order notifications:",
        error,
      );
    }
  }

  async function markNotificationAsRead(
    notificationId: string,
  ) {
    if (
      processedNotificationIds.current.has(
        notificationId,
      )
    ) {
      return;
    }

    processedNotificationIds.current.add(
      notificationId,
    );

    try {
      await axios.patch(
        "/api/notifications/orderCustomer",
        {
          notificationId,
        },
      );

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

      setUnreadCount((currentCount) =>
        Math.max(0, currentCount - 1),
      );
    } catch (error) {
      processedNotificationIds.current.delete(
        notificationId,
      );

      console.error(
        "Failed to mark order notification as read:",
        error,
      );
    }
  }

  function getVisibleNotificationIds() {
    if (!containerRef.current) {
      return [];
    }

    const container =
      containerRef.current.querySelector(
        "[data-notification-list]",
      );

    if (!(container instanceof HTMLElement)) {
      return [];
    }

    const notificationElements =
      container.querySelectorAll<HTMLElement>(
        "[data-notification-id]",
      );

    const containerRect =
      container.getBoundingClientRect();

    const visibleIds: string[] = [];

    notificationElements.forEach((element) => {
      const rect = element.getBoundingClientRect();

      const isVisible =
        rect.bottom > containerRect.top &&
        rect.top < containerRect.bottom;

      if (isVisible) {
        const notificationId =
          element.dataset.notificationId;

        if (notificationId) {
          visibleIds.push(notificationId);
        }
      }
    });

    return visibleIds;
  }

  async function markVisibleNotificationsAsRead() {
    const visibleIds =
      getVisibleNotificationIds();

    if (visibleIds.length === 0) {
      return;
    }

    await Promise.all(
      visibleIds.map((notificationId) =>
        markNotificationAsRead(notificationId),
      ),
    );
  }

  function handleScroll() {
    if (!isOpen) {
      return;
    }

    void markVisibleNotificationsAsRead();
  }

  function handlePackageClick() {
    if (!isOpen) {
      setIsOpen(true);

      setTimeout(() => {
        void markVisibleNotificationsAsRead();
      }, 0);

      return;
    }

    setNotifications((currentNotifications) =>
      currentNotifications.filter(
        (notification) => !notification.isRead,
      ),
    );

    setIsOpen(false);
  }

  useEffect(() => {
    void getNotifications();

    function handleNotificationCreated() {
      if (!isOpen) {
        void getNotifications();
      }
    }

    window.addEventListener(
      "notification-created",
      handleNotificationCreated,
    );

    const interval = setInterval(() => {
      if (!isOpen) {
        void getNotifications();
      }
    }, 10 * 60 * 1000);

    return () => {
      window.removeEventListener(
        "notification-created",
        handleNotificationCreated,
      );

      clearInterval(interval);
    };
  }, [isOpen]);

  useEffect(() => {
    if (unreadCount === 0 || !iconRef.current) {
      return;
    }

    const animation = iconRef.current.animate(
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


  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        if (isOpen) {
          setNotifications(
            (currentNotifications) =>
              currentNotifications.filter(
                (notification) =>
                  !notification.isRead,
              ),
          );

          setIsOpen(false);
        }
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        onClick={handlePackageClick}
        aria-label="Orders"
        className="
          relative
          flex h-10 w-10
          items-center justify-center
          rounded-full
          transition-colors
          hover:bg-gray-100
        "
      >
        <Package
          ref={iconRef}
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
            {unreadCount > 99
              ? "99+"
              : unreadCount}
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
            onClick={handlePackageClick}
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
                  Orders
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
                      ? "order"
                      : "orders"}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handlePackageClick}
                aria-label="Close orders"
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
              data-notification-list
              onScroll={handleScroll}
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
                    <Package
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
                    No new orders
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
                notifications.map(
                  (notification) => (
                    <div
                      key={notification.id}
                      data-notification-id={
                        notification.id
                      }
                      className="
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
                          <Package
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
                  ),
                )
              )}
            </div>

            <Link
              href="/orders?view=requests"
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
              View orders →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
