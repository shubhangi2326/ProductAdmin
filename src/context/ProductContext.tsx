'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/product';

const LOCAL_MUTATIONS_KEY = 'admin_product_mutations_v1';

interface LocalMutations {
  added: Product[];
  edited: Record<number, Partial<Product>>;
  deleted: number[];
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
    apiTotal: number
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
    apiTotal: number
  ): { products: Product[]; total: number } => {
    // 1. Filter out deleted products from fetched products
    const nonDeleted = fetchedProducts.filter((p) => !mutations.deleted.includes(p.id));

    // 2. Apply edits to existing products
    const editedMerged = nonDeleted.map((p) => {
      if (mutations.edited[p.id]) {
        return { ...p, ...mutations.edited[p.id] };
      }
      return p;
    });

    // 3. For added products: filter out any that might be in deleted list
    const validAdded = mutations.added.filter((p) => !mutations.deleted.includes(p.id));

    // Total count adjusted for added items and deleted items
    const adjustedTotal = Math.max(0, apiTotal + validAdded.length - mutations.deleted.length);

    return {
      products: editedMerged,
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
