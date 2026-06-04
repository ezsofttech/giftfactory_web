// components/sections/deals.tsx

import { ProductCard } from "../card/product-card";

export function DealsSection() {
  const deals = [
    {
      id: 7,
      name: "Smart Watch",
      price: 89.99,
      originalPrice: 129.99,
      image: "https://picsum.photos/seed/product/400/400",
      rating: 4,
      timeLeft: "23:59:59",
    },
    // Add more deals...
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Hot Deals</h2>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold bg-gray-100 px-3 py-1 rounded">
                02
              </div>
              <span className="text-xs">Days</span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold bg-gray-100 px-3 py-1 rounded">
                12
              </div>
              <span className="text-xs">Hours</span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold bg-gray-100 px-3 py-1 rounded">
                45
              </div>
              <span className="text-xs">Minutes</span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold bg-gray-100 px-3 py-1 rounded">
                30
              </div>
              <span className="text-xs">Seconds</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* {deals.map((product) => (
            // <ProductCard key={product.id} product={product} />""
          ))} */}
        </div>
      </div>
    </section>
  );
}
