"use client";
import { Price } from "@/app/(dashboard)/currency";

import Image from "next/image"
import { useState } from "react";
import ProductImageFallback from "./ProductImageFallback";
import { addItem, useCartStore } from "@/stores/cartStore";

type ProductCardProps = {
    product: {
        id: string,
        name: string;
        imageUrl?: string | null;
        category: string | null;
        sellPrice: number;
        costPrice: number;
        quantity: number;
    };
    hideStockCount?: boolean;
    allowBeyondStock?: boolean;
    showPopularBadge?: boolean;
};

const ProductCard = ({ product, hideStockCount = false, allowBeyondStock = false, showPopularBadge = false }: ProductCardProps) => {
    const [isPressed, setIsPressed] = useState(false);
    const cartQuantity = useCartStore(
        (state) => state.items.find((i) => i.productId === product.id)?.quantity ?? 0
    );
    const remainingQuantity = product.quantity - cartQuantity;
    const isOutOfStock = !allowBeyondStock && remainingQuantity <= 0;

    const handleAdd = () => {
        if (isOutOfStock) return;

        addItem({
            productId: product.id,
            name: product.name,
            category: product.category,
            unitPrice: product.sellPrice,
            costPrice: product.costPrice,
            stock: product.quantity,
        }, { allowBeyondStock });

        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);
    };

    return (
        <div
            onClick={handleAdd}
            aria-disabled={isOutOfStock}
            className={`relative flex min-w-0 select-none flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-150 ease-out ${isOutOfStock
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                } ${isPressed ? "scale-95 shadow-sm" : "scale-100"
                }`}
        >
            {showPopularBadge && (
                <span className="absolute left-2 top-2 z-10 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                    Popular
                </span>
            )}
            {cartQuantity > 0 && (
                <div className="absolute top-2 right-2 z-10 flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold shadow-sm transition-transform duration-200 scale-100 animate-in">
                    {cartQuantity}
                </div>
            )}

            <div className="relative w-full h-24 sm:h-32 lg:h-40 bg-gray-100">
                {product.imageUrl ?
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        unoptimized
                        sizes="(max-width: 640px) 50vw, 25vw"
                        fill
                        className="object-contain"
                    />
                    :
                    <ProductImageFallback />
                }
            </div>
            <div className="p-2 sm:p-4 flex flex-col gap-1 sm:gap-2">
                <div className="text-sm sm:text-base font-medium truncate">
                    {product.name}
                </div>
                <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1">
                    <span className="text-base sm:text-lg font-semibold">
                        <Price amountUsd={product.sellPrice} />
                    </span>
                    {!hideStockCount && (
                        <span className="text-xs sm:text-sm text-gray-500">
                            {isOutOfStock ? "Out of stock" : `${remainingQuantity} left`}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductCard
