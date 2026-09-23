'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductFormData, CategoryItem } from '@/types/product';
import { validateProductForm, FormErrors } from '@/utils/validators';
import { Spinner } from '@/components/common/Loader';

interface ProductFormModalProps {
  isOpen: boolean;
  productToEdit?: Product | null;
  categories: CategoryItem[];
  isSubmitting?: boolean;
  onSave: (data: ProductFormData) => Promise<void>;
  onClose: () => void;
}

export default function ProductFormModal({
  isOpen,
  productToEdit,
  categories,
  isSubmitting = false,
  onSave,
  onClose,
}: ProductFormModalProps) {
  const isEditMode = !!productToEdit;

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    category: '',
    price: 0,
    rating: 4.5,
    stock: 10,
    brand: '',
    thumbnail: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Populate form data when modal opens or productToEdit changes
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        title: productToEdit.title || '',
        description: productToEdit.description || '',
        category: productToEdit.category || '',
        price: productToEdit.price || 0,
        rating: productToEdit.rating || 4.5,
        stock: productToEdit.stock || 0,
        brand: productToEdit.brand || '',
        thumbnail: productToEdit.thumbnail || (productToEdit.images?.[0] || ''),
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: categories.length > 0 ? categories[0].slug : 'beauty',
        price: 29.99,
        rating: 4.5,
        stock: 25,
        brand: '',
        thumbnail: '',
      });
    }
    setErrors({});
  }, [productToEdit, categories, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let finalVal: string | number = value;

    if (type === 'number') {
      finalVal = value === '' ? '' : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalVal,
    }));

    // Clear field error on typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateProductForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSave({
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        rating: Number(formData.rating),
      });
      onClose();
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 transform transition-all overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-800/80 text-indigo-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isEditMode ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                )}
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditMode ? 'Update product details below' : 'Fill in the form to create a new product'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form id="product-form" onSubmit={handleSubmit} className="overflow-y-auto space-y-4 pr-1">
          {/* Title */}
          <div className="space-y-1">
            <label htmlFor="title" className="block text-xs font-semibold text-slate-300">
              Product Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Wireless Noise-Canceling Headphones"
              className={`w-full px-3 py-2 bg-slate-950 border ${
                errors.title ? 'border-rose-500' : 'border-slate-700'
              } rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
            />
            {errors.title && <p className="text-[11px] text-rose-400 font-medium">{errors.title}</p>}
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="category" className="block text-xs font-semibold text-slate-300">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-950 border ${
                  errors.category ? 'border-rose-500' : 'border-slate-700'
                } rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 capitalize`}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-[11px] text-rose-400 font-medium">{errors.category}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="brand" className="block text-xs font-semibold text-slate-300">
                Brand
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Sony, Apple"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Price, Stock, Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor="price" className="block text-xs font-semibold text-slate-300">
                Price ($) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-950 border ${
                  errors.price ? 'border-rose-500' : 'border-slate-700'
                } rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
              />
              {errors.price && <p className="text-[11px] text-rose-400 font-medium">{errors.price}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="stock" className="block text-xs font-semibold text-slate-300">
                Stock <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-950 border ${
                  errors.stock ? 'border-rose-500' : 'border-slate-700'
                } rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
              />
              {errors.stock && <p className="text-[11px] text-rose-400 font-medium">{errors.stock}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="rating" className="block text-xs font-semibold text-slate-300">
                Rating (0–5)
              </label>
              <input
                type="number"
                id="rating"
                name="rating"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-950 border ${
                  errors.rating ? 'border-rose-500' : 'border-slate-700'
                } rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
              />
              {errors.rating && (
                <p className="text-[11px] text-rose-400 font-medium">{errors.rating}</p>
              )}
            </div>
          </div>

          {/* Thumbnail Image URL */}
          <div className="space-y-1">
            <label htmlFor="thumbnail" className="block text-xs font-semibold text-slate-300">
              Image URL
            </label>
            <input
              type="url"
              id="thumbnail"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://cdn.dummyjson.com/products/images/..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="description" className="block text-xs font-semibold text-slate-300">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the product..."
              className={`w-full px-3 py-2 bg-slate-950 border ${
                errors.description ? 'border-rose-500' : 'border-slate-700'
              } rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none`}
            ></textarea>
            {errors.description && (
              <p className="text-[11px] text-rose-400 font-medium">{errors.description}</p>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="product-form"
            disabled={isSubmitting}
            className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-500/30 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Spinner className="w-3.5 h-3.5 border-white border-t-transparent" />}
            <span>{isSubmitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
