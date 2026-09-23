import api from './axios';
import {
  Product,
  ProductsResponse,
  ProductQueryParams,
  CategoryItem,
  ProductFormData,
} from '@/types/product';

/**
 * Fetches products from DummyJSON API based on query parameters (pagination, search, category, sorting)
 * Accepts an optional AbortSignal to cancel pending requests on rapid search input changes
 */
export const fetchProducts = async (
  params: ProductQueryParams,
  signal?: AbortSignal
): Promise<ProductsResponse> => {
  const { page, limit, q, category, sortBy, order } = params;
  const skip = (page - 1) * limit;

  let endpoint = '/products';

  const queryParams: Record<string, string | number> = {
    limit,
    skip,
  };

  if (sortBy) {
    queryParams.sortBy = sortBy;
    queryParams.order = order || 'asc';
  }

  // Handle Search vs Category endpoints
  if (q && q.trim() !== '') {
    endpoint = '/products/search';
    queryParams.q = q.trim();
  } else if (category && category !== 'all') {
    endpoint = `/products/category/${encodeURIComponent(category)}`;
  }

  const response = await api.get<ProductsResponse>(endpoint, {
    params: queryParams,
    signal,
  });

  return response.data;
};

/**
 * Fetches product categories list
 * API Endpoint: GET https://dummyjson.com/products/categories
 */
export const fetchProductCategories = async (): Promise<CategoryItem[]> => {
  const response = await api.get<CategoryItem[] | string[]>('/products/categories');
  const data = response.data;

  // Handle both array of objects [{slug, name, url}] and array of strings
  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'string') {
      return (data as string[]).map((cat) => ({
        slug: cat,
        name: cat.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      }));
    }
    return data as CategoryItem[];
  }
  return [];
};

/**
 * Fetches a single product by ID
 * API Endpoint: GET https://dummyjson.com/products/{id}
 */
export const fetchProductById = async (id: string | number): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
};

/**
 * Adds a new product
 * API Endpoint: POST https://dummyjson.com/products/add
 */
export const addProductApi = async (productData: ProductFormData): Promise<Product> => {
  const response = await api.post<Product>('/products/add', productData);
  return response.data;
};

/**
 * Updates an existing product
 * API Endpoint: PUT https://dummyjson.com/products/{id}
 * Handles local products (IDs generated client-side) without crashing on 404
 */
export const updateProductApi = async (
  id: number | string,
  productData: Partial<ProductFormData>
): Promise<Product> => {
  const numericId = Number(id);

  // If this is a client-generated local ID (timestamp > 1000000), bypass remote API 404
  if (!isNaN(numericId) && numericId > 1000000) {
    return {
      id: numericId,
      title: productData.title || '',
      description: productData.description || '',
      category: productData.category || '',
      price: Number(productData.price || 0),
      rating: Number(productData.rating || 0),
      stock: Number(productData.stock || 0),
      brand: productData.brand || '',
      thumbnail: productData.thumbnail || '',
      images: productData.thumbnail ? [productData.thumbnail] : [],
      isLocal: true,
    } as Product;
  }

  try {
    const response = await api.put<Product>(`/products/${id}`, productData);
    return response.data;
  } catch (err) {
    // If backend returns 404 for a simulated edit, return local fallback object
    return {
      id: numericId,
      title: productData.title || '',
      description: productData.description || '',
      category: productData.category || '',
      price: Number(productData.price || 0),
      rating: Number(productData.rating || 0),
      stock: Number(productData.stock || 0),
      brand: productData.brand || '',
      thumbnail: productData.thumbnail || '',
      images: productData.thumbnail ? [productData.thumbnail] : [],
    } as Product;
  }
};

/**
 * Deletes a product by ID
 * API Endpoint: DELETE https://dummyjson.com/products/{id}
 * Handles local products (IDs generated client-side) without crashing on 404
 */
export const deleteProductApi = async (
  id: number | string
): Promise<{ id: number; isDeleted: boolean; deletedOn: string }> => {
  const numericId = Number(id);

  // If this is a client-generated local ID (timestamp > 1000000), bypass remote API 404
  if (!isNaN(numericId) && numericId > 1000000) {
    return {
      id: numericId,
      isDeleted: true,
      deletedOn: new Date().toISOString(),
    };
  }

  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (err) {
    return {
      id: numericId,
      isDeleted: true,
      deletedOn: new Date().toISOString(),
    };
  }
};
