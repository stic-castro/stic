import axios from 'axios';

const BASE_URL = '/api/wheel';

export const fetchMakes = async (): Promise<string[]> => {
  try {
    const response = await axios.get<string[]>(`${BASE_URL}/makes`);
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('Invalid makes response format');
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching makes:', error.message || error);
    return [];
  }
};

export const fetchModelsByMake = async (make: string): Promise<string[]> => {
  try {
    const response = await axios.get<string[]>(`${BASE_URL}/models`, {
      params: { make }
    });
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('Invalid models response format');
      return [];
    }
  } catch (error: any) {
    console.error(`Error fetching models for make "${make}":`, error.message || error);
    return [];
  }
};

export const fetchYearsByMakeAndModel = async (
  make: string,
  model: string
): Promise<number[]> => {
  try {
    const response = await axios.get<number[]>(`${BASE_URL}/years`, {
      params: { make, model }
    });
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('Invalid years response format');
      return [];
    }
  } catch (error: any) {
    console.error(`Error fetching years for ${make} ${model}:`, error.message || error);
    return [];
  }
};
