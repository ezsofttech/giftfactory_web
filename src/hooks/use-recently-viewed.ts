import { useState, useEffect } from 'react';

export interface RecentlyViewedItem {
    id: string;
    title: string;
    price: number;
    mrp?: number;
    discountPercentage?: number;
    thumbnail: string;
    rating: number;
    reviewCount?: number;
    slug?: string;
    addedAt: number;
}

const STORAGE_KEY = 'recently_viewed_products';
/** Bump this whenever the stored shape changes — forces a clean slate for stale data */
const STORAGE_VERSION = 2;
const VERSION_KEY = 'recently_viewed_version';
const MAX_ITEMS = 8;
const PLACEHOLDER = 'https://picsum.photos/seed/gift/400/400';

function isValidItem(item: RecentlyViewedItem): boolean {
    return (
        !!item.id &&
        !!item.title &&
        item.price > 0 &&
        !!item.thumbnail &&
        item.thumbnail !== 'PLACEHOLDER_IMAGE' &&
        item.thumbnail !== 'undefined' &&
        item.thumbnail !== 'null'
    );
}

function sanitize(item: RecentlyViewedItem): RecentlyViewedItem {
    return {
        ...item,
        thumbnail:
            item.thumbnail &&
            item.thumbnail !== 'PLACEHOLDER_IMAGE' &&
            item.thumbnail !== 'undefined' &&
            item.thumbnail !== 'null'
                ? item.thumbnail
                : PLACEHOLDER,
    };
}

export function useRecentlyViewed() {
    const [items, setItems] = useState<RecentlyViewedItem[]>([]);

    useEffect(() => {
        try {
            // Wipe stale data if version changed
            const storedVersion = Number(localStorage.getItem(VERSION_KEY) ?? 0);
            if (storedVersion !== STORAGE_VERSION) {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION));
                return;
            }
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed: RecentlyViewedItem[] = JSON.parse(stored);
                setItems(parsed.filter(isValidItem).map(sanitize));
            }
        } catch {
            // ignore parse errors
        }
    }, []);

    const addProduct = (product: Omit<RecentlyViewedItem, 'addedAt'>) => {
        // Don't store items with no price or bad thumbnails
        if (!product.id || !product.title || product.price <= 0) return;

        const sanitized = sanitize({ ...product, addedAt: Date.now() });

        setItems((prev) => {
            const filtered = prev.filter((item) => item.id !== product.id);
            const newItems = [sanitized, ...filtered].slice(0, MAX_ITEMS);
            try {
                localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION));
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
            } catch {
                // ignore storage errors
            }
            return newItems;
        });
    };

    return { items, addProduct };
}
