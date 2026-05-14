import axios from 'axios';
import { PulleyQuotationRequest, PulleyQuotationResponse } from '../types/Pulleys';

const BASE_URL = '/api/pulley/quotation';

export const calculatePulleyQuotation = async (
  data: PulleyQuotationRequest
): Promise<PulleyQuotationResponse> => {
  const response = await axios.post<PulleyQuotationResponse>(BASE_URL, data);
  return response.data;
};
