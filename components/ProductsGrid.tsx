"use client";

import { useState } from "react";
import SearchBar from "./SearchBar";
import { Product } from "@prisma/client";
import ProductCard from "./ProductCard";

type ProductsGridProps = {
    products: Product[];
};

const ProductsGrid = ({ products }: ProductsGridProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState<string | null>(null);
    const [stockState, setStockState] = useState<string | null>(null);

    const categoriesSet = new Set(
        products
            .map((product) => product.category)
            .filter(
                (category): category is string => Boolean(category)
            )
    );

    const categoriesList = [...categoriesSet];

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesCategory =
            category === null || product.category === category;

        const matchesStock =
            stockState === null ||
            (stockState === "out" && product.quantity === 0) ||
            (stockState === "low" &&
                product.quantity > 0 &&
                product.lowStockAt !== null &&
                product.quantity <= product.lowStockAt) ||
            (stockState === "stocked" &&
                (product.lowStockAt === null ||
                    product.quantity > product.lowStockAt));

        return matchesSearch && matchesCategory && matchesStock;
    });

    return (
        <div className="p-4">
            <div className="space-y-3">
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                />

                <div className="flex flex-wrap gap-2">
                    <select
                        value={category ?? ""}
                        onChange={(e) =>
                            setCategory(
                                e.target.value === ""
                                    ? null
                                    : e.target.value
                            )
                        }
                        aria-label="Filter by category"
                        className="rounded-lg shadow-sm px-3 py-2 text-sm bg-white"
                    >
                        <option value="">All categories</option>

                        {categoriesList.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>

                    <select
                        value={stockState ?? ""}
                        onChange={(e) =>
                            setStockState(
                                e.target.value === ""
                                    ? null
                                    : e.target.value
                            )
                        }
                        aria-label="Filter by stock state"
                        className="rounded-lg shadow-sm px-3 py-2 text-sm bg-white"
                    >
                        <option value="">All stock states</option>
                        <option value="stocked">Stocked</option>
                        <option value="low">Low stock</option>
                        <option value="out">Out of stock</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mt-4">
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