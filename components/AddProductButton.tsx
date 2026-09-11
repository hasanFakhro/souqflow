"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ProductFormModal, { ProductFormData } from "./ProductFormModal";

export function AddProductSection() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateProduct = async (newProduct: ProductFormData) => {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to create product");
    router.refresh();
  };

  return (
    <div>
      {/* The Add Product Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-purple-700"
      >
        <span className="text-lg leading-none">+</span>
        <span>Add Product</span>
      </button>

      {/* The Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProduct}
      />
    </div>
  );
}
