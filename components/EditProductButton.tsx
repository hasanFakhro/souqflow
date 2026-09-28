"use client";

import type { Product } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil } from "lucide-react";
import ProductFormModal, { ProductFormData } from "./ProductFormModal";

export function EditProductSection({ product }: { product: Product }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdateProduct = async (
    updatedProduct: ProductFormData,
    imageFile?: File | null
  ) => {
    const formData = new FormData();

    formData.append("name", updatedProduct.name);
    formData.append("description", updatedProduct.description || "");
    formData.append("sku", updatedProduct.sku || "");
    formData.append("categoryId", updatedProduct.categoryId || "");
    formData.append("color", updatedProduct.color || "");
    formData.append("size", updatedProduct.size || "");
    formData.append("costPrice", String(updatedProduct.costPrice));
    formData.append("sellPrice", String(updatedProduct.sellPrice));
    formData.append("quantity", String(updatedProduct.quantity));

    formData.append(
      "lowStockAt",
      updatedProduct.lowStockAt !== undefined
        ? String(updatedProduct.lowStockAt)
        : ""
    );

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update product");
    }
    
    router.refresh();
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        title="Edit product"
        aria-label="Edit product"
        className="rounded-md p-2 text-blue-600 transition hover:bg-blue-50"
      >
        <Pencil size={18} />
      </button>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleUpdateProduct}
        initialData={{
          ...product,
          description: product.description ?? "",
          imageUrl: product.imageUrl ?? "",
          sku: product.sku ?? "",
          categoryId: product.categoryId ?? "",
          color: product.color ?? "",
          size: product.size ?? "",
          lowStockAt: product.lowStockAt ?? undefined,
        }}
      />
    </div>
  );
}