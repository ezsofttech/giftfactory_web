// components/sections/promo-banner.tsx
import { Button } from "@/components/ui/button";

export function PromoBanner() {
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="bg-primary rounded-lg p-8 md:p-12 text-white">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Summer Sale - Up to 50% Off
            </h2>
            <p className="mb-6">
              Limited time offer. Shop our best-selling products at discounted
              prices.
            </p>
            <Button variant="secondary">Shop Now</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
