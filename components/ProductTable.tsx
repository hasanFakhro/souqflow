"use client";
import { useSiteDialogs } from "@/components/SiteDialogs";
import { Price } from "@/app/(dashboard)/currency";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Trash2 } from "lucide-react";

import { EditProductSection } from "./EditProductButton";
import { ProductData } from "./ProductsGrid";
import FilterSelect from "./FilterSelect";


type ProductTableProps = {
  products: ProductData[];
};

export default function ProductTable({
  products,
}: ProductTableProps) {
  const router = useRouter();
  const { alert, confirm, prompt } = useSiteDialogs();

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [stockState, setStockState] = useState<string | null>(null);
  const [showLowStock, setShowLowStock] = useState(false);

  const categoriesSet = new Set(
    products
      .map((product) => product.category?.name)
      .filter(
        (category): category is string => Boolean(category)
      )
  );

  const categoriesList = [...categoriesSet];

  const lowStockProducts = products.filter(
    (product) =>
      product.quantity <= 0 ||
      (product.lowStockAt !== null &&
        product.quantity > 0 &&
        product.quantity <= product.lowStockAt)
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch = [product.name, product.sku].filter(Boolean).join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      category === null || product.category?.name === category;

    const matchesStock =
      stockState === null ||
      (stockState === "out" && product.quantity <= 0) ||
      (stockState === "low" &&
        product.quantity > 0 &&
        product.lowStockAt !== null &&
        product.quantity <= product.lowStockAt) ||
      (stockState === "stocked" &&
        (product.quantity > 0 && (product.lowStockAt === null ||
          product.quantity > product.lowStockAt)));

    return matchesSearch && matchesCategory && matchesStock;
  });

  async function handleDelete(id: string) {
    const confirmed = await confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Failed to delete product");
      return;
    }

    router.refresh();
  }


  async function handleRestock(id: string) {
    const amount = await prompt("How many units would you like to add?");

    if (amount === null) return;

    const quantity = Number(amount);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      alert("Please enter a valid positive whole number.");
      return;
    }

    const response = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: quantity,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || "Failed to restock product");
      return;
    }

    router.refresh();
  }


  return (
    <div className="min-w-0">
      {lowStockProducts.length > 0 && (
        <button
          type="button"
          onClick={() => setShowLowStock(true)}
          className="mb-4 flex w-full items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left transition hover:bg-red-100"
        >
          <div>
            <p className="font-semibold text-red-800">
              Low stock alert
            </p>

            <p className="text-sm text-red-600">
              {lowStockProducts.length === 0
                ? "All products are sufficiently stocked."
                : `${lowStockProducts.length} product${lowStockProducts.length === 1 ? "" : "s"
                } need${lowStockProducts.length === 1 ? "s" : ""
                } restocking.`}
            </p>
          </div>

          <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">
            {lowStockProducts.length}
          </span>
        </button>
      )}

      <div className="mb-4 flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products or SKU..."
          aria-label="Search products"
          className="h-11 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-base sm:text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 xl:flex-1"
          />

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:w-96 xl:shrink-0">
        <FilterSelect
          value={category ?? ""}
          onChange={(e) =>
            setCategory(
              e.target.value === "" ? null : e.target.value
            )
          }
          aria-label="Filter by category"
        >
          <option value="">All categories</option>

          {categoriesList.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          value={stockState ?? ""}
          onChange={(e) =>
            setStockState(
              e.target.value === "" ? null : e.target.value
            )
          }
          aria-label="Filter by stock state"
        >
          <option value="">All stock states</option>
          <option value="stocked">Stocked</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </FilterSelect>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="px-4 py-3 font-semibold text-gray-700">
                Image
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Name
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                SKU
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Category
              </th>

               <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                Color / Size
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Cost
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Price
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Quantity
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Limit
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                State
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="table-row-hover border-b border-gray-100 transition-colors hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                      No image
                    </div>
                  )}
                </td>

                <td className="px-4 py-4 font-medium text-gray-900">
                  {product.name}
                </td>

                <td className="px-4 py-4 text-gray-600 font-mono whitespace-nowrap">
                  {product.sku || "-"}
                </td>


                <td className="px-4 py-4 text-gray-600">
                  {product.category?.name || "-"}
                </td>

                <td className="px-4 py-4 text-gray-600">
                  {product.color || product.size
                    ? [product.color, product.size].filter(Boolean).join(" / ")
                    : "-"}
                </td>

                <td className="px-4 py-4 text-gray-600">
                  <Price amountUsd={product.costPrice} />
                </td>

                <td className="px-4 py-4 text-gray-600">
                  <Price amountUsd={product.sellPrice} />
                </td>

                <td className="px-4 py-4 text-gray-600">
                  {product.quantity}
                </td>

                <td className="px-4 py-3">
                  {product.lowStockAt ?? "-"}
                </td>

                <td className="px-4 py-3">
                  {product.quantity <= 0 ? (
                    <span className="inline-flex rounded-md border border-red-200 bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                      Out of stock
                    </span>
                  ) : product.lowStockAt !== null && product.quantity <= product.lowStockAt ? (
                    <span className="inline-flex rounded-md border border-yellow-300 bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                      Low stock
                    </span>
                  ) : (
                    <span className="inline-flex rounded-md border border-green-200 bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                      Stocked
                    </span>
                  )}
                </td>

                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <EditProductSection product={product} />


                    <button
                      onClick={() => handleRestock(product.id)}
                      title="Restock product"
                      aria-label="Restock product"
                      className="rounded-md p-2 text-green-600 transition hover:bg-green-50"
                    >
                      <RefreshCw size={18} />
                    </button>


                    <button
                      onClick={() => handleDelete(product.id)}
                      title="Delete product"
                      aria-label="Delete product"
                      className="rounded-md p-2 text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <p className="py-10 text-center text-gray-500">
            No products found.
          </p>
        )}
      </div>

      {showLowStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Products needing restock
              </h2>

              <button
                type="button"
                onClick={() => setShowLowStock(false)}
                className="text-gray-500 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="py-6 text-center text-gray-500">
                No products need restocking.
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {product.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        Quantity: {product.quantity}
                        {product.lowStockAt !== null &&
                          ` / minimum ${product.lowStockAt}`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowLowStock(false);
                        handleRestock(product.id);
                      }}
                      className="rounded-md p-2 text-green-600 transition hover:bg-green-50"
                      title="Restock product"
                      aria-label="Restock product"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowLowStock(false)}
              className="mt-5 w-full rounded-lg bg-gray-100 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
