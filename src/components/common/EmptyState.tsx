'use client';

import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  onClearFilters?: () => void;
}

export default function EmptyState({
  title = 'No products found',
  message = 'We couldn’t find any products matching your current search criteria or category filter.',
  onClearFilters,
}: EmptyStateProps) {
  return (
    <div className="my-12 p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-4 max-w-md mx-auto shadow-inner">
      <div className="w-14 h-14 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-700/50">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-200">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
      </div>

      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-medium text-xs rounded-lg border border-indigo-500/30 transition-colors"
        >
          <span>Reset search & filters</span>
        </button>
      )}
    </div>
  );
}
