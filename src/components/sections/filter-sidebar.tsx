import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { LayoutGrid, IndianRupee, Tag, Star } from "lucide-react";

const categories = ["Electronics", "Clothing", "Home", "Beauty"];
const brands = ["Apple", "Samsung", "Nike", "Adidas"];
const ratings = [5, 4, 3, 2, 1];

export function FilterSidebar() {
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          <LayoutGrid className="h-4 w-4 text-primary/80" />
          Categories
        </h3>
        <div className="space-y-1">
          {categories.map((category) => (
            <label
              key={category}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground cursor-pointer transition-colors"
            >
              <Checkbox id={`cat-${category}`} />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          <IndianRupee className="h-4 w-4 text-primary/80" />
          Price Range
        </h3>
        <Slider
          defaultValue={[0, 1000]}
          max={1000}
          step={10}
          className="my-4"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>₹0</span>
          <span>₹1000</span>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          <Tag className="h-4 w-4 text-primary/80" />
          Brands
        </h3>
        <div className="space-y-1">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground cursor-pointer transition-colors"
            >
              <Checkbox id={`brand-${brand}`} />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          <Star className="h-4 w-4 text-primary/80" />
          Rating
        </h3>
        <div className="space-y-1">
          {ratings.map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground cursor-pointer transition-colors"
            >
              <Checkbox id={`rating-${rating}`} />
              <span className="flex items-center gap-0.5">
                {Array(rating)
                  .fill(0)
                  .map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                <span className="ml-1">& Up</span>
              </span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
