"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchBlogBySlug } from "@/lib/api";
import { Calendar, Tag, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  category?: string;
  author?: string;
  publishedAt?: string;
  createdAt?: string;
  tags?: string[];
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["blog", "post", slug],
    queryFn: () => fetchBlogBySlug(slug),
    enabled: !!slug,
  });

  const post = ((data as any)?.data ?? data) as BlogPost | undefined;
  const date = post?.publishedAt ?? post?.createdAt;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <Tag className="h-12 w-12 text-gray-300" />
        <h1 className="text-xl font-semibold text-gray-700">Article not found</h1>
        <Link href="/blog" className="text-primary text-sm hover:underline">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Cover */}
      {post.coverImage && (
        <div className="h-64 sm:h-80 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="container mx-auto px-4 max-w-3xl py-12">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* Meta */}
        {post.category && (
          <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-3 block">
            {post.category}
          </span>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
          {date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(date)}
            </span>
          )}
          {post.author && (
            <span>
              By <span className="font-medium text-gray-700">{post.author}</span>
            </span>
          )}
        </div>

        {/* Content */}
        {post.content ? (
          <div
            className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          post.excerpt && (
            <p className="text-gray-600 text-lg leading-relaxed">{post.excerpt}</p>
          )
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-gray-100">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            More articles
          </Link>
        </div>
      </div>
    </div>
  );
}
