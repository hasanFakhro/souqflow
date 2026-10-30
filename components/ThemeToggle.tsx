"use client";

import { Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const themeStorageKey = "souqflow-theme";
const dashboardPaths = [
  "/dashboard",
  "/inventory",
  "/orders",
  "/sales",
  "/settings",
  "/catalog-management",
  "/notification-history",
];

type Theme = "light" | "dark";
type ThemeToggleProps = {
  className?: string;
  hideOnDashboard?: boolean;
  showLabel?: boolean;
  variant?: "surface" | "ghost";
};

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function getServerTheme(): Theme {
  return "light";
}

export function subscribeToTheme(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === themeStorageKey || event.key === null) {
      applyTheme(event.newValue === "dark" ? "dark" : "light");
    }
  }
  window.addEventListener("storage", handleStorage);
  window.addEventListener("souqflow-theme-change", onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("souqflow-theme-change", onStoreChange);
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.dispatchEvent(new Event("souqflow-theme-change"));
}

function isDashboardPath(pathname: string) {
  return dashboardPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function useTheme() {
  return useSyncExternalStore(subscribeToTheme, getTheme, getServerTheme);
}

export default function ThemeToggle({
  className = "",
  hideOnDashboard = false,
  showLabel = false,
  variant = "surface",
}: ThemeToggleProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const isDark = theme === "dark";
  const label = `Switch to ${isDark ? "light" : "dark"} mode`;

  if (hideOnDashboard && isDashboardPath(pathname)) {
    return null;
  }

  function toggleTheme() {
    const nextTheme: Theme = isDark ? "light" : "dark";

    applyTheme(nextTheme);
    try {
      window.localStorage.setItem(themeStorageKey, nextTheme);
    } catch {
      // The theme still works when the browser blocks local storage.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-xl text-gray-700 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
        showLabel ? "min-h-10 w-full justify-start gap-2 px-3 py-2 text-sm font-medium" : "h-10 w-10"
      } ${
        variant === "surface"
          ? "border border-gray-200 bg-white shadow-lg shadow-blue-100/40 hover:bg-blue-50 hover:text-blue-700"
          : "border border-transparent bg-transparent hover:bg-blue-50 hover:text-blue-700"
      } ${className}`}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      <span className={showLabel ? "" : "sr-only"}>{label}</span>
    </button>
  );
}
