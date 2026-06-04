// components/cards/blog-card.tsx
import Image from "next/image";
import Link from "next/link";

type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
};

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/blog/${post.id}`} className="block relative aspect-video">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
        />
      </Link>
      <div className="p-6">
        <div className="text-sm text-gray-500 mb-2">
          By {post.author} • {post.date}
        </div>
        <Link href={`/blog/${post.id}`}>
          <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors">
            {post.title}
          </h3>
        </Link>
        <p className="text-gray-600 mb-4">{post.excerpt}</p>
        <Link
          href={`/blog/${post.id}`}
          className="text-primary font-medium hover:underline"
        >
          Read More
        </Link>
      </div>
    </div>
  );
}
