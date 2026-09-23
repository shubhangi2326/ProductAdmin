'use client';

import React from 'react';
import { CategoryItem } from '@/types/product';

interface ProductFilterSortProps {
  categories: CategoryItem[];
  selectedCategory: string;
  sortBy: string;
  order: 'asc' | 'desc';
  hasSearchQuery: boolean;
  onCategoryChange: (category: string) => void;
  onSortChange: (sortBy: string, order: 'asc' | 'desc') => void;
}

export default function ProductFilterSort({
  categories,
  selectedCategory,
  sortBy,
  order,
  hasSearchQuery,
  onCategoryChange,
  onSortChange,
}: ProductFilterSortProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Category Filter */}
      <div className="flex items-center space-x-2">
        <label htmlFor="category-select" className="text-xs font-medium text-slate-400 shrink-0">
          Category:
        </label>
        <div className="relative">
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="appearance-none bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 pr-8 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 cursor-pointer shadow-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Sort By Field */}
      <div className="flex items-center space-x-2">
        <label htmlFor="sort-select" className="text-xs font-medium text-slate-400 shrink-0">
          Sort By:
        </label>
        <div className="relative">
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value, order)}
            className="appearance-none bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 pr-8 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 cursor-pointer shadow-sm"
          >
            <option value="">Default Order</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
            <option value="title">Title</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Sort Order Toggle */}
      {sortBy && (
        <button
          type="button"
          onClick={() => onSortChange(sortBy, order === 'asc' ? 'desc' : 'asc')}
          className="inline-flex items-center space-x-1 px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-indigo-300 hover:text-white hover:border-indigo-500/50 transition-all duration-150 shadow-sm"
          title={`Switch to ${order === 'asc' ? 'Descending' : 'Ascending'} order`}
        >
          <span>{order === 'asc' ? 'Ascending' : 'Descending'}</span>
          <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {order === 'asc' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5 4v12m0 0l-4-4m4 4l4-4" />
            )}
          </svg>
        </button>
      )}

      {/* API Notice Badge when Search + Filter are combined */}
      {hasSearchQuery && selectedCategory !== 'all' && (
        <div
          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-950/40 border border-amber-800/60 rounded-lg text-[11px] text-amber-300"
          title="DummyJSON API does not combine search and category filter. Client-side filtering is applied to search results."
        >
          <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Hybrid Filter Active</span>
        </div>
      )}
    </div>
  );
}
