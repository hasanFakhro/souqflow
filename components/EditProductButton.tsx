"use client";

import type { Product } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProductFormModal, { ProductFormData } from "./ProductFormModal";

export function EditProductSection({ product }: { product: Product }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdateProduct = async (updatedProduct: ProductFormData) => {
    const response = await fetch(`/api/products/${product.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedProduct),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to update product");
  }

  router.refresh();
  };

  return (
    <div>
      {/* The Edit Product Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-blue-600"
      >
        Edit
      </button>

      {/* The Modal with existing product populated */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleUpdateProduct}
        initialData={{
          ...product,
          description: product.description ?? "",
          imageUrl: product.imageUrl ?? "",
          sku: product.sku ?? "",
          category: product.category ?? "",
          lowStockAt: product.lowStockAt ?? undefined,
        }}
      />
    </div>
  );
}
