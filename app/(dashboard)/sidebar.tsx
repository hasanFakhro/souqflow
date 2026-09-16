"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {ArrowLeftRight,LayoutDashboard,LogOut,Menu,Package,Settings,ShoppingCart,TrendingUp,Wallet,X} from "lucide-react";
import { toggleCurrency, useCurrency } from "./currency";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/sales", label: "Sales", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

function Sidebar() {
  const pathname = usePathname();
  const currency = useCurrency();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await signOut({ redirectTo: "/signin" });
    } catch {
      setLogoutError("Could not log out. Please try again.");
      setIsLoggingOut(false);
    }
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 shadow-sm md:hidden">
        <Link
          href="/dashboard"
          onClick={closeMobileMenu}
          className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent"
        >
          SouqFlow
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          className="rounded-lg p-2 text-gray-600 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="border-b border-gray-100 bg-white px-5 pb-5 shadow-lg md:hidden">
          <nav aria-label="Mobile navigation" className="space-y-2">
            {links.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobileMenu}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  <Icon size={20} aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 border-t border-gray-100 pt-4">
            <button
              type="button"
              aria-label={`Change currency to ${
                currency === "USD" ? "Lebanese lira" : "US dollars"
              }`}
              onClick={toggleCurrency}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              <Wallet size={20} aria-hidden="true" />

              <span className="flex-1">
                Change currency
                <span className="block text-xs text-gray-400">
                  {currency === "USD" ? "USD ($)" : "Lebanese lira (LL)"}
                </span>
              </span>

              <ArrowLeftRight size={16} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 disabled:cursor-wait disabled:opacity-60"
            >
              <LogOut size={20} aria-hidden="true" />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </button>

            {logoutError && (
              <p role="alert" className="mt-2 px-3 text-xs text-red-600">
                {logoutError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden flex-col border-r border-gray-100 bg-white p-5 shadow-xl shadow-blue-100/40 md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:overflow-y-auto">
        <Link
          href="/dashboard"
          className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent"
        >
          SouqFlow
        </Link>

        <nav aria-label="Main navigation" className="mt-8 space-y-2">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-purple-700"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <Icon size={20} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-gray-100 pt-4">
          <button
            type="button"
            aria-label={`Change currency to ${
              currency === "USD" ? "Lebanese lira" : "US dollars"
            }`}
            onClick={toggleCurrency}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <Wallet size={20} aria-hidden="true" />

            <span className="flex-1">
              Change currency
              <span className="block text-xs text-gray-400">
                {currency === "USD" ? "USD ($)" : "Lebanese lira (LL)"}
              </span>
            </span>

            <ArrowLeftRight size={16} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 disabled:cursor-wait disabled:opacity-60"
          >
            <LogOut size={20} aria-hidden="true" />
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>

          {logoutError && (
            <p role="alert" className="mt-2 px-3 text-xs text-red-600">
              {logoutError}
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
