"use client";

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
};

const ProductCard = ({ product }: ProductCardProps) => {
    const [isPressed, setIsPressed] = useState(false);
    const cartQuantity = useCartStore(
        (state) => state.items.find((i) => i.productId === product.id)?.quantity ?? 0
    );

    const handleAdd = () => {
        addItem({
            productId: product.id,
            name: product.name,
            category: product.category,
            unitPrice: product.sellPrice,
            costPrice: product.costPrice,
            stock: product.quantity,
        });

        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);
    };

    return (
        <div
            onClick={handleAdd}
            className={`relative rounded-lg shadow-sm hover:shadow-md overflow-hidden flex flex-col cursor-pointer select-none transition-all duration-150 ease-out ${
                isPressed ? "scale-95 shadow-sm" : "scale-100"
            }`}
        >
            {cartQuantity > 0 && (
                <div className="absolute top-2 right-2 z-10 flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-primary text-white text-xs font-semibold shadow-sm transition-transform duration-200 scale-100 animate-in">
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
                <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-semibold">
                        ${product.sellPrice}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                        {product.quantity} left
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ProductCard