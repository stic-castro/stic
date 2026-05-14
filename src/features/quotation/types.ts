export type Material = {
  id: string;
  name: string;
  density: number;
  price_per_kg: number;
  price_per_hour_machine: number;
  price_per_hour_operator: number;
};

export type SpacerQuotation = {
  id: string;
  make: string;
  model: string;
  year: number;
  boltCount: number;
  boltPattern: number;
  thicknessMm: number;
  centerBore: number;
  price: number;
};

export type PulleyQuotation = {
  id: string;
  outerDiameter: number;
  innerBoreDiameter: number;
  width: number;
  grooveCount: number;
  grooveType: string;
  price: number;
};

export type GearQuotation = {
  id: string;
  teethCount: number;
  module: number;
  pitchDiameter: number;
  outerDiameter: number;
  width: number;
  toothHeight: number;
  gearType: string;
  price: number;
};
