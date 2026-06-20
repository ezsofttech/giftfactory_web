// components/cards/category-card.tsx
import Image from "next/image";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
  image: string;
  count: number;
};

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.id}`}
      className="flex flex-col items-center group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow py-4"
    >
      <div className="p-3 flex justify-center items-center bg-accent-foreground w-20 h-20 rounded-full">
        <div className="relative aspect-square  w-full h-full group-hover:scale-110 transition-all duration-150">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover"
          />
        </div>
      </div>
      <div className="p-4 text-center">
        <h3 className="font-medium text-lg group-hover:text-primary transition-colors">
          {category.name}
        </h3>
        <p className="text-sm text-gray-500">{category.count} products</p>
      </div>
    </Link>
  );
}
