"use client";

import AddProductForm from "./AddProductForm";
import type { ProductFormData } from "@/lib/validations/product";
export type { ProductFormData } from "@/lib/validations/product";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: ( data: ProductFormData, imageFile?: File | null ) => Promise<void> | void;
  initialData?: ProductFormData;
};

export default function ProductFormModal({ isOpen, onClose, onSubmit, initialData }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl transition-all">
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{initialData ? "Edit Product" : "Add New Product"}</h2>
            <p className="text-sm text-gray-500">{initialData ? "Update product information and inventory." : "Enter product details to add to catalog."}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">✕</button>
        </div>
        <AddProductForm initialData={initialData} onCancel={onClose} onSave={async (data, imageFile) => {
            await onSubmit(data, imageFile);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
