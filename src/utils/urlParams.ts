import { ProductQueryParams } from '@/types/product';

const ALLOWED_LIMITS = [10, 20, 50];
const ALLOWED_SORT_FIELDS = ['price', 'rating', 'title', ''];
const ALLOWED_ORDERS = ['asc', 'desc'];

export const DEFAULT_QUERY_PARAMS: ProductQueryParams = {
  page: 1,
  limit: 10,
  q: '',
  category: 'all',
  sortBy: '',
  order: 'asc',
};

/**
 * Parses and sanitizes URL search parameters cleanly and defensively
 * Guarantees invalid values like ?page=abc or ?limit=-5 will not crash the UI
 */
export const parseQueryParams = (searchParams: URLSearchParams): ProductQueryParams => {
  const pageRaw = searchParams.get('page');
  let page = parseInt(pageRaw || '1', 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  const limitRaw = searchParams.get('limit');
  let limit = parseInt(limitRaw || '10', 10);
  if (isNaN(limit) || !ALLOWED_LIMITS.includes(limit)) {
    limit = 10;
  }

  const q = searchParams.get('q')?.trim() || '';
  const category = searchParams.get('category')?.trim() || 'all';

  let sortBy = searchParams.get('sortBy')?.trim() || '';
  if (!ALLOWED_SORT_FIELDS.includes(sortBy)) {
    sortBy = '';
  }

  let order = (searchParams.get('order')?.trim().toLowerCase() || 'asc') as 'asc' | 'desc';
  if (!ALLOWED_ORDERS.includes(order)) {
    order = 'asc';
  }

  return {
    page,
    limit,
    q,
    category,
    sortBy,
    order,
  };
};

/**
 * Builds a query string from ProductQueryParams object
 */
export const buildQueryString = (params: Partial<ProductQueryParams>): string => {
  const urlParams = new URLSearchParams();

  if (params.page && params.page > 1) {
    urlParams.set('page', params.page.toString());
  }

  if (params.limit && params.limit !== 10) {
    urlParams.set('limit', params.limit.toString());
  }

  if (params.q && params.q.trim() !== '') {
    urlParams.set('q', params.q.trim());
  }

  if (params.category && params.category !== 'all') {
    urlParams.set('category', params.category);
  }

  if (params.sortBy) {
    urlParams.set('sortBy', params.sortBy);
  }

  if (params.order && params.order !== 'asc') {
    urlParams.set('order', params.order);
  }

  const str = urlParams.toString();
  return str ? `?${str}` : '';
};
