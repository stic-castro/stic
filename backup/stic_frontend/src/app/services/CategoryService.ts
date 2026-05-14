import { ProductCategory } from '../types/Categories';
import axios from 'axios';

export const fetchCategories = async (): Promise<ProductCategory[]> => {
  try {
    const response = await axios.get<ProductCategory[]>('/api/categories/');

    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('Invalid response format');
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching categories:', error.message || error);
    return [];
  }
};
