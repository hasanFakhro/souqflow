import Image from "next/image"
import ProductImageFallback from "./ProductImageFallback";
import { addItem } from "@/stores/cartStore";

type ProductCardProps = {
    product: {
        id: string,
        name: string;
        imageUrl?: string | null;
        category: string;
        sellPrice: number;
        quantity: number;
    };
};

const ProductCard = ({ product }: ProductCardProps) => {
    return (
        <div className="rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col cursor-pointer" onClick={() => addItem({productId:product.id,name:product.name,category:product.category,price:product.sellPrice,stock:product.quantity})}>
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