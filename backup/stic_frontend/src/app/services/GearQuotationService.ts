import axios from "axios";
import { GearQuotationRequest, GearQuotationResponse } from "../types/Gears";

export const calculateGearQuotation = async (
  data: GearQuotationRequest
): Promise<GearQuotationResponse | null> => {
  try {
    const response = await axios.post<GearQuotationResponse>(
      "/api/gear/quotation",
      data
    );
    return response.data;
  } catch (error: any) {
    console.error("Error calculando cotización de engranaje:", error.message || error);
    return null;
  }
};
