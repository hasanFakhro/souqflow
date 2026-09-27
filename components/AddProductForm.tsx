"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import MoneyInput from "@/components/MoneyInput";
import { useCurrency, useExchangeRate } from "@/app/(dashboard)/currency";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
  productSchema,
  ProductFormData,
  ProductFormInput,
} from "@/lib/validations/product";

type Props = {
  initialData?: ProductFormData;
  onSave?: (
    data: ProductFormData,
    imageFile?: File | null
  ) => Promise<void>;
  onCancel?: () => void;
};

type Category = {
  id: string;
  name: string;
};

export default function AddProductForm({ initialData, onSave, onCancel }: Props) {
  const router = useRouter();
  const currency = useCurrency();
  const rate = useExchangeRate();
  const waitingForRate = currency === "LBP" && rate === null;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();

        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const {
    register,
    control,
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
      categoryId: "",
      costPrice: 0,
      sellPrice: 0,
      quantity: 0,
      lowStockAt: 0,
      ...initialData,
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    if (waitingForRate) return;
    try {
      if (onSave) {
        await onSave(data, imageFile);
        return;
      }

      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("sku", data.sku || "");
      formData.append("categoryId", data.categoryId || "");
      formData.append("costPrice", String(data.costPrice));
      formData.append("sellPrice", String(data.sellPrice));
      formData.append("quantity", String(data.quantity));
      formData.append(
        "lowStockAt",
        data.lowStockAt !== undefined ? String(data.lowStockAt) : ""
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
        throw new Error(result.message || "Failed to add product");
      }

      alert("Product added successfully!");
      reset();
      setImageFile(null);
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


          <div className="space-y-2">
            <label
              htmlFor="image"
              className="block text-sm font-semibold text-gray-700"
            >
              Product Image
            </label>

            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
            />

            {imageFile && (
              <p className="text-sm text-gray-500">
                Selected: {imageFile.name}
              </p>
            )}
          </div>

          
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

          
          <div className="space-y-2">
            <label
              htmlFor="categoryId"
              className="block text-sm font-semibold text-gray-700"
            >
              Category
            </label>

            <select
              id="categoryId"
              {...register("categoryId")}
              disabled={categoriesLoading}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
            >
              <option value="">
                {categoriesLoading ? "Loading categories..." : "Select a category"}
              </option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {errors.categoryId && (
              <p className="text-sm text-red-600">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            
            
            <div className="space-y-2">
              <label
                htmlFor="costPrice"
                className="block text-sm font-semibold text-gray-700"
              >
                Cost Price ({currency})
              </label>

              <Controller name="costPrice" control={control} render={({ field }) => (
                <MoneyInput {...field} id="costPrice" disabled={isSubmitting} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50" />
              )} />

              {errors.costPrice && (
                <p className="text-sm text-red-600">
                  {errors.costPrice.message}
                </p>
              )}
            </div>

            
            <div className="space-y-2">
              <label
                htmlFor="sellPrice"
                className="block text-sm font-semibold text-gray-700"
              >
                Sell Price ({currency})
              </label>

              <Controller name="sellPrice" control={control} render={({ field }) => (
                <MoneyInput {...field} id="sellPrice" disabled={isSubmitting} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50" />
              )} />

              {errors.sellPrice && (
                <p className="text-sm text-red-600">
                  {errors.sellPrice.message}
                </p>
              )}
            </div>
          </div>

          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

           
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

          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onCancel}
                className="rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting || waitingForRate}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSubmitting
                ? "Saving..."
                : initialData
                  ? "Update Product"
                  : "Add Product"}
            </button>
          </div>
        </form>
    </div>
  );
}
