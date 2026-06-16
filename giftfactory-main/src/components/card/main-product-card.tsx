import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Star, Heart, Eye, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/provider/auth-modal-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addCartItem, mergeCartIntoCache, fetchWishlist, fetchWishlistIds, toggleWishlistItem, fetchProductById, productQueryKey, PRODUCT_STALE_TIME_MS, addGuestCartItem } from "@/lib/api";
import { addToGuestCart, saveGuestCartId } from "@/lib/guest-cart";
import type { ApiWishlistItem, ApiProduct } from "@/types/api";

interface Product {
  id: string | number;
  title: string;
  description?: string;
  price: number;
  mrp?: number;
  discountPercentage: number;
  rating: number;
  /** From product list/detail payload; no extra /reviews call */
  reviewCount?: number;
  thumbnail: string;
  images?: string[];
  tags?: string[];
  availabilityStatus?: string;
  merchantId?: string;
  slug?: string;
  stock?: number;
  moq?: number;
  b2bPriceTiers?: { minQty: number; maxQty?: number | null; price: number; label?: string }[];
  variantCount?: number;
  variantLabels?: string[];
  /** Pre-selected variant ID — set when card represents a specific variant */
  preVariantId?: string;
  /** Human-readable variant label (e.g. "Red / L") shown as a badge on the card */
  variantTitle?: string;
}

interface ProductCardProps {
  product: Product;
  className?: string;
  /** Show the description text below the title. Default false — keeps carousel/grid cards compact. */
  showDescription?: boolean;
}

export function ProductCard({ product, className, showDescription = false }: ProductCardProps) {
  const router = useRouter();
  const { openAuthModal } = useAuthModal();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [api, setApi] = useState<CarouselApi>();
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const autoplay = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));
  const [showQuickView, setShowQuickView] = useState<boolean>(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  const customerId = session?.userId;
  const { data: wishlistIdsRes } = useQuery({
    queryKey: ["customer", "wishlist", "ids", customerId],
    queryFn: () => fetchWishlistIds(customerId as string),
    enabled: status === "authenticated" && !!customerId,
  });
  const wishlistIds = (wishlistIdsRes?.data ?? []) as Array<string | { productId: string; variantId?: string }>;
  const productIdStr = String(product.id);
  const isWishlisted = wishlistIds.some((item) => {
    if (typeof item === "string") {
      return item === productIdStr || (product.preVariantId && item === product.preVariantId);
    } else if (item && typeof item === "object") {
      const matchesProduct = item.productId === productIdStr;
      if (!matchesProduct) return false;
      if (product.preVariantId) {
        return item.variantId === product.preVariantId;
      }
      return !item.variantId;
    }
    return false;
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: toggleWishlistItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["customer", "wishlist", "ids"] });
      if (isWishlisted) {
        toast.success("Removed from wishlist");
      } else {
        toast.success("Added to wishlist");
      }
    },
    onError: () => toast.error("Failed to update wishlist"),
  });

  const avgRating = product.rating;
  const reviewCount = product.reviewCount ?? 0;


  // Handle hover events for auto-play
  useEffect(() => {
    if (!api || !carouselContainerRef.current) return;

    const container = carouselContainerRef.current;

    const handleMouseEnter = () => {
      if (autoplay.current && api) {
        try {
          autoplay.current.play();
        } catch {
          // Ignore autoplay errors when carousel is not fully initialized.
        }
      }
    };
    const handleMouseLeave = () => {
      if (autoplay.current && api) {
        try {
          autoplay.current.stop();
        } catch {
          // Ignore autoplay errors during teardown/unmount transitions.
        }
      }
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [api]);

  const showMrp = product.mrp != null && product.mrp > product.price;

  // Build a deduplicated ordered image list: thumbnail first, then remaining images
  const allImages: string[] = [];
  if (product.thumbnail) allImages.push(product.thumbnail);
  if (product.images?.length) {
    for (const img of product.images) {
      if (img && !allImages.includes(img)) allImages.push(img);
    }
  }
  if (allImages.length === 0) allImages.push("https://picsum.photos/seed/gift/400/400");

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated") {
      openAuthModal({ message: "Sign in to save items to your wishlist" });
      return;
    }
    toggleWishlistMutation.mutate({
      productId: productIdStr,
      ...(product.preVariantId ? { variantId: product.preVariantId } : {}),
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated") {
      addToGuestCart({
        productId: String(product.id),
        quantity: 1,
        priceAtAddition: product.price,
        title: product.title,
        thumbnail: product.thumbnail,
      });
      // Call backend guest cart API in background to sync
      addGuestCartItem({
        item: {
          productId: String(product.id),
          quantity: 1,
        },
      }).then((res) => {
        const cartId = (res as any)?.data?._id ?? (res as any)?._id ?? (res as any)?.data?.id ?? (res as any)?.id;
        if (cartId) {
          saveGuestCartId(cartId);
          queryClient.invalidateQueries({ queryKey: ["guest", "cart"] });
        }
      }).catch((err) => {
        console.error("Failed to sync guest cart item add to backend:", err);
      });
      toast(
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
              <Image src={product.thumbnail || "https://picsum.photos/seed/gift/400/400"} alt={product.title} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex flex-col justify-center flex-1">
              <p className="font-semibold text-sm whitespace-normal break-words leading-snug">{product.title}</p>
              <p className="text-xs text-muted-foreground">Added to cart (Sign in to checkout)</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-1">
            <button className="flex-1 px-3 py-1.5 text-xs font-medium border border-border rounded hover:bg-muted" onClick={() => router.push("/cart")}>View Cart</button>
            <button
              type="button"
              className="flex-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90"
              onClick={() =>
                openAuthModal({ message: "Sign in to checkout", callbackUrl: "/cart" })
              }
            >
              Sign In
            </button>
          </div>
        </div>,
        {
          duration: 5000,
          className: "w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:w-[420px] sm:max-w-[420px]",
        }
      );
      return;
    }

    setAddingToCart(true);
    try {
      // Fast path: card already carries the pre-selected variant ID (from flatMapApiProductsToCards).
      if (product.preVariantId) {
        const res = await addCartItem({
          item: { productId: String(product.id), variantId: product.preVariantId, quantity: 1 },
        });
        mergeCartIntoCache(queryClient, res);
        queryClient.invalidateQueries({ queryKey: ["customer", "cart"] });
        toast(
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                <img src={product.thumbnail || "https://picsum.photos/seed/gift/400/400"} alt={product.title} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex flex-col justify-center flex-1">
                <p className="font-semibold text-sm whitespace-normal break-words leading-snug">{product.title}</p>
                <p className="text-xs text-muted-foreground">Added to cart</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-1">
              <button className="flex-1 px-3 py-1.5 text-xs font-medium border border-border rounded hover:bg-muted" onClick={() => router.push("/cart")}>View Cart</button>
              <button className="flex-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90" onClick={() => router.push("/checkout")}>Checkout</button>
            </div>
          </div>,
          {
            duration: 4000,
            className: "w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:w-[420px] sm:max-w-[420px]",
          }
        );
        return;
      }

      // Use cached product when possible to avoid GET on every add-to-cart
      let variantId: string | undefined = undefined;
      try {
        const prodRes = await queryClient.fetchQuery({
          queryKey: productQueryKey(String(product.id)),
          queryFn: () => fetchProductById(String(product.id)),
          staleTime: PRODUCT_STALE_TIME_MS,
        });
        const prod = prodRes?.data as any;
        if (Array.isArray(prod?.variantIds) && prod.variantIds.length > 0) {
          // Allow pending + approved; only skip deleted or rejected
          const usableVariant = prod.variantIds.find(
            (v: any) =>
              typeof v === "object" &&
              v._id &&
              !v.isDeleted &&
              v.status !== "rejected"
          );
          const chosen = usableVariant ?? null;
          if (chosen) {
            variantId = chosen._id;
          } else if (typeof prod.variantIds[0] === "string") {
            variantId = prod.variantIds[0];
          }
        }
      } catch {
        // ignore
      }

      let res;
      if (variantId) {
        res = await addCartItem({
          item: { productId: String(product.id), variantId, quantity: 1 },
        });
      } else {
        res = await addCartItem({
          item: { productId: String(product.id), quantity: 1 },
        });
      }
      mergeCartIntoCache(queryClient, res);
      queryClient.invalidateQueries({ queryKey: ["customer", "cart"] });
      toast(
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
              <Image src={product.thumbnail || "https://picsum.photos/seed/gift/400/400"} alt={product.title} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex flex-col justify-center flex-1">
              <p className="font-semibold text-sm whitespace-normal break-words leading-snug">{product.title}</p>
              <p className="text-xs text-muted-foreground">Added to cart</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-1">
            <button className="flex-1 px-3 py-1.5 text-xs font-medium border border-border rounded hover:bg-muted" onClick={() => router.push("/cart")}>View Cart</button>
            <button className="flex-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90" onClick={() => router.push("/checkout")}>Checkout</button>
          </div>
        </div>,
        {
          duration: 4000,
          className: "w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:w-[420px] sm:max-w-[420px]",
        }
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to add to cart";
      toast.error(msg);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated") {
      const slugOrId = String(product.id);
      openAuthModal({
        message: "Sign in to buy now",
        callbackUrl: `/products/${slugOrId}`,
      });
      return;
    }

    setBuyingNow(true);
    try {
      // First, add the product to the cart
      let variantId: string | undefined = product.preVariantId;
      if (!variantId) {
        try {
          const prodRes = await queryClient.fetchQuery({
            queryKey: productQueryKey(String(product.id)),
            queryFn: () => fetchProductById(String(product.id)),
            staleTime: PRODUCT_STALE_TIME_MS,
          });
          const prod = prodRes?.data as any;
          if (Array.isArray(prod?.variantIds) && prod.variantIds.length > 0) {
            const usableVariant = prod.variantIds.find(
              (v: any) =>
                typeof v === "object" &&
                v._id &&
                !v.isDeleted &&
                v.status !== "rejected"
            );
            if (usableVariant) {
              variantId = usableVariant._id;
            } else if (typeof prod.variantIds[0] === "string") {
              variantId = prod.variantIds[0];
            }
          }
        } catch {
          // ignore
        }
      }

      // Add product to cart
      let res;
      if (variantId) {
        res = await addCartItem({
          item: { productId: String(product.id), variantId, quantity: 1 },
        });
      } else {
        res = await addCartItem({
          item: { productId: String(product.id), quantity: 1 },
        });
      }
      mergeCartIntoCache(queryClient, res);
      queryClient.invalidateQueries({ queryKey: ["customer", "cart"] });

      // Then redirect to checkout
      router.push(`/checkout`);
      setShowQuickView(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to buy now";
      toast.error(msg);
    } finally {
      setBuyingNow(false);
    }
  };

  const closeQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(false);
  };

  return (
    <Link
      href={`/products/${encodeURIComponent(product.id)}${product.preVariantId ? `?variantId=${product.preVariantId}` : ""}`}
      className={`block h-full min-w-0 ${className ?? ""}`}
    >
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow gap-0 py-0 relative">
        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          disabled={toggleWishlistMutation.isPending}
          className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 p-2.5 sm:p-2 rounded-full bg-white/90 backdrop-blur-sm transition-colors ${isWishlisted ? "text-red-500" : "text-gray-500 hover:text-red-500"} disabled:opacity-70`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className="w-[20px] h-[20px] sm:w-5 sm:h-5"
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>

        <CardHeader className="p-0 shrink-0">
          <div
            ref={carouselContainerRef}
            className="aspect-square relative overflow-hidden w-full"
          >
            <Carousel
              className="h-full pt-0 z-0"
              setApi={setApi}
              plugins={[autoplay.current]}
              opts={{ loop: allImages.length > 1 }}
            >
              <CarouselContent>
                {allImages.map((img, index) => (
                  <CarouselItem key={index} className="relative w-full h-full">
                    <img
                      src={img}
                      alt={index === 0 ? product.title : `${product.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselNext />
              <CarouselPrevious />
            </Carousel>

            <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between gap-2 sm:bottom-4 sm:left-4 sm:right-4">
              <button
                onClick={handleQuickView}
                className="flex h-12 w-12 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-800 shadow-md backdrop-blur-sm transition-colors hover:bg-gray-50"
                aria-label="Quick view"
              >
                <Eye className="h-[22px] w-[22px] sm:h-5 sm:w-5" />
              </button>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex h-12 w-12 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/20 transition-colors hover:bg-primary/90 disabled:opacity-70"
                aria-label="Add to cart"
              >
                {addingToCart
                  ? <span className="h-[22px] w-[22px] rounded-full border-2 border-white border-t-transparent animate-spin" />
                  : <ShoppingCart className="h-[22px] w-[22px] sm:h-5 sm:w-5" />}
              </button>
            </div>

            <div className="absolute top-2 left-2 right-2 flex flex-wrap justify-between gap-1">
              {product.availabilityStatus === "out_of_stock" && (
                <span className="bg-destructive text-white text-xs font-bold px-2 py-1 rounded-full">
                  Out of Stock
                </span>
              )}
              {product.availabilityStatus === "Low Stock" && (
                <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Low Stock
                </span>
              )}
              {showMrp && product.discountPercentage > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -{product.discountPercentage}%
                </span>
              )}
              {product.moq != null && product.moq > 0 && (
                <span className="bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                  MOQ {product.moq}
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-2 sm:p-4 flex flex-col flex-1 sm:min-h-[132px]">
          <div className="flex justify-between items-start gap-1 mb-0.5 sm:mb-1">
            <h3 className="font-semibold line-clamp-2 text-[11px] leading-tight sm:text-sm flex-1 min-w-0">{product.title}</h3>
            <div className="hidden sm:flex items-center shrink-0">
              {reviewCount > 0 ? (
                <>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-0.5 text-xs sm:text-sm">{avgRating.toFixed(1)} <span className="text-muted-foreground text-[10px]">({reviewCount})</span></span>
                </>
              ) : (
                <span className="text-[10px] text-muted-foreground">Be the first to review</span>
              )}
            </div>
          </div>

          {product.variantTitle && (
            <div className="hidden sm:block mb-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {product.variantTitle}
              </span>
            </div>
          )}

          {product.availabilityStatus !== "out_of_stock" && !(product.stock != null && product.stock === 0) && (
            <div className="mb-1">
              <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                <span className="font-bold text-foreground text-sm sm:text-lg">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {showMrp && product.mrp != null && (
                  <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                    ₹{product.mrp.toLocaleString("en-IN")}
                  </span>
                )}
                {showMrp && product.discountPercentage > 0 && (
                  <span className="text-[10px] sm:text-xs font-semibold text-red-500">-{product.discountPercentage}%</span>
                )}
              </div>
            </div>
          )}

          {(product.variantLabels?.length ?? 0) > 0 && (
            <div className="hidden sm:flex flex-wrap gap-1 mb-1.5">
              {product.variantLabels!.slice(0, 4).map((label, i) => (
                <span
                  key={`${label}-${i}`}
                  className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted/50 text-muted-foreground"
                >
                  {label}
                </span>
              ))}
              {(product.variantLabels!.length) > 4 && (
                <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">
                  +{product.variantLabels!.length - 4} more
                </span>
              )}
            </div>
          )}

          {product.stock != null && (
            <p className={`hidden sm:block text-[10px] font-medium mb-1 ${product.stock > 0 ? "text-green-600" : "text-destructive"}`}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
          )}

          {product.b2bPriceTiers?.length ? (
            <div className="hidden sm:block mb-1.5 rounded border border-border/60 bg-muted/30 px-2 py-1.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Bulk pricing</p>
              <div className="space-y-0.5">
                {product.b2bPriceTiers.slice(0, 4).map((tier, i) => (
                  <p key={i} className="text-xs text-foreground flex justify-between gap-2">
                    <span className="text-muted-foreground truncate">
                      {tier.maxQty != null ? `${tier.minQty}–${tier.maxQty}` : `${tier.minQty}+`} units
                    </span>
                    <span className="font-medium shrink-0">₹{Number(tier.price).toLocaleString("en-IN")}</span>
                  </p>
                ))}
                {product.b2bPriceTiers.length > 4 && (
                  <p className="text-[10px] text-muted-foreground">+{product.b2bPriceTiers.length - 4} more</p>
                )}
              </div>
            </div>
          ) : null}

          {showDescription && product.description && (
            <div className="hidden sm:block mb-2">
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 overflow-hidden">
                {product.description}
              </p>
            </div>
          )}

          {(product.tags?.length ?? 0) > 0 && (
            <div className="hidden sm:flex flex-wrap gap-1">
              {(product.tags ?? []).slice(0, 3).map((tag, i) => (
                <span
                  key={`${tag}-${i}`}
                  className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>

        {/* Quick View Modal */}
        {showQuickView && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeQuickView}
          >
            <div
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeQuickView}
                className="absolute top-4 right-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                aria-label="Close quick view"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid md:grid-cols-2 gap-8 p-6">
                <div className="aspect-square relative">
                  <img
                    src={product.thumbnail || "https://picsum.photos/seed/gift/400/400"}
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <div className="flex items-center">
                      {reviewCount > 0 ? (
                        <>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1">{avgRating.toFixed(1)} <span className="text-muted-foreground text-sm">({reviewCount} reviews)</span></span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">Be the first to review</span>
                      )}
                    </div>
                    {product.availabilityStatus === "out_of_stock" && (
                      <span className="bg-destructive text-white text-xs font-bold px-2 py-1 rounded-full">
                        Out of Stock
                      </span>
                    )}
                    {product.availabilityStatus === "Low Stock" && (
                      <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Low Stock
                      </span>
                    )}
                    {product.stock != null && product.stock > 0 && (
                      <span className="text-xs text-green-600 font-medium">{product.stock} in stock</span>
                    )}
                  </div>

                  {(product.variantLabels?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="text-xs text-muted-foreground font-medium">Variants:</span>
                      {product.variantLabels!.map((label, i) => (
                        <span
                          key={`${label}-${i}`}
                          className="text-xs px-2 py-0.5 rounded border border-border bg-muted/50 text-foreground"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-6 flex-wrap">
                    <span className="text-2xl font-bold">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {showMrp && product.mrp != null && (
                      <span className="text-sm text-muted-foreground">
                        M.R.P.: <span className="line-through">₹{product.mrp.toLocaleString("en-IN")}</span>
                      </span>
                    )}
                    {showMrp && product.discountPercentage > 0 && (
                      <span className="text-sm font-semibold text-red-600">-{product.discountPercentage}%</span>
                    )}
                    {product.moq != null && product.moq > 0 && (
                      <span className="bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                        MOQ {product.moq}
                      </span>
                    )}
                  </div>
                  {product.b2bPriceTiers?.length ? (
                    <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Bulk pricing</p>
                      <div className="space-y-1.5">
                        {product.b2bPriceTiers.map((tier, i) => (
                          <p key={i} className="text-sm flex justify-between gap-4">
                            <span className="text-muted-foreground">
                              {tier.maxQty != null ? `${tier.minQty}–${tier.maxQty}` : `${tier.minQty}+`} units
                            </span>
                            <span className="font-semibold">₹{Number(tier.price).toLocaleString("en-IN")}/unit</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <p className="mb-6">{product.description}</p>

                  {(product.tags?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(product.tags ?? []).map((tag, i) => (
                        <span
                          key={`${tag}-${i}`}
                          className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={handleAddToCart}
                      className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex items-center gap-2 border border-primary  text-primary px-6 py-2 rounded-full hover:bg-primary/10"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy Now
                    </button>
                    {/* <button
                      onClick={toggleWishlist}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                        isWishlisted
                          ? "border-red-500 text-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <Heart
                        className="w-5 h-5"
                        fill={isWishlisted ? "currentColor" : "none"}
                      />
                      {isWishlisted ? "Wishlisted" : "Wishlist"}
                    </button> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </Link>
  );
}
