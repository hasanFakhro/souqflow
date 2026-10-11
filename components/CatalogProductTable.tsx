"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, ImageOff, Loader2, Star } from "lucide-react";
import { ProductData } from "./ProductsGrid";

type CatalogProductTableProps = {
  products: ProductData[];
};

type ProductUpdate = {
  isHidden?: boolean;
  isPopular?: boolean;
  catalogOrder?: number;
};

const badgeTones = {
  green: "border-green-200 bg-green-50 text-green-700",
  red: "border-red-200 bg-red-50 text-red-700",
  gray: "border-gray-200 bg-gray-100 text-gray-600",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
} as const;

function Badge({
  tone,
  children,
}: {
  tone: keyof typeof badgeTones;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeTones[tone]}`}
    >
      {children}
    </span>
  );
}

export default function CatalogProductTable({
  products,
}: CatalogProductTableProps) {
  const [productList, setProductList] = useState(products);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderDrafts, setOrderDrafts] = useState<Record<string, string>>({});

  const sortedProducts = useMemo(
    () =>
      [...productList].sort(
        (a, b) =>
          (a.catalogOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.catalogOrder ?? Number.MAX_SAFE_INTEGER)
      ),
    [productList]
  );

  const stats = {
    total: productList.length,
    visible: productList.filter((p) => !p.isHidden).length,
    hidden: productList.filter((p) => p.isHidden).length,
    popular: productList.filter((p) => p.isPopular).length,
  };

  function clearDraft(productId: string) {
    setOrderDrafts((drafts) => {
      const rest = { ...drafts };
      delete rest[productId];
      return rest;
    });
  }

  async function updateProduct(productId: string, update: ProductUpdate) {
    try {
      setLoadingId(productId);
      setError(null);

      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update product");
        return;
      }

      setProductList((current) =>
        current.map((product) =>
          product.id === productId ? { ...product, ...update } : product
        )
      );
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoadingId(null);
      clearDraft(productId);
    }
  }

  function handleOrderBlur(product: ProductData) {
    const draft = orderDrafts[product.id];
    if (draft === undefined) return;

    const value = Number(draft);

    if (
      !Number.isInteger(value) ||
      value < 1 ||
      value === product.catalogOrder
    ) {
      clearDraft(product.id);
      return;
    }

    updateProduct(product.id, { catalogOrder: value });
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
        <Badge tone="gray">{stats.total} products</Badge>
        <Badge tone="green">{stats.visible} visible</Badge>
        <Badge tone="gray">{stats.hidden} hidden</Badge>
        <Badge tone="blue">{stats.popular} popular</Badge>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="font-medium hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Visibility</th>
              <th className="px-4 py-3 font-semibold">Popular</th>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {sortedProducts.map((product) => {
              const isLoading = loadingId === product.id;
              const isOutOfStock = product.quantity <= 0;

              return (
                <tr
                  key={product.id}
                  className={`transition hover:bg-gray-50 ${
                    product.isHidden ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={48}
                          height={48}
                          unoptimized
                          className="h-12 w-12 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                          <ImageOff className="h-5 w-5" />
                        </div>
                      )}
                      <div className="w-36 min-w-0 sm:w-48">
                        <p className="truncate font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="truncate text-sm text-gray-500">
                          {product.category?.name || "No category"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">
                    {isOutOfStock ? (
                      <Badge tone="red">Out of stock</Badge>
                    ) : (
                      <Badge tone="green">In stock</Badge>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {product.isHidden ? (
                      <Badge tone="gray">Hidden</Badge>
                    ) : (
                      <Badge tone="green">Visible</Badge>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <Star
                      className={`h-5 w-5 ${
                        product.isPopular
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                      aria-label={
                        product.isPopular ? "Popular" : "Not popular"
                      }
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      disabled={isLoading}
                      value={
                        orderDrafts[product.id] ??
                        (product.catalogOrder ? String(product.catalogOrder) : "")
                      }
                      onChange={(e) =>
                        setOrderDrafts((drafts) => ({
                          ...drafts,
                          [product.id]: e.target.value,
                        }))
                      }
                      onBlur={() => handleOrderBlur(product)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                      }}
                      className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      )}

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          updateProduct(product.id, {
                            isHidden: !product.isHidden,
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {product.isHidden ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                        {product.isHidden ? "Show" : "Hide"}
                      </button>

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          updateProduct(product.id, {
                            isPopular: !product.isPopular,
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-md border border-blue-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Star className="h-4 w-4" />
                        {product.isPopular ? "Unmark" : "Popular"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedProducts.length === 0 && (
          <p className="py-10 text-center text-gray-500">
            No products found.
          </p>
        )}
      </div>
    </div>
  );
}
