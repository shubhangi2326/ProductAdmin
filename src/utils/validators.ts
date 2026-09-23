import { ProductFormData } from '@/types/product';

export interface FormErrors {
  title?: string;
  price?: string;
  category?: string;
  stock?: string;
  rating?: string;
  description?: string;
}

export const validateProductForm = (data: Partial<ProductFormData>): FormErrors => {
  const errors: FormErrors = {};

  if (!data.title || data.title.trim().length < 2) {
    errors.title = 'Title must be at least 2 characters long';
  }

  if (data.price === undefined || data.price === null || isNaN(Number(data.price))) {
    errors.price = 'Price is required';
  } else if (Number(data.price) <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  if (!data.category || data.category.trim() === '') {
    errors.category = 'Please select a category';
  }

  if (data.stock === undefined || data.stock === null || isNaN(Number(data.stock))) {
    errors.stock = 'Stock is required';
  } else if (Number(data.stock) < 0) {
    errors.stock = 'Stock cannot be negative';
  }

  if (data.rating !== undefined && data.rating !== null && !isNaN(Number(data.rating))) {
    const numRating = Number(data.rating);
    if (numRating < 0 || numRating > 5) {
      errors.rating = 'Rating must be between 0 and 5';
    }
  }

  if (data.description && data.description.trim().length > 0 && data.description.trim().length < 5) {
    errors.description = 'Description must be at least 5 characters long if provided';
  }

  return errors;
};
