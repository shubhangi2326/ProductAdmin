'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/common/Header';
import { fetchProductById } from '@/api/products';
import { Product } from '@/types/product';
import { Spinner } from '@/components/common/Loader';
import { useProductContext } from '@/context/ProductContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idStr = params.id as string;
  const productId = parseInt(idStr, 10);

  const { addedProducts, editedProducts } = useProductContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProductDetails = async () => {
      setIsLoading(true);
      setNotFound(false);
      setErrorMsg(null);

      // 1. Check locally added products first
      const localAdded = addedProducts.find((p) => p.id === productId || p.id.toString() === idStr);
      if (localAdded) {
        if (isMounted) {
          setProduct(localAdded);
          setSelectedImage(localAdded.thumbnail || localAdded.images?.[0] || '');
          setIsLoading(false);
        }
        return;
      }

      // 2. Fetch from DummyJSON API
      try {
        const fetched = await fetchProductById(idStr);

        // Check if there are local overrides/edits for this API product
        let finalProduct = fetched;
        if (editedProducts[fetched.id]) {
          finalProduct = { ...fetched, ...editedProducts[fetched.id] };
        }

        if (isMounted) {
          setProduct(finalProduct);
          setSelectedImage(
            finalProduct.thumbnail ||
              (finalProduct.images && finalProduct.images.length > 0 ? finalProduct.images[0] : '')
          );
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('Failed to load product details:', err);
          setNotFound(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (idStr) {
      loadProductDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [idStr, productId, addedProducts, editedProducts]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Link href="/products" className="hover:text-indigo-400 transition-colors">
              Products
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-medium truncate max-w-xs">
              {product ? product.title : 'Product Details'}
            </span>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                <Spinner className="w-10 h-10 text-indigo-500" />
                <p className="text-xs text-slate-400">Loading product details...</p>
              </div>
            </div>
          ) : notFound || !product ? (
            /* 404 Not Found UI */
            <div className="my-12 p-8 bg-slate-900/80 border border-slate-800 rounded-3xl text-center space-y-5 max-w-md mx-auto shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 bg-rose-950/80 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-800/80">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Product Not Found</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We couldn’t find a product with ID <span className="font-mono text-rose-300">"{idStr}"</span>. It may have been removed or does not exist.
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Product List</span>
              </Link>
            </div>
          ) : (
            /* Product Details View */
            <div className="space-y-8">
              {/* Top Details Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Images Gallery */}
                <div className="space-y-4">
                  <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden group">
                    {selectedImage ? (
                      <Image
                        src={selectedImage}
                        alt={product.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                        No image preview available
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {product.images && product.images.length > 0 && (
                    <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                      {product.images.map((img, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedImage(img)}
                          className={`relative w-16 h-16 rounded-xl bg-slate-950 border-2 overflow-hidden shrink-0 transition-all ${
                            selectedImage === img
                              ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                              : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${product.title} image ${index + 1}`}
                            fill
                            sizes="64px"
                            className="object-cover"
                            unoptimized
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Product Info */}
                <div className="space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Category & Stock Badges */}
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800 capitalize">
                        {product.category}
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          product.stock > 0
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of stock'}
                      </span>
                    </div>

                    {/* Title & Brand */}
                    <div>
                      {product.brand && (
                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
                          {product.brand}
                        </p>
                      )}
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                        {product.title}
                      </h1>
                    </div>

                    {/* Rating & Reviews Count */}
                    <div className="flex items-center space-x-3 text-xs">
                      <div className="flex items-center space-x-1 text-amber-400 bg-amber-950/50 border border-amber-800/60 px-2.5 py-1 rounded-full">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-bold">{product.rating ? Number(product.rating).toFixed(1) : 'N/A'}</span>
                      </div>

                      {product.reviews && (
                        <span className="text-slate-400">
                          ({product.reviews.length} verified customer reviews)
                        </span>
                      )}
                    </div>

                    {/* Price & Discount */}
                    <div className="flex items-baseline space-x-3 pt-2">
                      <span className="text-3xl font-extrabold text-white">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      {product.discountPercentage && product.discountPercentage > 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          {product.discountPercentage}% OFF
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-4">
                      {product.description}
                    </p>
                  </div>

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-xs">
                    {product.sku && (
                      <div>
                        <span className="text-slate-500 block">SKU:</span>
                        <span className="font-mono text-slate-200">{product.sku}</span>
                      </div>
                    )}
                    {product.weight && (
                      <div>
                        <span className="text-slate-500 block">Weight:</span>
                        <span className="text-slate-200">{product.weight}g</span>
                      </div>
                    )}
                    {product.warrantyInformation && (
                      <div>
                        <span className="text-slate-500 block">Warranty:</span>
                        <span className="text-slate-200">{product.warrantyInformation}</span>
                      </div>
                    )}
                    {product.shippingInformation && (
                      <div>
                        <span className="text-slate-500 block">Shipping:</span>
                        <span className="text-slate-200">{product.shippingInformation}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Reviews Section */}
              {product.reviews && product.reviews.length > 0 && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span>Customer Reviews</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.reviews.map((rev, index) => (
                      <div
                        key={index}
                        className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-200">
                            {rev.reviewerName}
                          </span>
                          <div className="flex items-center space-x-1 text-amber-400 text-xs">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{rev.rating}/5</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>

                        <p className="text-[10px] text-slate-500 text-right">
                          {new Date(rev.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
