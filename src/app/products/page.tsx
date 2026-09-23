'use client';

import React, { useState, Suspense } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/common/Header';
import ProductSearch from '@/components/products/ProductSearch';
import ProductFilterSort from '@/components/products/ProductFilterSort';
import ProductTable from '@/components/products/ProductTable';
import ProductCardGrid from '@/components/products/ProductCardGrid';
import Pagination from '@/components/products/Pagination';
import ProductFormModal from '@/components/products/ProductFormModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { TableSkeleton, CardSkeleton, Spinner } from '@/components/common/Loader';
import { useProducts } from '@/hooks/useProducts';
import { useProductContext } from '@/context/ProductContext';
import { addProductApi, updateProductApi, deleteProductApi } from '@/api/products';
import { Product, ProductFormData } from '@/types/product';

function ProductsContent() {
  const {
    products,
    total,
    categories,
    isLoading,
    error,
    queryParams,
    updateQueryParams,
    refreshProducts,
  } = useProducts();

  const { addLocalProduct, updateLocalProduct, deleteLocalProduct } = useProductContext();

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Success toast notification message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handlers for Add / Edit
  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsFormModalOpen(true);
  };

  const handleSaveProduct = async (formData: ProductFormData) => {
    setIsSaving(true);
    try {
      if (productToEdit) {
        await updateProductApi(productToEdit.id, formData);
        updateLocalProduct(productToEdit.id, {
          ...formData,
          thumbnail: formData.thumbnail || productToEdit.thumbnail,
        });
        showToast(`Product "${formData.title}" updated successfully!`);
      } else {
        const apiResponse = await addProductApi(formData);
        const newProduct: Product = {
          ...apiResponse,
          id: Date.now(),
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: formData.price,
          rating: formData.rating,
          stock: formData.stock,
          brand: formData.brand,
          thumbnail: formData.thumbnail || 'https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/thumbnail.png',
          images: formData.thumbnail ? [formData.thumbnail] : [],
          isLocal: true,
        };
        addLocalProduct(newProduct);
        showToast(`Product "${formData.title}" created successfully!`);
      }
      setIsFormModalOpen(false);
      refreshProducts();
    } catch (err) {
      console.error('Failed to save product:', err);
      showToast('Error saving product. Saved to local session state.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handlers for Delete
  const handleOpenDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProductApi(productToDelete.id);
      deleteLocalProduct(productToDelete.id);
      showToast(`Product "${productToDelete.title}" deleted.`);
      setIsDeleteModalOpen(false);
      refreshProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
      deleteLocalProduct(productToDelete.id);
      showToast(`Product "${productToDelete.title}" removed from session.`);
      setIsDeleteModalOpen(false);
      refreshProducts();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Success Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-900/90 text-emerald-200 border border-emerald-700/80 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs animate-bounce">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Bar: Title & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Product Catalog
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage, search, filter, and modify products in real-time
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all duration-150 active:scale-95 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Product</span>
          </button>
        </div>

        {/* Controls Bar: Search & Filter/Sort */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <ProductSearch
            value={queryParams.q}
            onChange={(newQuery) => updateQueryParams({ q: newQuery })}
          />

          <ProductFilterSort
            categories={categories}
            selectedCategory={queryParams.category}
            sortBy={queryParams.sortBy}
            order={queryParams.order}
            hasSearchQuery={!!queryParams.q}
            onCategoryChange={(newCat) => updateQueryParams({ category: newCat })}
            onSortChange={(newSortBy, newOrder) =>
              updateQueryParams({ sortBy: newSortBy, order: newOrder })
            }
          />
        </div>

        {/* Main Content Area: Loading / Error / Empty / Data */}
        {isLoading ? (
          <div className="space-y-4">
            <TableSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={refreshProducts} />
        ) : products.length === 0 ? (
          <EmptyState
            onClearFilters={() =>
              updateQueryParams({ page: 1, q: '', category: 'all', sortBy: '', order: 'asc' })
            }
          />
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <ProductTable
              products={products}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
            />

            {/* Mobile Cards View */}
            <ProductCardGrid
              products={products}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
            />

            {/* Pagination Bar */}
            <Pagination
              currentPage={queryParams.page}
              totalItems={total}
              pageSize={queryParams.limit}
              onPageChange={(newPage) => updateQueryParams({ page: newPage })}
              onPageSizeChange={(newLimit) => updateQueryParams({ limit: newLimit })}
            />
          </div>
        )}
      </main>

      {/* Add/Edit Product Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        productToEdit={productToEdit}
        categories={categories}
        isSubmitting={isSaving}
        onSave={handleSaveProduct}
        onClose={() => setIsFormModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        message={
          productToDelete
            ? `Are you sure you want to delete "${productToDelete.title}"? This action cannot be undone.`
            : 'Are you sure you want to delete this product?'
        }
        confirmText="Delete Product"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
}

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Header />
        <Suspense
          fallback={
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex items-center justify-center">
              <Spinner className="w-8 h-8 text-indigo-500" />
            </div>
          }
        >
          <ProductsContent />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
