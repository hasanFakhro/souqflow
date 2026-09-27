"use client";

import React from "react";
import { ArrowDownNarrowWide, ArrowUpNarrowWide, SlidersHorizontal } from "lucide-react";

export type PriceSortOrder = "asc" | "desc" | "none";

export interface CategoryOption {
  id: string;
  name: string;
}

interface BuyerFilterBarProps {
  categories: CategoryOption[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  priceSort: PriceSortOrder;
  onPriceSortChange: (sort: PriceSortOrder) => void;
}

export default function BuyerFilterBar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  priceSort,
  onPriceSortChange,
}: BuyerFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-4 border-b border-gray-200">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategoryId === null
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-500"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategoryId === cat.id
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-500"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <div className="relative inline-flex items-center">
          <label htmlFor="price-sort" className="sr-only">
            Sort by Price
          </label>
          <div className="pointer-events-none absolute left-3 flex items-center text-gray-500">
            {priceSort === "asc" ? (
              <ArrowDownNarrowWide className="w-4 h-4 text-blue-600" />
            ) : priceSort === "desc" ? (
              <ArrowUpNarrowWide className="w-4 h-4 text-blue-600" />
            ) : (
              <SlidersHorizontal className="w-4 h-4" />
            )}
          </div>
          <select
            id="price-sort"
            value={priceSort}
            onChange={(e) => onPriceSortChange(e.target.value as PriceSortOrder)}
            className="h-9 rounded-lg border border-gray-300 bg-white pl-9 pr-8 text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
          >
            <option value="none">Featured</option>
            <option value="asc">Price: Low to High (Cheapest)</option>
            <option value="desc">Price: High to Low (Most Expensive)</option>
          </select>
        </div>
      </div>
    </div>
  );
}