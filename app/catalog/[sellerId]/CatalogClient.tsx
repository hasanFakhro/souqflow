"use client";

import { useMemo, useState } from "react";
import BuyerHeader from "@/components/buyer/BuyerHeader";
import BuyerFilterBar, {
  type PriceSortOrder,
  type CategoryOption,
} from "@/components/buyer/BuyerFilterBar";
import BuyerProductGrid, {
  type BuyerProduct,
} from "@/components/buyer/BuyerProductGrid";
import CustomerCartBar from "@/components/CustomerCartBar";
import { useCartStore } from "@/stores/cartStore";

interface CatalogClientProps {
  sellerId:string;
  businessName: string;
  description?: string;
  categories: CategoryOption[];
  products: BuyerProduct[];
}

export default function CatalogClient({
  sellerId,
  businessName,
  description,
  categories,
  products,
}: CatalogClientProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [priceSort, setPriceSort] = useState<PriceSortOrder>("none");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartScope = `catalog:${sellerId}`;
  const cartItems = useCartStore((state) => state.items, cartScope);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategoryId) {
      result = result.filter((p) => p.category?.id === selectedCategoryId);
    }

    if (priceSort === "asc") result = [...result].sort((a, b) => a.price - b.price);
    if (priceSort === "desc") result = [...result].sort((a, b) => b.price - a.price);

    return result;
  }, [products, selectedCategoryId, priceSort]);

  return (
    <div className="min-h-screen bg-gray-50">
      <BuyerHeader
        businessName={businessName}
        description={description}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen((prev) => !prev)}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BuyerFilterBar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          priceSort={priceSort}
          onPriceSortChange={setPriceSort}
        />
        <div className="mt-6">
          <BuyerProductGrid products={filteredProducts} cartScope={cartScope} />
        </div>
      </main>
      <CustomerCartBar key={sellerId} isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} sellerId={sellerId} />
    </div>
  );
}
