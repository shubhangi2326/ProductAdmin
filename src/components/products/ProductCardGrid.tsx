'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';

interface ProductCardGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductCardGrid({ products, onEdit, onDelete }: ProductCardGridProps) {
  return (
    <div className="block md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
      {products.map((product) => {
        const thumbnailSrc =
          product.thumbnail ||
          (product.images && product.images.length > 0 ? product.images[0] : null);

        return (
          <div
            key={product.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-lg hover:border-slate-700 transition-all"
          >
            <div className="space-y-3">
              {/* Image & Badges */}
              <div className="relative w-full h-40 rounded-xl bg-slate-800 border border-slate-700/60 overflow-hidden">
                {thumbnailSrc ? (
                  <Image
                    src={thumbnailSrc}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                    No Image Available
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-950/80 text-indigo-300 border border-slate-700/80 backdrop-blur-sm capitalize">
                  {product.category}
                </div>

                {/* New Tag if local */}
                {product.isLocal && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800 shadow">
                    NEW
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <Link
                  href={`/products/${product.id}`}
                  className="font-bold text-sm text-slate-100 hover:text-indigo-400 line-clamp-1 transition-colors"
                >
                  {product.title}
                </Link>
                <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                  {product.description}
                </p>
              </div>

              {/* Specs: Price, Rating, Stock */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
                <span className="font-extrabold text-base text-white">
                  ${Number(product.price).toFixed(2)}
                </span>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full text-[11px]">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{product.rating ? Number(product.rating).toFixed(1) : 'N/A'}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      product.stock > 0
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                    }`}
                  >
                    {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <Link
                href={`/products/${product.id}`}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800/60 rounded-lg transition-colors"
              >
                <span>Details</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="px-3 py-1.5 text-xs font-medium text-amber-300 bg-slate-800 hover:bg-amber-950/40 border border-slate-700 hover:border-amber-800 rounded-lg transition-colors"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(product)}
                  className="px-3 py-1.5 text-xs font-medium text-rose-300 bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-800 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
