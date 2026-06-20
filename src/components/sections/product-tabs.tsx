"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/types/product";

interface ProductTabsProps {
  product: Product;
}

export function ProductTabs({ product }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">
          Reviews ({product.reviews.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description">
        <div className="py-4">
          <p className="text-gray-700">{product.description}</p>
        </div>
      </TabsContent>

      <TabsContent value="specifications">
        <div className="py-4">
          <ul className="space-y-2">
            {Object.entries(product.specifications).map(([key, value]) => (
              <li key={key} className="flex">
                <span className="font-medium w-48">{key}:</span>
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </TabsContent>

      <TabsContent value="reviews">
        <div className="py-4">
          {product.reviews.length > 0 ? (
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center mb-2">
                    <div className="font-medium">{review.user}</div>
                    <div className="ml-4 flex">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          >
                            ★
                          </span>
                        ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    {review.date}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
