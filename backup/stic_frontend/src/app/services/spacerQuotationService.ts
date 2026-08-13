import axios from 'axios';
import { QuotationRequest, QuotationResponse } from '../types/Spacers';

export const calculateSpacerQuotation = async (
  data: QuotationRequest
): Promise<QuotationResponse | null> => {
  try {
    const response = await axios.post<QuotationResponse>(`/api/spacer/quotation`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching spacer quotation:', error.message || error);
    return null;
  }
};
