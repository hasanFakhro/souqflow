"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

type Category = {
  id: string;
  name: string;
  catalogOrder: number;
};

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);


  async function fetchCategories() {
    try {
      const response = await fetch("/api/categories");

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  const handleOpen = () => {
    setIsOpen(true);
    void fetchCategories();
  };

  const handleSaveCategory = async () => {
    const name = categoryName.trim();

    if (!name) {
      return;
    }

    setLoading(true);

    try {
      const url = editingId
        ? `/api/categories/${editingId}`
        : "/api/categories";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save category");
      }

      setCategoryName("");
      setEditingId(null);

      await fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingId(category.id);
    setCategoryName(category.name);
  };

  const handleDeleteCategory = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete category");
      }

      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCategoryName("");
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-purple-700"
      >
        Manage Categories
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Manage Categories</h2>

              <button
                onClick={() => {
                  setIsOpen(false);
                  handleCancelEdit();
                }}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Category name"
                  className="flex-1 rounded-lg border px-3 py-2 outline-none focus:ring-2"
                />

                <button
                  onClick={handleSaveCategory}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
                >
                  <Plus size={18} />

                  {editingId ? "Update" : "Add"}
                </button>
              </div>

              {editingId && (
                <button
                  onClick={handleCancelEdit}
                  className="mt-2 text-sm text-gray-500 hover:underline"
                >
                  Cancel editing
                </button>
              )}
            </div>

            <div className="space-y-2">
              {categories.length === 0 ? (
                <p className="py-6 text-center text-gray-500">
                  No categories yet.
                </p>
              ) : (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{category.name}</span>

                      <input
                        type="number"
                        min="1"
                        value={category.catalogOrder || ""}
                        onChange={(e) => {
                          const value = Number(e.target.value);

                          setCategories((currentCategories) =>
                            currentCategories.map((item) =>
                              item.id === category.id
                                ? { ...item, catalogOrder: value }
                                : item
                            )
                          );
                        }}
                        onBlur={async (e) => {
                          const value = Number(e.target.value);

                          if (!Number.isInteger(value) || value < 1) {
                            return;
                          }

                          try {
                            const response = await fetch(`/api/categories/${category.id}`, {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                catalogOrder: value,
                              }),
                            });

                            const data = await response.json();

                            if (!response.ok) {
                              throw new Error(
                                data.message || "Failed to update category order"
                              );
                            }
                          } catch (error) {
                            console.error("Error updating category order:", error);
                            alert(
                              error instanceof Error
                                ? error.message
                                : "Something went wrong"
                            );
                          }
                        }}
                        className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditCategory(category)}
                        title="Edit category"
                        className="rounded-md p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        title="Delete category"
                        className="rounded-md p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                handleCancelEdit();
              }}
              className="mt-6 w-full rounded-lg border px-4 py-2 font-medium hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
