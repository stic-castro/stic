export interface Car {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  created_at: string;
}

export interface MonitoringUser {
  id: string;
  name: string;
  email: string;
}

export type CreateCarDTO = Pick<Car, 'brand' | 'model' | 'year' | 'plate'> & {
  user_id?: string;
};
