"use client";

import { useMemo, useState } from "react";
import SearchBar from "./SearchBar";
import { Prisma } from "@prisma/client";
import ProductCard from "./ProductCard";
import FilterSelect from "./FilterSelect";

export type ProductData = Prisma.ProductGetPayload<{ include: { category: true } }>;
type ProductsGridProps = {
    products: ProductData[];
};

const ProductsGrid = ({ products }: ProductsGridProps) => {
    const flatProducts = useMemo(
        () => products.map(product => ({ ...product, category: product.category?.name ?? null })),
        [products]
    );

    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState<string | null>(null);
    const [stockState, setStockState] = useState<string | null>(null);

    const categoriesList = useMemo(() => {
        const categoriesSet = new Set(
            flatProducts
                .map((product) => product.category)
                .filter(
                    (category): category is string => Boolean(category)
                )
        );

        return [...categoriesSet];
    }, [flatProducts]);

    const filteredProducts = useMemo(() => flatProducts.filter((product) => {
        const matchesSearch = product.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesCategory =
            category === null || product.category === category;

        const matchesStock =
            stockState === null ||
            (stockState === "out" && product.quantity <= 0) ||
            (stockState === "low" &&
                product.quantity > 0 &&
                product.lowStockAt !== null &&
                product.quantity <= product.lowStockAt) ||
            (stockState === "stocked" &&
                (product.quantity > 0 && (product.lowStockAt === null ||
                    product.quantity > product.lowStockAt)));

        return matchesSearch && matchesCategory && matchesStock;
    }), [flatProducts, searchTerm, category, stockState]);

    return (
        <div className="min-w-0">
            <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                />
                <FilterSelect
                    value={stockState ?? ""}
                    onChange={(e) => setStockState(e.target.value || null)}
                    aria-label="Filter by stock state"
                    className="w-full shrink-0 sm:w-44"
                >
                    <option value="">All stock states</option>
                    <option value="stocked">Stocked</option>
                    <option value="low">Low stock</option>
                    <option value="out">Out of stock</option>
                </FilterSelect>
              </div>
                <nav aria-label="Product categories" className="flex gap-2 overflow-x-auto border-t border-gray-100 pt-4 pb-1">
                    <button
                        type="button"
                        aria-pressed={category === null}
                        onClick={() => setCategory(null)}
                        className={`min-h-11 shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium cursor-pointer transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
                            category === null
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-200 hover:from-blue-700 hover:to-purple-700'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        All
                    </button>
                    {categoriesList.map((cat) => (
                        <button
                            type="button"
                            aria-pressed={category === cat}
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`min-h-11 shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium cursor-pointer transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
                                category === cat
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-200 hover:from-blue-700 hover:to-purple-700'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}

                </nav>
            </div>

            {filteredProducts.length === 0 && (
                <p role="status" className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
                    No products match your filters.
                </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 mt-4">
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProductsGrid;
