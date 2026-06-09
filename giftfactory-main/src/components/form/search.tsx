"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, Package, Loader2, AlertCircle, X, TrendingUp, Clock, ArrowUpRight, Sparkles } from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  fetchProductSuggest,
  fetchCategories,
  recordSearchHistory,
  fetchSearchAutoComplete,
  fetchProductRecommended,
  fetchSearchHistory,
  SEARCH_HISTORY_QUERY_KEY,
  clearAllSearchHistory,
  deleteSearchHistoryItem
} from "@/lib/api";
import type { ApiCategory, ApiProduct } from "@/types/api";

const formSchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().optional(),
});

const MIN_QUERY_LENGTH = 2;

export function SearchForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const [queryForSuggest, setQueryForSuggest] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionsListRef = useRef<HTMLUListElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: "", categoryId: "all" },
  });

  const { data: catRes } = useQuery({
    queryKey: ["web", "categories"],
    queryFn: fetchCategories,
  });
  const categories = (catRes?.data ?? []) as ApiCategory[];

  const { data: trendingRes } = useQuery({
    queryKey: ["web", "trending-search"],
    queryFn: () => fetchProductRecommended({ limit: 6 }),
    staleTime: 5 * 60 * 1000,
  });
  const trendingProducts = (trendingRes?.data?.products ?? []) as ApiProduct[];

  const { data: historyRes } = useQuery({
    queryKey: SEARCH_HISTORY_QUERY_KEY,
    queryFn: fetchSearchHistory,
    enabled: status === "authenticated",
    staleTime: 30 * 1000,
  });
  const searchHistory = (historyRes?.data ?? []) as { id: string; query: string; categoryId?: string; createdAt: string }[];
  const recentSearches = searchHistory.slice(0, 4);

  const query = form.watch("query");

  const { data: suggestRes, isLoading: suggestLoading, isError: suggestError } = useQuery({
    queryKey: ["web", "search", "autoComplete", queryForSuggest],
    queryFn: () => fetchSearchAutoComplete(queryForSuggest),
    enabled: queryForSuggest.length >= MIN_QUERY_LENGTH,
    staleTime: 60 * 1000,
    retry: false,
  });

  const suggestions: { text: string; type: string; confidence: number }[] =
    (suggestRes?.meta?.suggestions) || [];

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedSuggestionIndex(-1);
  }, [suggestions]);

  const updateDropdownRect = useCallback(() => {
    if (inputWrapRef.current) {
      const rect = inputWrapRef.current.getBoundingClientRect();
      setDropdownRect({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    } else {
      setDropdownRect(null);
    }
  }, []);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const trimmed = (query ?? "").trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (trimmed.length >= MIN_QUERY_LENGTH) {
      debounceRef.current = setTimeout(() => {
        setQueryForSuggest(trimmed);
        setShowSuggestions(true);
        setTimeout(updateDropdownRect, 0);
      }, 200);
    } else {
      setQueryForSuggest("");
      setShowSuggestions(false);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, updateDropdownRect]);

  useEffect(() => {
    if (!showSuggestions) return;
    updateDropdownRect();
    const handler = () => updateDropdownRect();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [showSuggestions, updateDropdownRect]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (dropdownRef.current?.contains(target) || inputWrapRef.current?.contains(target)) return;
      setShowSuggestions(false);
      setIsFocused(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dismissSearchUi = useCallback(() => {
    setShowSuggestions(false);
    setIsFocused(false);
    setSelectedSuggestionIndex(-1);

    const activeElement = document.activeElement as HTMLElement | null;
    if (activeElement && typeof activeElement.blur === "function") {
      activeElement.blur();
    }
    inputRef.current?.blur();
  }, []);

  const navigateToProducts = useCallback(
    (searchQuery: string, categoryId?: string) => {
      dismissSearchUi();
      const trimmedQuery = searchQuery.trim();
      const selectedCategoryId = categoryId && categoryId !== "all" ? categoryId : undefined;

      if (status === "authenticated") {
        recordSearchHistory({
          query: trimmedQuery || undefined,
          categoryId: selectedCategoryId,
        })
          .then(() => {
            queryClient.invalidateQueries({ queryKey: SEARCH_HISTORY_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ["customer", "recommended"] });
          })
          .catch(() => { });
      }

      const params = new URLSearchParams();
      if (trimmedQuery) params.set("search", trimmedQuery);
      if (selectedCategoryId) params.set("categoryId", selectedCategoryId);
      router.push(params.toString() ? `/products?${params.toString()}` : "/products");
    },
    [dismissSearchUi, router, status, session, queryClient]
  );

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      navigateToProducts(values.query ?? "", values.categoryId);
    },
    [navigateToProducts]
  );

  const handleClearHistory = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await clearAllSearchHistory();
      queryClient.invalidateQueries({ queryKey: SEARCH_HISTORY_QUERY_KEY });
    } catch (err) {
      console.error("Failed to clear search history:", err);
    }
  }, [queryClient]);

  const handleDeleteHistoryItem = useCallback(async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteSearchHistoryItem(id);
      queryClient.invalidateQueries({ queryKey: SEARCH_HISTORY_QUERY_KEY });
    } catch (err) {
      console.error("Failed to delete search history item:", err);
    }
  }, [queryClient]);

  const firstSuggestion = suggestions[0]?.text || "";
  const getPostfix = () => {
    if (!query || query.length < MIN_QUERY_LENGTH || !firstSuggestion) return "";
    if (firstSuggestion.toLowerCase().startsWith(query.toLowerCase())) {
      return firstSuggestion.slice(query.length);
    }
    return "";
  };
  const typeaheadPostfix = getPostfix();

  // Handle keyboard navigation in suggestions
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Inline typeahead autocompletion on Tab or ArrowRight
      if (typeaheadPostfix && (e.key === "Tab" || e.key === "ArrowRight")) {
        const cursorPosition = inputRef.current?.selectionStart ?? 0;
        const textLength = inputRef.current?.value.length ?? 0;

        // Accept on Tab, or on ArrowRight only when cursor is at the end of the text
        if (e.key === "Tab" || cursorPosition === textLength) {
          e.preventDefault();
          form.setValue("query", firstSuggestion);
          setQueryForSuggest(firstSuggestion);
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.selectionStart = firstSuggestion.length;
              inputRef.current.selectionEnd = firstSuggestion.length;
            }
          }, 0);
          return;
        }
      }

      if (!showSuggestions || suggestions.length === 0) {
        if (e.key === "Enter") {
          form.handleSubmit(onSubmit)();
        }
        if (e.key === "Escape") setShowSuggestions(false);
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedSuggestionIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedSuggestionIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
            const selectedSuggestion = suggestions[selectedSuggestionIndex];
            navigateToProducts(selectedSuggestion.text, form.getValues("categoryId"));
          } else {
            form.handleSubmit(onSubmit)();
          }
          break;
        case "Escape":
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
          break;
      }
    },
    [showSuggestions, suggestions, selectedSuggestionIndex, navigateToProducts, form, onSubmit, typeaheadPostfix, firstSuggestion]
  );

  const handleSuggestionClick = useCallback(
    (suggestionText: string) => {
      navigateToProducts(suggestionText, form.getValues("categoryId"));
    },
    [navigateToProducts, form]
  );

  const hasQuery = (query ?? "").trim().length > 0;
  const showEmptyDropdown = isFocused && !hasQuery;

  // Highlight the query in suggestion text
  function highlightText(text: string, q: string) {
    if (!q) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
      <span>
        {text.slice(0, idx)}
        <mark className="bg-transparent font-extrabold text-gray-900">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </span>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative w-full flex-1">

        {/* ── Search bar ── */}
        <div
          ref={inputWrapRef}
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            borderRadius: "9999px",
            height: "52px",
            overflow: "hidden",
            transition: "box-shadow 0.2s, background 0.2s",
            background: isFocused ? "#ffffff" : "#f3f4f6",
            boxShadow: isFocused
              ? "0 0 0 2px rgba(236,72,153,0.45), 0 4px 20px rgba(0,0,0,0.08)"
              : "none",
          }}
        >
          {/* Search input — left side, raw <input> to avoid shadcn conflicts */}
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="flex-1 min-w-0 mb-0 h-full">
                <FormControl>
                  <div className="relative flex items-center h-full flex-1">
                    {typeaheadPostfix && (
                      <div
                        style={{
                          position: "absolute",
                          left: "20px",
                          right: hasQuery ? "32px" : "12px",
                          top: 0,
                          bottom: 0,
                          display: "flex",
                          alignItems: "center",
                          pointerEvents: "none",
                          fontSize: "15px",
                          fontFamily: "inherit",
                          fontWeight: 400,
                          lineHeight: "normal",
                          background: "transparent",
                          whiteSpace: "pre",
                          overflow: "hidden",
                        }}
                      >
                        <span style={{ color: "transparent" }}>{query || ""}</span>
                        <span style={{ color: "#9ca3af", opacity: 0.7 }}>{typeaheadPostfix}</span>
                      </div>
                    )}
                    {(() => {
                      const { ref: fieldRef, ...fieldProps } = field;
                      return (
                        <input
                          ref={(el) => {
                            inputRef.current = el;
                            fieldRef(el);
                          }}
                          type="text"
                          placeholder="What are you looking for?"
                          autoComplete="off"
                          style={{
                            flex: 1,
                            height: "100%",
                            paddingLeft: "20px",
                            paddingRight: hasQuery ? "32px" : "12px",
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            fontSize: "15px",
                            color: "#1f2937",
                            fontWeight: 400,
                            width: "100%",
                          }}
                          className="placeholder-gray-400"
                          {...fieldProps}
                          onFocus={() => {
                            setIsFocused(true);
                            setShowSuggestions(true);
                            setTimeout(updateDropdownRect, 0);
                          }}
                          onBlur={() => setIsFocused(false)}
                          onKeyDown={handleKeyDown}
                        />
                      );
                    })()}
                    {hasQuery && (
                      <button
                        type="button"
                        onClick={() => { form.setValue("query", ""); setShowSuggestions(false); }}
                        style={{ position: "absolute", right: "6px", padding: "4px", borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center" }}
                        aria-label="Clear search"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          {/* Divider + Category select — right side, sm+ */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="hidden sm:flex items-center shrink-0 mb-0 h-full">
                {/* vertical divider */}
                <span style={{ width: "1px", height: "20px", background: "#d1d5db", flexShrink: 0 }} />
                <Select
                  value={field.value || "all"}
                  onValueChange={(val) => {
                    field.onChange(val);
                    onSubmit({ ...form.getValues(), categoryId: val });
                  }}
                >
                  <SelectTrigger
                    style={{
                      height: "100%",
                      minWidth: "60px",
                      maxWidth: "200px",
                      width: "max-content",
                      border: "none",
                      outline: "none",
                      boxShadow: "none",
                      background: "transparent",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#374151",
                      paddingLeft: "12px",
                      paddingRight: "10px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                    className="focus-visible:ring-0 focus-visible:ring-offset-0"
                  >
                    <span style={{ whiteSpace: "nowrap" }}>
                      {(!field.value || field.value === "all")
                        ? "All"
                        : (categories.find(c => c._id === field.value)?.name ?? "All")}
                    </span>
                  </SelectTrigger>
                  <SelectContent align="end" className="min-w-[240px] rounded-2xl shadow-2xl border border-gray-100 p-1.5">
                    <SelectItem value="all" className="rounded-xl font-semibold text-sm">All Departments</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c._id} className="rounded-xl text-sm">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Circular search button — sits flush at right edge of pill */}
          <div style={{ flexShrink: 0, paddingRight: "4px", paddingLeft: "4px", display: "flex", alignItems: "center" }}>
            <button
              type="submit"
              aria-label="Search"
              style={{
                height: "44px",
                width: "44px",
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(135deg, #ec4899, #f43f5e)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(236,72,153,0.4)",
                transition: "transform 0.15s, box-shadow 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(236,72,153,0.55)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(236,72,153,0.4)";
              }}
            >
              <Search style={{ height: "18px", width: "18px" }} />
            </button>
          </div>
        </div>

        {/* ── Suggestions / Trending dropdown ── */}
        {typeof document !== "undefined" &&
          showSuggestions &&
          (showEmptyDropdown || (query ?? "").trim().length >= MIN_QUERY_LENGTH) &&
          createPortal(
            <div
              ref={dropdownRef}
              className="fixed z-[9999] overflow-hidden rounded-2xl bg-white border border-gray-100/80"
              onMouseDown={(e) => e.preventDefault()}
              style={{
                boxShadow: "0 24px 64px rgba(0,0,0,0.12), 0 8px 32px rgba(236,72,153,0.08)",
                animation: "searchDropIn 0.18s cubic-bezier(0.16,1,0.3,1)",
                ...(dropdownRect
                  ? { top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width, maxHeight: 420 }
                  : { visibility: "hidden" }),
              }}
            >
              <style>{`
                @keyframes searchDropIn {
                  from { opacity: 0; transform: translateY(-8px) scale(0.98); }
                  to   { opacity: 1; transform: translateY(0)   scale(1); }
                }
              `}</style>

              {/* ── Empty state dropdown contents ── */}
              {showEmptyDropdown && (
                <div className="p-3 space-y-3">
                  {/* ── Recent Searches ── */}
                  {recentSearches.length > 0 && (
                    <div className="border-b border-gray-100 pb-3">
                      <div className="flex items-center justify-between px-2 py-1.5 mb-1.5">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Recent Searches</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearHistory}
                          className="text-[11px] font-bold text-gray-400 hover:text-pink-500 transition-colors cursor-pointer"
                        >
                          Clear all
                        </button>
                      </div>
                      <ul className="space-y-0.5">
                        {recentSearches.map((item, idx) => (
                          <li key={`${item.query}-${idx}`}>
                            <div className="group w-full flex items-center justify-between rounded-xl hover:bg-gray-50 transition-colors">
                              <div
                                role="button"
                                onClick={() => navigateToProducts(item.query, item.categoryId)}
                                className="flex-1 flex items-center gap-3 px-3 py-2 text-left cursor-pointer truncate"
                              >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-gray-50 border-gray-100 group-hover:bg-white group-hover:border-gray-200 group-hover:shadow-sm transition-all">
                                  <Clock className="h-4 w-4 text-gray-400 group-hover:text-pink-400 transition-colors" />
                                </span>
                                <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">{item.query}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                                className="mr-3 p-1.5 rounded-lg text-gray-300 text-red-700 bg-red-100 transition-colors cursor-pointer  focus:opacity-100 shrink-0"
                                aria-label="Delete search history item"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Trending now ── */}
                  <div>
                    <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                      <TrendingUp className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Trending now</span>
                    </div>
                    {trendingProducts.length === 0 ? (
                      <div className="flex flex-col items-center py-6 gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-pink-300" />
                        <span className="text-xs text-gray-400">Loading trending…</span>
                      </div>
                    ) : (
                      <ul className="space-y-0.5">
                        {trendingProducts.map((product, i) => {
                          const price = product.price?.sellingPrice ?? product.defaultPrice;
                          const img = product.thumbnail ?? product.baseImageUrl?.[0];
                          const productHref = `/products/${encodeURIComponent(product._id)}`;
                          return (
                            <li key={product._id}>
                              <Link
                                href={productHref}
                                onClick={(e) => {
                                  e.preventDefault();
                                  dismissSearchUi();
                                  router.push(productHref);
                                }}
                                className="group w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-left transition-colors"
                              >
                                {/* Rank or thumbnail */}
                                {img ? (
                                  <div className="relative h-9 w-9 shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                                    <img src={img} alt={product.title} className="h-full w-full object-cover" />
                                  </div>
                                ) : (
                                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 text-[11px] font-black text-pink-400">
                                    {i + 1}
                                  </span>
                                )}
                                <div className="flex-1 min-w-0">
                                  <span className="block text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">{product.title}</span>
                                  {price != null && (
                                    <span className="text-xs text-pink-500 font-semibold">₹{price.toLocaleString("en-IN")}</span>
                                  )}
                                </div>
                                <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-pink-400 shrink-0 transition-colors" />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* ── Typing suggestions ── */}
              {!showEmptyDropdown && (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Suggestions</span>
                    </div>
                    <span className="text-xs text-gray-400 italic truncate max-w-[120px]">
                      &ldquo;{(query ?? "").trim()}&rdquo;
                    </span>
                  </div>

                  <div className="max-h-[310px] overflow-auto">
                    {suggestLoading ? (
                      /* Skeleton */
                      <ul className="p-3 space-y-2">
                        {[1, 2, 3, 4].map((n) => (
                          <li key={n} className="flex items-center gap-3 px-3 py-2">
                            <div className="h-8 w-8 rounded-lg bg-gray-100 animate-pulse shrink-0" />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-3 bg-gray-100 rounded-full animate-pulse w-3/4" />
                              <div className="h-2.5 bg-gray-100 rounded-full animate-pulse w-1/3" />
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : suggestError ? (
                      <div className="px-4 py-10 flex flex-col items-center gap-3 text-center">
                        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                          <AlertCircle className="h-6 w-6 text-red-400" />
                        </div>
                        <span className="text-sm text-gray-500">Could not load suggestions</span>
                      </div>
                    ) : suggestions.length === 0 ? (
                      <div className="px-4 py-10 flex flex-col items-center gap-3 text-center">
                        <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-300" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">No results found</p>
                          <p className="text-xs text-gray-400 mt-0.5">Try a different keyword</p>
                        </div>
                      </div>
                    ) : (
                      <ul className="p-2 space-y-0.5" ref={suggestionsListRef}>
                        {suggestions.map((item, idx) => {
                          const isSelected = selectedSuggestionIndex === idx;
                          const isRecent = item.type === "history" || item.type === "recent";
                          return (
                            <li key={`${item.text}-${idx}`}>
                              <button
                                type="button"
                                onClick={() => handleSuggestionClick(item.text)}
                                className={`
                                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                  transition-all duration-150 text-left group
                                  ${isSelected
                                    ? "bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-400/25"
                                    : "hover:bg-gray-50"
                                  }
                                `}
                              >
                                {/* Icon */}
                                <span className={`
                                  flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all
                                  ${isSelected
                                    ? "bg-white/20 border-white/30"
                                    : "bg-gray-50 border-gray-100 group-hover:bg-white group-hover:border-gray-200 group-hover:shadow-sm"
                                  }
                                `}>
                                  {isRecent
                                    ? <Clock className={`h-4 w-4 ${isSelected ? "text-white" : "text-gray-400 group-hover:text-pink-400"}`} />
                                    : <Search className={`h-4 w-4 ${isSelected ? "text-white" : "text-gray-400 group-hover:text-pink-400"}`} />
                                  }
                                </span>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                  <span className={`text-sm font-medium block truncate ${isSelected ? "text-white" : "text-gray-700 group-hover:text-gray-900"}`}>
                                    {highlightText(item.text, (query ?? "").trim())}
                                  </span>
                                  {item.type && (
                                    <span className={`text-[11px] capitalize mt-0.5 block ${isSelected ? "text-white/60" : "text-gray-400"}`}>
                                      {isRecent ? "Recent search" : item.type} · {item.confidence}% match
                                    </span>
                                  )}
                                </div>

                                {/* Arrow */}
                                <ArrowUpRight className={`h-4 w-4 shrink-0 transition-all ${isSelected ? "text-white" : "text-gray-300 group-hover:text-pink-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"}`} />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* Footer keyboard hints */}
                  {suggestions.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/70">
                      <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-gray-200 text-gray-500 font-mono text-[10px] shadow-sm">↑↓</kbd>
                          navigate
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="flex items-center gap-1.5">
                          <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-gray-200 text-gray-500 font-mono text-[10px] shadow-sm">↵</kbd>
                          select
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="flex items-center gap-1.5">
                          <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-gray-200 text-gray-500 font-mono text-[10px] shadow-sm">Esc</kbd>
                          close
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>,
            document.body
          )}
      </form>
    </Form>
  );
}
