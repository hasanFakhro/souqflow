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
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Business Info: Name & Description */}
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
            {businessName}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
              {description}
            </p>
          )}
        </div>

        {/* Cart Action */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label="Open Cart"
            className="relative flex items-center justify-center p-2.5 rounded-full border bg-card hover:bg-accent text-foreground transition-colors shadow-sm"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground shadow">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}