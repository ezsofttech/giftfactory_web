// components/sections/featured-products.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/card/main-product-card";
import { mockProducts } from "@/lib/mock";
import type { ProductDisplay } from "@/types/api";

export function FeaturedProducts() {
  const products: (ProductDisplay & { isNew?: boolean; isFeatured?: boolean; isBestSeller?: boolean })[] = [
    {
      id: mockProducts[0].id,
      title: mockProducts[0].name,
      description: mockProducts[0].description,
      price: mockProducts[0].price,
      mrp: undefined,
      discountPercentage: 0,
      rating: 4,
      thumbnail: mockProducts[0].images?.[0] || "https://picsum.photos/seed/gift/400/400",
      images: mockProducts[0].images,
      category: mockProducts[0].category,
      brand: mockProducts[0].brand,
      slug: mockProducts[0].slug,
      availabilityStatus: "in_stock",
      stock: mockProducts[0].stock,
      isNew: true,
      isFeatured: true,
      isBestSeller: false,
    },
    // Add more products...
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <Tabs defaultValue="new" className="w-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <TabsList>
              <TabsTrigger value="new">New Arrivals</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="bestsellers">Bestsellers</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="new">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products
                .filter((p) => p.isNew)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </TabsContent>
          <TabsContent value="featured">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products
                .filter((p) => p.isFeatured)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </TabsContent>
          <TabsContent value="bestsellers">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products
                .filter((p) => p.isBestSeller)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
