export type GearQuotationRequest = {
  toothCount: number;
  module: number;
  pitchDiameter: number;
  outerDiameter: number;
  width: number;
  toothHeight: number;
  gearType: string;
  material: string;
};

export type GearQuotationResponse = {
  id: number;
  price: number;
  toothCount: number;
  module: number;
  pitchDiameter: number;
  outerDiameter: number;
  width: number;
  toothHeight: number;
  gearType: string;
  material: string;
};