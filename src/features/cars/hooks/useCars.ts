'use client';

import * as React from 'react';
import { carsService } from '../services/cars.service';
import { Car } from '../types';

export function useCars() {
  const [cars, setCars] = React.useState<Car[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCars = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await carsService.getCars();
      setCars(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching cars');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  return { cars, loading, error, refresh: fetchCars };
}
