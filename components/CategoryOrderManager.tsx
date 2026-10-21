"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

type Category = {
  id: string;
  name: string;
  catalogOrder: number;
};

type CategoryOrderManagerProps = {
  initialCategories: Category[];
};

function SortableCategoryItem({ category }: { category: Category }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 ${
        isDragging
          ? "border-blue-400 opacity-70 shadow-lg"
          : "border-gray-200"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${category.name}`}
        className="cursor-grab touch-none text-gray-400 hover:text-gray-700 active:cursor-grabbing"
      >
        <GripVertical size={20} />
      </button>

      <span className="text-sm font-medium text-gray-800">
        {category.name}
      </span>
    </div>
  );
}

export default function CategoryOrderManager({
  initialCategories,
}: CategoryOrderManagerProps) {
  const [categories, setCategories] = useState<Category[]>(() =>
    [...initialCategories].sort(
      (a, b) =>
        a.catalogOrder - b.catalogOrder ||
        a.name.localeCompare(b.name)
    )
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id || saving) {
      return;
    }

    const oldIndex = categories.findIndex(
      (category) => category.id === active.id
    );

    const newIndex = categories.findIndex(
      (category) => category.id === over.id
    );

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const previousCategories = categories;

    const reorderedCategories = arrayMove(
      categories,
      oldIndex,
      newIndex
    ).map((category, index) => ({
      ...category,
      catalogOrder: index + 1,
    }));

    setCategories(reorderedCategories);
    setSaving(true);
    setMessage("");

    try {
      const responses = await Promise.all(
        reorderedCategories.map((category) =>
          fetch(`/api/categories/${category.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              catalogOrder: category.catalogOrder,
            }),
          })
        )
      );

      if (responses.some((response) => !response.ok)) {
        throw new Error("The category order could not be saved.");
      }

      setMessage("Category order saved.");
    } catch (error) {
      setCategories(previousCategories);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the order."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Category Order
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Drag categories using the grip icon to choose the order
          they should appear in your catalog.
        </p>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
          No categories yet. Add categories from Inventory first.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map((category) => category.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {categories.map((category) => (
                <SortableCategoryItem
                  key={category.id}
                  category={category}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="mt-3 min-h-5 text-sm">
        {saving && (
          <span className="text-gray-500">
            Saving order...
          </span>
        )}

        {!saving && message && (
          <span
            role="status"
            className={
              message === "Category order saved."
                ? "text-green-700"
                : "text-red-600"
            }
          >
            {message}
          </span>
        )}
      </div>
    </section>
  );
}