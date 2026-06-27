'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api';
import type { ProductDisplay } from '@/types/api';

const get = axiosInstance.get.bind(axiosInstance);
const post = axiosInstance.post.bind(axiosInstance);
const patch = axiosInstance.patch.bind(axiosInstance);

export type NotificationItem = {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  metadata?: any;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
};

/**
 * Hook to retrieve all notifications for the current authenticated user.
 */
export function useNotifications(options?: { enabled?: boolean }) {
  return useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await get(API_ENDPOINTS.customer.notifications);
      const raw = data?.data ?? data ?? [];
      return (Array.isArray(raw) ? raw : []).map((item: any) => ({
        ...item,
        id: item._id || item.id,
      }));
    },
    refetchInterval: 10000, // Auto-refetch every 10 seconds for real-time notifications
    ...options,
  });
}

/**
 * Mutation to mark a specific notification as read.
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await patch(API_ENDPOINTS.customer.notificationRead(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Normalization helper to map retention recommended products to the standard ProductDisplay format.
 */
export function mapRetentionProductToDisplay(p: any): ProductDisplay {
  const price = p.price != null ? Number(p.price) : 0;
  const mrp = p.mrpPrice != null ? Number(p.mrpPrice) : undefined;
  const discountPercentage = mrp && mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
  const rating = p.ratingAvg != null ? Number(p.ratingAvg) : 0;
  const images = Array.isArray(p.imageUrls) ? p.imageUrls : (p.imageUrl ? [p.imageUrl] : []);
  const PLACEHOLDER_IMAGE = '/images/placeholder.png';

  return {
    id: p.id || p._id || "",
    title: p.name || p.title || "",
    description: p.description || "",
    price,
    mrp,
    discountPercentage,
    rating,
    reviewCount: p.reviewCount ?? 0,
    thumbnail: p.imageUrl || (images.length > 0 ? images[0] : PLACEHOLDER_IMAGE),
    images,
    slug: p.slug || "",
    stock: p.stock ?? 0,
  };
}

/**
 * Hook to retrieve product recommendations for notification/retention context.
 */
export function useRetentionRecommendations(options?: { enabled?: boolean }) {
  return useQuery<any[]>({
    queryKey: ['retentionRecommendations'],
    queryFn: async () => {
      const { data } = await get(API_ENDPOINTS.customer.retentionRecommendations);
      const raw = data?.data ?? data ?? [];
      return Array.isArray(raw) ? raw : [];
    },
    ...options,
  });
}

/**
 * Hook to retrieve the active abandoned cart details for the authenticated user.
 */
export function useActiveAbandonedCart(options?: { enabled?: boolean }) {
  return useQuery<any>({
    queryKey: ['activeAbandonedCart'],
    queryFn: async () => {
      const { data } = await get(API_ENDPOINTS.customer.retentionAbandonedCart);
      return data?.data ?? data ?? null;
    },
    ...options,
  });
}

/**
 * Hook to retrieve the customer segments for the authenticated user.
 */
export function useCustomerSegments(options?: { enabled?: boolean }) {
  return useQuery<string[]>({
    queryKey: ['customerSegments'],
    queryFn: async () => {
      const { data } = await get(API_ENDPOINTS.customer.retentionSegments);
      const raw = data?.data ?? data ?? [];
      return Array.isArray(raw) ? raw : [];
    },
    ...options,
  });
}

/**
 * Mutation hook to register a referral invite.
 */
export function useReferralInvite() {
  return useMutation({
    mutationFn: async (body: { referrerCode: string; refereeEmail: string }) => {
      const { data } = await post(API_ENDPOINTS.customer.retentionReferralInvite, body);
      return data;
    },
  });
}
