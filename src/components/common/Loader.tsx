'use client';

import React from 'react';

export function Spinner({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <div
      className={`inline-block border-2 border-indigo-500 border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-3">
      {/* Table header skeleton */}
      <div className="h-10 bg-slate-800/80 rounded-lg w-full"></div>
      {/* Table rows skeleton */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-16 bg-slate-800/40 rounded-lg w-full flex items-center px-4 space-x-4 border border-slate-800/60"
        >
          <div className="w-12 h-12 bg-slate-700/60 rounded-md shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-700/60 rounded w-1/3"></div>
            <div className="h-3 bg-slate-800/80 rounded w-1/4"></div>
          </div>
          <div className="w-20 h-4 bg-slate-700/60 rounded"></div>
          <div className="w-16 h-4 bg-slate-700/60 rounded"></div>
          <div className="w-16 h-4 bg-slate-700/60 rounded"></div>
          <div className="w-24 h-8 bg-slate-800/80 rounded-md"></div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3"
        >
          <div className="h-40 bg-slate-700/50 rounded-lg w-full"></div>
          <div className="h-4 bg-slate-700/60 rounded w-3/4"></div>
          <div className="h-3 bg-slate-800/80 rounded w-1/2"></div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-5 bg-slate-700/60 rounded w-1/4"></div>
            <div className="h-8 bg-slate-700/60 rounded-md w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
