'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { fetchProducts, fetchProductCategories } from '@/api/products';
import { Product, CategoryItem, ProductQueryParams } from '@/types/product';
import { parseQueryParams, buildQueryString } from '@/utils/urlParams';
import { useProductContext } from '@/context/ProductContext';

export function useProducts() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse query parameters defensively from URL
  const queryParams = parseQueryParams(searchParams);

  const { applyLocalMutations } = useProductContext();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Reference for active AbortController to prevent race conditions on fast typing
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load Categories on mount
  useEffect(() => {
    let isMounted = true;
    fetchProductCategories()
      .then((cats) => {
        if (isMounted) setCategories(cats);
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Primary function to fetch products based on current query parameters
  const loadProducts = useCallback(async () => {
    // Abort previous in-flight request if user typed or clicked quickly
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      // API call using Axios with signal parameter
      const data = await fetchProducts(queryParams, controller.signal);

      let fetchedList = data.products || [];
      let fetchedTotal = data.total || 0;

      // Handle Search + Category API limitation:
      // If user typed a search query AND selected a specific category,
      // client-side filter the search output for that category.
      if (queryParams.q && queryParams.category && queryParams.category !== 'all') {
        fetchedList = fetchedList.filter(
          (p) => p.category.toLowerCase() === queryParams.category.toLowerCase()
        );
        fetchedTotal = fetchedList.length;
      }

      // Apply in-memory local mutations (Add/Edit/Delete) overlay
      const { products: mergedList, total: adjustedTotal } = applyLocalMutations(
        fetchedList,
        fetchedTotal,
        queryParams
      );

      setProducts(mergedList);
      setTotal(adjustedTotal);
    } catch (err: unknown) {
      // Ignore abort/cancellation errors caused by intentional request cancellation
      if (
        axios.isCancel(err) ||
        (err instanceof Error &&
          (err.name === 'CanceledError' ||
            err.name === 'AbortError' ||
            err.message === 'canceled'))
      ) {
        return;
      }
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to load products. Please check your connection.';
      setError(msg);
    } finally {
      // Only turn off loading state if this controller wasn't aborted by a newer request
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, [
    queryParams.page,
    queryParams.limit,
    queryParams.q,
    queryParams.category,
    queryParams.sortBy,
    queryParams.order,
    applyLocalMutations,
  ]);

  // Execute fetch when query params change or local mutations trigger re-render
  useEffect(() => {
    loadProducts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadProducts]);

  // Navigation state update helper that pushes query changes to the URL
  const updateQueryParams = useCallback(
    (newParams: Partial<ProductQueryParams>) => {
      const merged = { ...queryParams, ...newParams };

      // Reset to page 1 whenever search query or category changes
      if (
        (newParams.q !== undefined && newParams.q !== queryParams.q) ||
        (newParams.category !== undefined && newParams.category !== queryParams.category) ||
        (newParams.limit !== undefined && newParams.limit !== queryParams.limit)
      ) {
        merged.page = 1;
      }

      const queryString = buildQueryString(merged);
      router.push(`/products${queryString}`, { scroll: false });
    },
    [queryParams, router]
  );

  return {
    products,
    total,
    categories,
    isLoading,
    error,
    queryParams,
    updateQueryParams,
    refreshProducts: loadProducts,
  };
}
