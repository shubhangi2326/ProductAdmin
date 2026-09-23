'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ProductQueryParams } from '@/types/product';

const LOCAL_MUTATIONS_KEY = 'admin_product_mutations_v1';

interface LocalMutations {
  added: Product[];
  edited: Record<number, Partial<Product>>;
  deleted: number[];
}

export interface ApplyLocalMutationsOptions {
  category?: string;
  q?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface ProductContextType {
  addedProducts: Product[];
  editedProducts: Record<number, Partial<Product>>;
  deletedProductIds: number[];
  addLocalProduct: (product: Product) => void;
  updateLocalProduct: (id: number, productData: Partial<Product>) => void;
  deleteLocalProduct: (id: number) => void;
  getOverriddenProduct: (product: Product) => Product;
  applyLocalMutations: (
    fetchedProducts: Product[],
    apiTotal: number,
    options?: ApplyLocalMutationsOptions
  ) => { products: Product[]; total: number };
  resetMutations: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [mutations, setMutations] = useState<LocalMutations>({
    added: [],
    edited: {},
    deleted: [],
  });

  // Rehydrate local mutations from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_MUTATIONS_KEY);
      if (saved) {
        setMutations(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load local product mutations:', e);
    }
  }, []);

  // Save to localStorage on change
  const saveMutations = (newMutations: LocalMutations) => {
    setMutations(newMutations);
    try {
      localStorage.setItem(LOCAL_MUTATIONS_KEY, JSON.stringify(newMutations));
    } catch (e) {
      console.error('Failed to save product mutations to localStorage:', e);
    }
  };

  const addLocalProduct = (newProduct: Product) => {
    const updatedAdded = [newProduct, ...mutations.added];
    saveMutations({
      ...mutations,
      added: updatedAdded,
    });
  };

  const updateLocalProduct = (id: number, productData: Partial<Product>) => {
    // Check if it's a locally added product first
    const isAddedIndex = mutations.added.findIndex((p) => p.id === id);
    if (isAddedIndex !== -1) {
      const updatedAdded = [...mutations.added];
      updatedAdded[isAddedIndex] = { ...updatedAdded[isAddedIndex], ...productData };
      saveMutations({
        ...mutations,
        added: updatedAdded,
      });
    } else {
      // It's an API product being edited
      const updatedEdited = {
        ...mutations.edited,
        [id]: { ...(mutations.edited[id] || {}), ...productData },
      };
      saveMutations({
        ...mutations,
        edited: updatedEdited,
      });
    }
  };

  const deleteLocalProduct = (id: number) => {
    // If it was locally added, remove it from added array
    const updatedAdded = mutations.added.filter((p) => p.id !== id);
    // Add to deleted IDs array if not already present
    const updatedDeleted = mutations.deleted.includes(id)
      ? mutations.deleted
      : [...mutations.deleted, id];

    saveMutations({
      ...mutations,
      added: updatedAdded,
      deleted: updatedDeleted,
    });
  };

  const getOverriddenProduct = (product: Product): Product => {
    if (mutations.edited[product.id]) {
      return { ...product, ...mutations.edited[product.id] };
    }
    return product;
  };

  const applyLocalMutations = (
    fetchedProducts: Product[],
    apiTotal: number,
    options?: ApplyLocalMutationsOptions
  ): { products: Product[]; total: number } => {
    const category =
      options?.category && options.category !== 'all'
        ? options.category.trim().toLowerCase()
        : '';
    const q = options?.q ? options.q.trim().toLowerCase() : '';
    const sortBy = options?.sortBy || '';
    const order = options?.order || 'asc';
    const page = options?.page || 1;
    const limit = options?.limit || 10;

    // 1. Filter locally added products by active category & search query
    const matchingAdded = mutations.added.filter((p) => {
      // Exclude if deleted
      if (mutations.deleted.includes(p.id)) return false;

      // Category filter check (case-insensitive)
      if (category && p.category.trim().toLowerCase() !== category) {
        return false;
      }

      // Search query check (title, description, brand, category)
      if (q) {
        const titleMatch = p.title.toLowerCase().includes(q);
        const descMatch = p.description.toLowerCase().includes(q);
        const brandMatch = p.brand ? p.brand.toLowerCase().includes(q) : false;
        const catMatch = p.category.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !brandMatch && !catMatch) {
          return false;
        }
      }

      return true;
    });

    // 2. Filter API products: exclude deleted items & apply local edits
    const nonDeletedApi = fetchedProducts.filter((p) => !mutations.deleted.includes(p.id));

    const editedApi = nonDeletedApi
      .map((p) => {
        if (mutations.edited[p.id]) {
          return { ...p, ...mutations.edited[p.id] };
        }
        return p;
      })
      .filter((p) => {
        // If an edited product's category was modified locally, verify match
        if (category && p.category.trim().toLowerCase() !== category) {
          return false;
        }
        return true;
      });

    // Count API products that were deleted
    const deletedApiCount = mutations.deleted.filter(
      (id) => !mutations.added.some((ap) => ap.id === id)
    ).length;

    // Calculate total count accurately
    const adjustedTotal = Math.max(0, apiTotal + matchingAdded.length - deletedApiCount);

    // Combine local added products and API products
    // On Page 1 (or when sorting), prepend local added products
    let combined: Product[] = [];
    if (page === 1 || sortBy) {
      combined = [...matchingAdded, ...editedApi];
    } else {
      combined = [...editedApi];
    }

    // Apply sorting if a sort field is specified
    if (sortBy) {
      combined.sort((a, b) => {
        const valA = (a as unknown as Record<string, unknown>)[sortBy];
        const valB = (b as unknown as Record<string, unknown>)[sortBy];

        if (typeof valA === 'string' && typeof valB === 'string') {
          return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return order === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
    }

    // Slice for current page limit
    const paginatedProducts = combined.slice(0, limit);

    return {
      products: paginatedProducts,
      total: adjustedTotal,
    };
  };

  const resetMutations = () => {
    const empty = { added: [], edited: {}, deleted: [] };
    setMutations(empty);
    localStorage.removeItem(LOCAL_MUTATIONS_KEY);
  };

  return (
    <ProductContext.Provider
      value={{
        addedProducts: mutations.added,
        editedProducts: mutations.edited,
        deletedProductIds: mutations.deleted,
        addLocalProduct,
        updateLocalProduct,
        deleteLocalProduct,
        getOverriddenProduct,
        applyLocalMutations,
        resetMutations,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};
