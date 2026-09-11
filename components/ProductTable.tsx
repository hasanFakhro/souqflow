"use client";

import { useRouter } from "next/navigation";

import type { Product } from "@prisma/client";
import { EditProductSection } from "./EditProductButton";

type ProductTableProps = {
  products: Product[];
};

export default function ProductTable({
  products,
}: ProductTableProps) {
  const router = useRouter();

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="px-4 py-3 font-semibold text-gray-700">
              Name
            </th>
            <th className="px-4 py-3 font-semibold text-gray-700">
              SKU
            </th>
            <th className="px-4 py-3 font-semibold text-gray-700">
              Category
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
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-4 font-medium text-gray-900">
                {product.name}
              </td>

              <td className="px-4 py-4 text-gray-600">
                {product.sku || "-"}
              </td>

              <td className="px-4 py-4 text-gray-600">
                {product.category || "-"}
              </td>

              <td className="px-4 py-4 text-gray-600">
                ${product.costPrice}
              </td>

              <td className="px-4 py-4 text-gray-600">
                ${product.sellPrice}
              </td>

              <td className="px-4 py-4 text-gray-600">
                {product.quantity}
              </td>

              <td className="px-4 py-4">
                <div className="flex gap-2">
                  <EditProductSection product={product} />

                  <button
                    onClick={() => handleDelete(product.id)}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {products.length === 0 && (
        <p className="py-10 text-center text-gray-500">
          No products found.
        </p>
      )}
    </div>
  );
}