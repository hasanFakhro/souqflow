"use client";
import { useState } from "react";
import SearchBar from "./SearchBar";
import { Product } from "@prisma/client";
import ProductCard from "./ProductCard";

type ProductsGridProps = {
    products: Product[];
}

const ProductsGrid = ({ products }: ProductsGridProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const categoriesSet = new Set(products.map(product => product.category).filter((category): category is string => Boolean(category)));
    const categoriesList = [...categoriesSet];
    const [category, setCategory] = useState<string | null>(null);
    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === null || product.category == category;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-4">
            <div className="max-w-sm">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />

                <div aria-label="Filter by category" className="flex flex-wrap gap-2 mt-3 list-none">
                    <button type="button"
                        aria-pressed={category === null}
                        onClick={() => setCategory(null)}
                        className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition ${category === null
                                ? 'bg-primary text-white'
                                : 'bg-white text-gray-600 shadow-sm hover:bg-gray-100'
                            }`}
                    >
                        All
                    </button>
                    {categoriesList.map((cat) => (
                        <button type="button"
                            key={cat}
                            aria-pressed={category === cat}
                            onClick={() => setCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition ${category === cat
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-gray-600 shadow-sm hover:bg-gray-100'
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mt-4">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}

export default ProductsGrid
