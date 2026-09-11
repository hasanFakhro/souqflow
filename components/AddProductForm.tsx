"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
  productSchema,
  ProductFormData,
  ProductFormInput,
} from "@/lib/validations/product";

type Props = {
  initialData?: ProductFormData;
  onSave?: (data: ProductFormData) => Promise<void> | void;
  onCancel?: () => void;
};

export default function AddProductForm({ initialData, onSave, onCancel }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      sku: "",
      category: "",
      costPrice: 0,
      sellPrice: 0,
      quantity: 0,
      lowStockAt: 0,
      ...initialData,
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (onSave) {
        await onSave(data);
        return;
      }
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add product");
      }

      alert("Product added successfully!");
      reset();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700"
            >
              Product Name
            </label>

            <input
              id="name"
              type="text"
              {...register("name")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            {errors.name && (
              <p className="text-sm text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700"
            >
              Description
            </label>

            <textarea
              id="description"
              {...register("description")}
              className="min-h-28 w-full resize-y rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label
              htmlFor="imageUrl"
              className="block text-sm font-semibold text-gray-700"
            >
              Image URL
            </label>

            <input
              id="imageUrl"
              type="url"
              {...register("imageUrl")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            {errors.imageUrl && (
              <p className="text-sm text-red-600">
                {errors.imageUrl.message}
              </p>
            )}
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <label
              htmlFor="sku"
              className="block text-sm font-semibold text-gray-700"
            >
              SKU
            </label>

            <input
              id="sku"
              type="text"
              {...register("sku")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            {errors.sku && (
              <p className="text-sm text-red-600">
                {errors.sku.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label
              htmlFor="category"
              className="block text-sm font-semibold text-gray-700"
            >
              Category
            </label>

            <input
              id="category"
              type="text"
              {...register("category")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            {errors.category && (
              <p className="text-sm text-red-600">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Prices */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            
            {/* Cost Price */}
            <div className="space-y-2">
              <label
                htmlFor="costPrice"
                className="block text-sm font-semibold text-gray-700"
              >
                Cost Price
              </label>

              <input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                {...register("costPrice")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />

              {errors.costPrice && (
                <p className="text-sm text-red-600">
                  {errors.costPrice.message}
                </p>
              )}
            </div>

            {/* Sell Price */}
            <div className="space-y-2">
              <label
                htmlFor="sellPrice"
                className="block text-sm font-semibold text-gray-700"
              >
                Sell Price
              </label>

              <input
                id="sellPrice"
                type="number"
                step="0.01"
                min="0"
                {...register("sellPrice")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />

              {errors.sellPrice && (
                <p className="text-sm text-red-600">
                  {errors.sellPrice.message}
                </p>
              )}
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* Quantity */}
            <div className="space-y-2">
              <label
                htmlFor="quantity"
                className="block text-sm font-semibold text-gray-700"
              >
                Quantity
              </label>

              <input
                id="quantity"
                type="number"
                min="0"
                {...register("quantity")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />

              {errors.quantity && (
                <p className="text-sm text-red-600">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            {/* Low Stock */}
            <div className="space-y-2">
              <label
                htmlFor="lowStockAt"
                className="block text-sm font-semibold text-gray-700"
              >
                Low Stock Alert At
              </label>

              <input
                id="lowStockAt"
                type="number"
                min="0"
                {...register("lowStockAt")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />

              {errors.lowStockAt && (
                <p className="text-sm text-red-600">
                  {errors.lowStockAt.message}
                </p>
              )}
            </div>

          </div>

          {/* Submit */}
          {onCancel && <button type="button" disabled={isSubmitting} onClick={onCancel} className="rounded-lg border px-4 py-2">Cancel</button>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? "Saving..." : initialData ? "Update Product" : "Add Product"}
          </button>
        </form>
    </div>
  );
}
