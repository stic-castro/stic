'use client';

import * as React from 'react';
import type { SessionUser } from '../../../server/lib/auth';
import { PlusCircle, CarFront, Search } from 'lucide-react';
import { useToast } from '../../../components/ToastProvider';
import { Button } from '../../../components/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/Card';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { useTranslation } from '../../../lib/i18n';
import { useCars } from '../hooks/useCars';
import { carsService } from '../services/cars.service';
import type { MonitoringUser } from '../types';

type CarsDashboardProps = {
  currentUser: SessionUser;
};

function normalizePlate(value: string) {
  return value.trim().toUpperCase();
}

export function CarsDashboard({ currentUser }: CarsDashboardProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { cars, loading, error, refresh } = useCars();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    brand: '',
    model: '',
    year: '',
    plate: '',
    user_id: currentUser.role === 'user' ? currentUser.id : '',
  });
  const [monitoringUsers, setMonitoringUsers] = React.useState<MonitoringUser[]>([]);
  const [loadingMonitoringUsers, setLoadingMonitoringUsers] = React.useState(
    currentUser.role === 'mechanic' || currentUser.role === 'admin'
  );
  const [monitorPlate, setMonitorPlate] = React.useState('');
  const monitorStorageKey = React.useMemo(
    () => `tracked_car_plates:${currentUser.id}`,
    [currentUser.id]
  );
  const [trackedPlates, setTrackedPlates] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (currentUser.role !== 'user') {
      return;
    }

    const raw = window.localStorage.getItem(monitorStorageKey);

    if (!raw) {
      setTrackedPlates([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as string[];
      setTrackedPlates(Array.isArray(parsed) ? parsed : []);
    } catch {
      setTrackedPlates([]);
    }
  }, [currentUser.role, monitorStorageKey]);

  const persistTrackedPlates = React.useCallback(
    (next: string[]) => {
      setTrackedPlates(next);
      window.localStorage.setItem(monitorStorageKey, JSON.stringify(next));
    },
    [monitorStorageKey]
  );

  React.useEffect(() => {
    if (currentUser.role !== 'mechanic' && currentUser.role !== 'admin') {
      return;
    }

    async function loadMonitoringUsers() {
      try {
        setLoadingMonitoringUsers(true);
        const data = await carsService.getMonitoringUsers();
        setMonitoringUsers(data);
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : t('cars.monitorUsersError'), 'error');
      } finally {
        setLoadingMonitoringUsers(false);
      }
    }

    loadMonitoringUsers();
  }, [currentUser.role, showToast, t]);

  const handleCreateCar = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.brand || !formData.model || !formData.year || !formData.plate) {
      showToast(t('cars.requiredFields'), 'error');
      return;
    }

    const parsedYear = Number(formData.year);

    if (Number.isNaN(parsedYear) || parsedYear < 1900) {
      showToast(t('cars.invalidYear'), 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const createdCar = await carsService.createCar({
        brand: formData.brand,
        model: formData.model,
        year: parsedYear,
        plate: normalizePlate(formData.plate),
        user_id: currentUser.role === 'user' ? currentUser.id : formData.user_id,
      });

      if (currentUser.role === 'user') {
        const normalizedPlate = normalizePlate(createdCar.plate);

        if (!trackedPlates.includes(normalizedPlate)) {
          persistTrackedPlates([...trackedPlates, normalizedPlate]);
        }
      }

      setFormData({
        brand: '',
        model: '',
        year: '',
        plate: '',
        user_id: currentUser.role === 'user' ? currentUser.id : '',
      });
      showToast(t('cars.createSuccess'), 'success');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('cars.createError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackPlate = () => {
    const normalizedPlate = normalizePlate(monitorPlate);

    if (!normalizedPlate) {
      showToast(t('cars.trackRequired'), 'error');
      return;
    }

    const matchesOwnedCar = cars.some((car) => normalizePlate(car.plate) === normalizedPlate);

    if (!matchesOwnedCar) {
      showToast(t('cars.trackNotFound'), 'error');
      return;
    }

    if (trackedPlates.includes(normalizedPlate)) {
      showToast(t('cars.trackExists'), 'info');
      return;
    }

    persistTrackedPlates([...trackedPlates, normalizedPlate]);
    setMonitorPlate('');
    showToast(t('cars.trackAdded'), 'success');
  };

  const removeTrackedPlate = (plate: string) => {
    persistTrackedPlates(trackedPlates.filter((item) => item !== plate));
  };

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-[2rem] border-secondary/10 bg-white/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
            <CardHeader>
              <CardTitle className="text-2xl">{t('cars.title')}</CardTitle>
              <p className="text-sm text-neutral-500">{t('cars.description')}</p>
            </CardHeader>
            <form onSubmit={handleCreateCar}>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {currentUser.role !== 'user' ? (
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-neutral-700">{t('cars.monitoringUser')}</label>
                    <Select
                      value={formData.user_id}
                      onChange={(event) => setFormData((current) => ({ ...current, user_id: event.target.value }))}
                      disabled={isSubmitting || loadingMonitoringUsers}
                    >
                      <option value="">{t('cars.monitoringUserPlaceholder')}</option>
                      {monitoringUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </Select>
                  </div>
                ) : null}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">{t('cars.brand')}</label>
                  <Input
                    value={formData.brand}
                    onChange={(event) => setFormData((current) => ({ ...current, brand: event.target.value }))}
                    placeholder={t('cars.brandPlaceholder')}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">{t('cars.model')}</label>
                  <Input
                    value={formData.model}
                    onChange={(event) => setFormData((current) => ({ ...current, model: event.target.value }))}
                    placeholder={t('cars.modelPlaceholder')}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">{t('cars.year')}</label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(event) => setFormData((current) => ({ ...current, year: event.target.value }))}
                    placeholder={t('cars.yearPlaceholder')}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">{t('cars.plate')}</label>
                  <Input
                    value={formData.plate}
                    onChange={(event) => setFormData((current) => ({ ...current, plate: event.target.value.toUpperCase() }))}
                    placeholder="1234-ABC"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    disabled={isSubmitting}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="rounded-full" isLoading={isSubmitting}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t('cars.addVehicle')}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {currentUser.role === 'user' ? (
            <Card className="rounded-[2rem] border-secondary/10 bg-white/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
              <CardHeader>
                <CardTitle className="text-2xl">{t('cars.monitorTitle')}</CardTitle>
                <p className="text-sm text-neutral-500">{t('cars.monitorDescription')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={monitorPlate}
                    onChange={(event) => setMonitorPlate(event.target.value.toUpperCase())}
                    placeholder="1234-ABC"
                    autoCapitalize="characters"
                    autoCorrect="off"
                  />
                  <Button type="button" variant="outline" className="rounded-full" onClick={handleTrackPlate}>
                    <Search className="mr-2 h-4 w-4" />
                    {t('cars.monitorAdd')}
                  </Button>
                </div>

                {trackedPlates.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {trackedPlates.map((plate) => (
                      <button
                        key={plate}
                        type="button"
                        onClick={() => removeTrackedPlate(plate)}
                        className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-secondary transition hover:bg-primary/15"
                      >
                        {plate} x
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">{t('cars.monitorEmpty')}</p>
                )}
              </CardContent>
            </Card>
          ) : null}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">{t('cars.listTitle')}</h2>
            <span className="text-sm text-neutral-500">{cars.length}</span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-secondary/8 bg-white p-6 text-sm text-neutral-500">
              {t('cars.loading')}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-error/20 bg-error/10 p-6 text-sm text-error">
              {error}
            </div>
          ) : cars.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center">
              <CarFront className="mx-auto mb-4 h-10 w-10 text-neutral-300" />
              <p className="text-sm text-neutral-500">{t('cars.empty')}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {cars.map((car) => (
                <Card key={car.id} className="rounded-[1.6rem] border-secondary/8 bg-white/92 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">{t('cars.plate')}</p>
                        <p className="mt-2 text-lg font-semibold text-neutral-900">{car.plate}</p>
                      </div>
                      <div className="rounded-full bg-secondary/6 px-3 py-1 text-xs font-medium text-secondary">
                        {car.year}
                      </div>
                    </div>
                    <p className="mt-4 text-base text-neutral-700">{car.brand} {car.model}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
