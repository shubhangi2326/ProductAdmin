'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-800/80 border-b border-slate-700/80 text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            <th className="py-3.5 px-4">Product</th>
            <th className="py-3.5 px-4">Category</th>
            <th className="py-3.5 px-4 text-right">Price</th>
            <th className="py-3.5 px-4 text-center">Rating</th>
            <th className="py-3.5 px-4 text-center">Stock</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80 text-xs">
          {products.map((product) => {
            const thumbnailSrc =
              product.thumbnail ||
              (product.images && product.images.length > 0 ? product.images[0] : null);

            return (
              <tr
                key={product.id}
                className="hover:bg-slate-800/40 transition-colors duration-150 group"
              >
                {/* Image & Title */}
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/60 overflow-hidden shrink-0 group-hover:border-indigo-500/50 transition-colors">
                      {thumbnailSrc ? (
                        <Image
                          src={thumbnailSrc}
                          alt={product.title}
                          fill
                          sizes="48px"
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px]">
                          No img
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/products/${product.id}`}
                          className="font-semibold text-slate-200 hover:text-indigo-400 transition-colors truncate block max-w-xs"
                          title={product.title}
                        >
                          {product.title}
                        </Link>
                        {product.isLocal && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">
                        {product.brand ? `${product.brand} • ` : ''}
                        {product.description}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 px-4">
                  <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 text-indigo-300 border border-slate-700/60 capitalize">
                    {product.category}
                  </span>
                </td>

                {/* Price */}
                <td className="py-3 px-4 text-right font-bold text-slate-100 text-sm">
                  ${Number(product.price).toFixed(2)}
                </td>

                {/* Rating */}
                <td className="py-3 px-4 text-center">
                  <div className="inline-flex items-center space-x-1 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full text-amber-300">
                    <svg className="w-3.5 h-3.5 fill-current text-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-semibold">
                      {product.rating ? Number(product.rating).toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </td>

                {/* Stock */}
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      product.stock > 10
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : product.stock > 0
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                    }`}
                  >
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end space-x-1.5">
                    {/* View Details */}
                    <Link
                      href={`/products/${product.id}`}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="View product details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit product"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete product"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
