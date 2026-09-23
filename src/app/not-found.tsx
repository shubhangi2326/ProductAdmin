import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4">
        <div className="w-16 h-16 bg-indigo-950 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-800">
          <span className="text-2xl font-extrabold font-mono">404</span>
        </div>
        <h2 className="text-xl font-bold text-white">Page Not Found</h2>
        <p className="text-xs text-slate-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/products"
          className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
