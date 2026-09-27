"use client";

import React from "react";
import Image from "next/image";
import { Plus, Check } from "lucide-react";

export interface BuyerProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  category?: { id: string; name: string } | null;
  stock?: number;
}

interface BuyerProductGridProps {
  products: BuyerProduct[];
  onAddToCart: (product: BuyerProduct) => void;
  addedProductIds?: string[];
}

export default function BuyerProductGrid({
  products,
  onAddToCart,
  addedProductIds = [],
}: BuyerProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 border rounded-2xl bg-muted/20">
        <p className="text-base text-muted-foreground">No products found matching your selection.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
      {products.map((product) => {
        const isAdded = addedProductIds.includes(product.id);

        return (
          <div
            key={product.id}
            className="group flex flex-col justify-between overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-muted">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  No Image
                </div>
              )}
              {product.category && (
                <span className="absolute top-2 left-2 rounded-md bg-background/80 backdrop-blur px-2 py-0.5 text-[11px] font-medium text-foreground shadow-sm">
                  {product.category.name}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
              <div className="mb-2">
                <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-1">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm sm:text-base font-bold text-foreground">
                  ${product.price.toFixed(2)}
                </span>

                <button
                  type="button"
                  onClick={() => onAddToCart(product)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                    isAdded
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-accent text-foreground border-input"
                  }`}
                  aria-label="Add to cart"
                >
                  {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}