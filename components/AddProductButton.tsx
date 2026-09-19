"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ProductFormModal, { ProductFormData } from "./ProductFormModal";

export function AddProductSection() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateProduct = async (
    newProduct: ProductFormData,
    imageFile?: File | null
  ) => {
    const formData = new FormData();

    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description || "");
    formData.append("sku", newProduct.sku || "");
    formData.append("category", newProduct.category || "");
    formData.append("costPrice", String(newProduct.costPrice));
    formData.append("sellPrice", String(newProduct.sellPrice));
    formData.append("quantity", String(newProduct.quantity));
    formData.append(
      "lowStockAt",
      newProduct.lowStockAt !== undefined
        ? String(newProduct.lowStockAt)
        : ""
    );

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await fetch("/api/products", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to create product"
      );
    }

    router.refresh();
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-purple-700"
      >
        <span className="text-lg leading-none">+</span>
        <span>Add Product</span>
      </button>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProduct}
      />
    </div>
  );
}
