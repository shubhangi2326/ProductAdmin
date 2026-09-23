'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useProductContext } from '@/context/ProductContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { resetMutations } = useProductContext();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <Link href="/products" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
            <div>
              <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-300">
                ProductAdmin
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                Dashboard
              </span>
            </div>
          </Link>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {user && (
            <div className="flex items-center space-x-3 bg-slate-800/60 py-1.5 px-3 rounded-full border border-slate-700/50">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-indigo-400/30 bg-slate-800 flex items-center justify-center shrink-0">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.username}
                    fill
                    sizes="32px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-xs font-bold text-indigo-300">
                    {user.firstName ? user.firstName[0] : user.username[0]}
                  </span>
                )}
              </div>
              <div className="hidden md:block text-left text-xs">
                <p className="font-semibold text-slate-200 leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-slate-400 font-mono text-[10px]">@{user.username}</p>
              </div>
            </div>
          )}

          {/* Reset Mutations Helper (Optional testing button) */}
          <button
            onClick={() => {
              if (confirm('Reset locally added, edited, and deleted products data?')) {
                resetMutations();
                window.location.reload();
              }
            }}
            title="Reset Local Changes"
            className="hidden lg:flex items-center space-x-1 text-xs text-slate-400 hover:text-amber-400 px-2 py-1 rounded bg-slate-800/40 hover:bg-slate-800 transition-colors border border-slate-700/40"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset Cache</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800/80 transition-all duration-150 border border-slate-700/60 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
