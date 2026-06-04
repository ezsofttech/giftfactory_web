// components/sections/blog.tsx

import { BlogCard } from "../card/blog-card";
import { Button } from "../ui/button";

export function BlogSection() {
  const posts = [
    {
      id: 1,
      title: "The Latest Fashion Trends for Summer",
      excerpt: "Discover the must-have items for your summer wardrobe.",
      image: "https://picsum.photos/seed/blog/800/400",
      date: "June 15, 2023",
      author: "Jane Doe",
    },
    // Add more posts...
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Latest Blog Posts</h2>
          <Button variant="outline">View All</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
