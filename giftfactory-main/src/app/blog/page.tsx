"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBlogList, fetchBlogCategories } from "@/lib/api";
import { Search, Calendar, Tag, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    month: "short",
    day: "numeric",
  });
}

function BlogCard({ post }: { post: BlogPost }) {
  const date = post.publishedAt ?? post.createdAt;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary/30 transition-all"
    >
      {post.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt={post.title}
          className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="h-48 bg-gradient-to-br from-primary/10 to-dusty-rose/10 flex items-center justify-center">
          <Tag className="h-10 w-10 text-primary/30" />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        {post.category && (
          <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
            {post.category}
          </span>
        )}
        <h2 className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-base leading-snug mb-2 line-clamp-2">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          {date && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(date)}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-primary font-medium">
            Read more <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function BlogSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-100 rounded w-1/4" />
        <div className="h-5 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 9;

  const { data: catRes } = useQuery({
    queryKey: ["blog", "categories"],
    queryFn: fetchBlogCategories,
    staleTime: 10 * 60_000,
  });
  const categories = (catRes?.data ?? []) as string[];

  const { data: postsRes, isLoading } = useQuery({
    queryKey: ["blog", "list", page, search, category],
    queryFn: () => fetchBlogList({ page, limit: LIMIT, search: search || undefined, category: category || undefined }),
    staleTime: 2 * 60_000,
  });

  const posts = ((postsRes as any)?.data ?? []) as BlogPost[];
  const total: number = (postsRes as any)?.total ?? (postsRes as any)?.pagination?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT) || 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#232f3e] to-[#37475a] text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Gift Factory Blog</h1>
          <p className="text-gray-300 text-lg mb-8">
            Style tips, gift guides, product stories, and more.
          </p>
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search articles..."
              className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 rounded-full px-5 flex-1 focus-visible:ring-white/50"
            />
            <Button type="submit" className="rounded-full px-5 bg-primary hover:bg-primary/90">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Category filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => { setCategory(""); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !category
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary/50"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category === cat
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-primary/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: LIMIT }).map((_, i) => <BlogSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No articles found</h2>
            <p className="text-gray-500 text-sm">
              {search ? `No results for "${search}". Try a different search.` : "Check back soon for new content."}
            </p>
            {search && (
              <button
                onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
                className="mt-4 text-primary text-sm hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:border-primary/50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:border-primary/50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
