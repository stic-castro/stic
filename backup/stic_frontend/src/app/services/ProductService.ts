import axios from 'axios';
import { Product } from '../types/Products';

const BASE_URL = '/api/products';

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await axios.get<Product[]>(BASE_URL);

    if (Array.isArray(response.data)) {
      console.log(response.data)
      return response.data;
    } else {
      console.error('Invalid response format');
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching products:', error.message || error);
    return [];
  }
};

export const fetchProductById = async (id: number): Promise<Product | null> => {
  try {
    const response = await axios.get<Product>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching product with id ${id}:`, error.message || error);
    return null;
  }
};

export const createProduct = async (product: Partial<Product>): Promise<Product | null> => {
  try {
    const response = await axios.post<Product>(BASE_URL, product);
    return response.data;
  } catch (error: any) {
    console.error('Error creating product:', error.message || error);
    return null;
  }
};

export const updateProduct = async (
  id: number,
  product: Partial<Product>
): Promise<Product | null> => {
  try {
    const response = await axios.put<Product>(`${BASE_URL}/${id}`, product);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating product with id ${id}:`, error.message || error);
    return null;
  }
};

export const deleteProduct = async (id: number): Promise<boolean> => {
  try {
    await axios.delete(`${BASE_URL}/${id}`);
    return true;
  } catch (error: any) {
    console.error(`Error deleting product with id ${id}:`, error.message || error);
    return false;
  }
};
