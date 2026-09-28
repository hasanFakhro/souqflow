"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";

interface BuyerHeaderProps {
  businessName: string;
  description?: string;
  cartCount: number;
  onOpenCart?: () => void;
}

export default function BuyerHeader({
  businessName,
  description,
  cartCount,
  onOpenCart,
}: BuyerHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 truncate">
            {businessName}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label="Open Cart"
            className="relative flex items-center justify-center p-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity shadow-sm"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-600 text-[11px] font-semibold shadow ring-2 ring-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}