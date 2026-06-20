"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";
import { useState } from "react";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState("1");

  const commitQty = () => {
    const v = parseInt(quantityInput, 10);
    if (!Number.isNaN(v) && v >= 1) {
      setQuantity(v);
      setQuantityInput(String(v));
    } else {
      setQuantityInput(String(quantity));
    }
  };

  return (
    <div>
      <div className="mb-4">
        <span className="text-sm text-gray-500">{product.brand}</span>
        <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
      </div>

      <div className="flex items-center mb-4">
        <div className="flex mr-2">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <span
                key={i}
                className={
                  i < product.rating ? "text-yellow-400" : "text-gray-300"
                }
              >
                ★
              </span>
            ))}
        </div>
        <span className="text-sm text-gray-500">
          ({product.reviews.length} reviews)
        </span>
      </div>

      <div className="text-3xl font-bold mb-6">${product.price.toFixed(2)}</div>

      <p className="text-gray-700 mb-6">{product.shortDescription}</p>

      <div className="flex items-center mb-6">
        <span className="mr-4">Quantity:</span>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { const next = Math.max(1, quantity - 1); setQuantity(next); setQuantityInput(String(next)); }}
          >
            -
          </Button>
          <Input
            type="number"
            value={quantityInput}
            onChange={(e) => setQuantityInput(e.target.value)}
            onBlur={commitQty}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); } }}
            className="w-16 text-center mx-2"
            min="1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => { const next = quantity + 1; setQuantity(next); setQuantityInput(String(next)); }}
          >
            +
          </Button>
        </div>
      </div>

      <div className="space-x-4">
        <Button size="lg">Add to Cart</Button>
        <Button size="lg" variant="secondary">
          Buy Now
        </Button>
      </div>

      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center mb-2">
          <span className="text-gray-500 w-24">Availability:</span>
          <span
            className={product.stock > 0 ? "text-green-500" : "text-red-500"}
          >
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 w-24">SKU:</span>
          <span>{product.sku}</span>
        </div>
      </div>
    </div>
  );
}
