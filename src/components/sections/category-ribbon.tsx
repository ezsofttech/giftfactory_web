"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/services/category";
import { CustomIcon } from "../ui/custom-icon";

export function CategoryRibbon() {
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories();
  const [open, setOpen] = useState<string | null>(null);
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Close dropdown if click is outside the ref
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = Object.values(contentRefs.current).every(
        (ref) => ref && !ref.contains(event.target as Node)
      );

      const isNotTrigger = Object.values(triggerRefs.current).every(
        (ref) => ref && !ref.contains(event.target as Node)
      );

      if (isOutside && isNotTrigger) {
        setOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTriggerEnter = (menuId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(menuId);
  };

  const handleContentLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(null);
    }, 200);
  };

  const handleTriggerLeave = (e: React.MouseEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    const isMovingToAnotherTrigger = Object.values(triggerRefs.current).some(
      (ref) => ref && ref.contains(relatedTarget)
    );

    if (
      !isMovingToAnotherTrigger &&
      !contentRefs.current[open || ""]?.contains(relatedTarget)
    ) {
      setOpen(null);
    }
  };

  return (
    <div className="bg-muted/40 border-b border-border sticky top-32 z-50">
      <div className="container mx-auto px-4">
        <div className="hidden md:flex items-center gap-1 py-2">
          {/* "All Categories" button */}
          <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
            <CustomIcon
              iconName="material-symbols:list-rounded"
              className="w-5 h-5 text-primary/80"
            />
            All Categories
          </button>

          {isCategoriesLoading ? (
            <div className="flex flex-row gap-4 px-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-24" />
              ))}
            </div>
          ) : (
            <div className="flex flex-row overflow-x-auto scrollbar-hide flex-1 gap-0.5">
              {(Array.isArray(categoriesData) ? categoriesData : []).map((category) => (
                <Link
                  key={category._id}
                  href={`/products?categoryId=${category._id}`}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap capitalize"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
          <Link
            href="/sell"
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap"
          >
            Become a Supplier
          </Link>
          <Link
            href="/help"
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap"
          >
            Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
