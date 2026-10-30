import ProductCard from "../ProductCard";

export interface BuyerProduct {
  id: string;
  name: string;
  imageUrl?: string | null;
  category: { id: string; name: string } | null;
  price: number;
  stock: number;
  isPopular?: boolean;
}

interface BuyerProductGridProps {
  products: BuyerProduct[];
  cartScope: string;
}

export default function BuyerProductGrid({ products, cartScope }: BuyerProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 border border-gray-200 rounded-2xl bg-gray-50">
        <p className="text-base text-gray-500">No products found matching your selection.</p>
      </div>
    );
  }

  const groups = new Map<string, { name: string; products: BuyerProduct[] }>();
  for (const product of products) {
    const key = product.category?.id ?? "uncategorized";
    const group = groups.get(key) ?? { name: product.category?.name ?? "Uncategorized", products: [] };
    group.products.push(product);
    groups.set(key, group);
  }

  return (
    <div className="space-y-8">
      {[...groups].map(([key, group]) => (
        <section key={key}>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">{group.name}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
            {group.products.map((product) => (
              <ProductCard
                key={product.id}
                cartScope={cartScope}
                hideStockCount
                allowBeyondStock
                showPopularBadge={product.isPopular}
                product={{
                  id: product.id,
                  name: product.name,
                  imageUrl: product.imageUrl,
                  category: product.category?.name ?? null,
                  sellPrice: product.price,
                  quantity: product.stock,
                }}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
