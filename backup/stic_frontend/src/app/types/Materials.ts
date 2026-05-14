export type Material = {
  id: number;
  name: string;
  density: number;
  pricePerKg: number;
  pricePerHourMachine: number;
  pricePerHourOperator: number;
};

export type MaterialPUT = {  
  name: string;
  density: number;
  pricePerKg: number;
  pricePerHourMachine: number;
  pricePerHourOperator: number;
};