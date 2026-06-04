// components/sections/categories.tsx
import { Button } from "@/components/ui/button";
import { CategoryCard } from "../card/category-card";

export function CategoriesSection() {
  const categories = [
    {
      id: 1,
      name: "Electronics",
      image: "https://cdn-icons-png.flaticon.com/512/1867/1867646.png ",
      count: 24,
    },
    {
      id: 2,
      name: "Fashion",
      image: "https://cdn-icons-png.flaticon.com/512/1867/1867646.png ",
      count: 18,
    },
    {
      id: 3,
      name: "Home & Garden",
      image: "https://cdn-icons-png.flaticon.com/512/1867/1867646.png ",
      count: 15,
    },
    {
      id: 4,
      name: "Sports",
      image: "https://cdn-icons-png.flaticon.com/512/1867/1867646.png ",
      count: 12,
    },
    {
      id: 5,
      name: "Health & Beauty",
      image: "https://cdn-icons-png.flaticon.com/512/1867/1867646.png ",
      count: 9,
    },
    {
      id: 6,
      name: "Toys & Games",
      image: "https://cdn-icons-png.flaticon.com/512/1867/1867646.png ",
      count: 7,
    },
  ];

  return (
    <section className="py-12 bg-gray-50 bg-[url(https://images.unsplash.com/photo-1663798288060-75c427d0b580?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)] bg-no-repeat bg-cover">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Top Categories</h2>
          <Button variant="outline">View All</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
