import axios from 'axios';
import { Material } from '../types/Materials';

const LOCAL_API_URL = '/api/materials';

export const fetchMaterials = async (): Promise<Material[]> => {
  try {
    const response = await axios.get<Material[]>(LOCAL_API_URL);
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('Invalid material response format');
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching materials:', error.message || error);
    return [];
  }
};
