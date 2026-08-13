export type PulleyQuotationRequest = {
  material: string;
  outerDiameter: number;
  innerBoreDiameter: number;
  width: number;
  grooveCount: number;
  grooveType: string;
};

export type PulleyQuotationResponse = {
  id: number;
  createdAt: string;
  price: number;
  outerDiameter: number;
  innerBoreDiameter: number;
  width: number;
  grooveCount: number;
  grooveType: string;
};
