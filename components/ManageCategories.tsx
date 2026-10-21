"use client";
import { useSiteDialogs } from "@/components/SiteDialogs";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

type Category = {
  id: string;
  name: string;
  catalogOrder: number;
};

export default function ManageCategories() {
  const { confirm } = useSiteDialogs();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchCategories() {
    try {
      const response = await fetch("/api/categories");

      if (!response.ok) {
        throw new Error("Failed to load categories.");
      }

      const data = await response.json();
      setCategories(data);
    } catch {
      setError("Could not load categories.");
    }
  }

  function resetForm() {
    setCategoryName("");
    setEditingId(null);
    setError("");
  }

  function startEditing(category: Category) {
    setEditingId(category.id);
    setCategoryName(category.name);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const name = categoryName.trim();

    if (!name) {
      setError("Please enter a category name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        editingId ? `/api/categories/${editingId}` : "/api/categories",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to save category.");
      }

      resetForm();
      await fetchCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = await confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete category.");
      }

      if (editingId === category.id) {
        resetForm();
      }

      await fetchCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setError("");
          void fetchCategories();
        }}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        Manage Categories
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Manage Categories
              </h2>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mb-5">
              <label
                htmlFor="categoryName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {editingId ? "Edit category" : "New category"}
              </label>

              <div className="flex gap-2">
                <input
                  id="categoryName"
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editingId ? (
                    "Save"
                  ) : (
                    <>
                      <Plus size={16} />
                      Add
                    </>
                  )}
                </button>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel editing
                </button>
              )}
            </form>

            {error && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="max-h-72 space-y-2 overflow-y-auto">
              {categories.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500">
                  No categories yet.
                </p>
              ) : (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-3"
                  >
                    <span className="min-w-0 flex-1 break-words text-sm font-medium text-gray-800">
                      {category.name}
                    </span>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEditing(category)}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-blue-600"
                        aria-label={`Edit ${category.name}`}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete ${category.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
