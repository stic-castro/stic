export type Material = {
  id: string;
  name: string;
  density: number;
  price_per_kg: number;
  price_per_hour_machine: number;
  price_per_hour_operator: number;
  created_at: string;
};

export type WheelDetails = {
  make: string;
  model: string;
  year: number;
  region?: string | null;
  boltCount: number;
  boltPattern: number;
  centerBore: number;
  lugType?: string | null;
  threadSize?: string | null;
};

export type SpacerQuotationInput = {
  material: string;
  inches: number;
  make: string;
  model: string;
  year: number;
  region?: string | null;
};

export type PulleyQuotationInput = {
  material: string;
  outerDiameter: number;
  innerBoreDiameter: number;
  width: number;
  grooveCount: number;
  grooveType: string;
};

export type GearQuotationInput = {
  material: string;
  toothCount?: number;
  teethCount?: number;
  module: number;
  pitchDiameter: number;
  outerDiameter: number;
  width: number;
  toothHeight: number;
  gearType: string;
};
