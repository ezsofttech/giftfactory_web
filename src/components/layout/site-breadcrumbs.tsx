"use client";

import { Fragment, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getBreadcrumbsFromPath } from "@/lib/breadcrumbs";
import { fetchProductById } from "@/lib/api";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function truncateLabel(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)} .......`;
}

export function SiteBreadcrumbs() {
  const pathname = usePathname() || "/";
  const items = useMemo(() => getBreadcrumbsFromPath(pathname), [pathname]);
  const pathSegments = useMemo(() => pathname.split("?")[0].split("/").filter(Boolean), [pathname]);
  const isProductDetail = pathSegments[0] === "products" && !!pathSegments[1] && pathSegments[1] !== "search";
  const productSlugOrId = isProductDetail ? decodeURIComponent(pathSegments[1]!) : "";

  const { data: productRes } = useQuery({
    queryKey: ["web", "product", "breadcrumb", productSlugOrId],
    queryFn: () => fetchProductById(productSlugOrId),
    enabled: isProductDetail && !!productSlugOrId,
    staleTime: 60_000,
  });
  const breadcrumbProductTitle = (productRes as { data?: { title?: string } } | undefined)?.data?.title?.trim() || "";

  if (items.length === 0) return null;

  return (
    <div className="border-b border-border/60 bg-muted/25">
      <div className="container mx-auto w-full min-w-0 max-w-7xl px-3 py-2.5 sm:px-4">
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, i) => (
              <Fragment key={`${item.label}-${i}-${item.href ?? "here"}`}>
                {i > 0 ? <BreadcrumbSeparator /> : null}
                <BreadcrumbItem>
                  {i === items.length - 1 && isProductDetail && breadcrumbProductTitle ? (
                    <BreadcrumbPage>
                      <span className="sm:hidden">{truncateLabel(breadcrumbProductTitle, 10)}</span>
                      <span className="hidden sm:inline">{truncateLabel(breadcrumbProductTitle, 40)}</span>
                    </BreadcrumbPage>
                  ) : item.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
