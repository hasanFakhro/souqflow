import ProductCard from "../ProductCard";

export interface BuyerProduct {
  id: string;
  name: string;
  imageUrl?: string | null;
  category: { id: string; name: string } | null;
  price: number;
  costPrice: number;
  stock: number;
}

interface BuyerProductGridProps {
  products: BuyerProduct[];
}

export default function BuyerProductGrid({ products }: BuyerProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 border border-gray-200 rounded-2xl bg-gray-50">
        <p className="text-base text-gray-500">No products found matching your selection.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          hideStockCount
          product={{
            id: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            category: product.category?.name ?? null,
            sellPrice: product.price,
            costPrice: product.costPrice,
            quantity: product.stock,
          }}
        />
      ))}
    </div>
  );
}