'use client';

import * as React from 'react';
import { Calculator, FileText, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { useTranslation } from '../../../lib/i18n';
import type { GearQuotation, Material, PulleyQuotation, SpacerQuotation } from '../types';
import { GearScene } from './GearScene';
import { PulleyScene } from './PulleyScene';
import { SpacerScene } from './SpacerScene';
import { ThreeSceneFrame } from './ThreeSceneFrame';

type ProductType = 'spacer' | 'pulley' | 'gear';

type QuotationWorkbenchProps = {
  product: ProductType;
};

type VehicleOptions = {
  makes: string[];
  models: string[];
  years: number[];
};

const apiByProduct = {
  spacer: '/api/quotation/Spacer/calculate-price',
  pulley: '/api/quotation/Pulley/calculate-price',
  gear: '/api/quotation/Gear/calculate-price',
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error ?? 'Request failed');
  }
  return data as T;
}

function priceText(price?: number) {
  if (typeof price !== 'number') return 'BOB 0.00';
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
  }).format(price);
}

export function QuotationWorkbench({ product }: QuotationWorkbenchProps) {
  const { t } = useTranslation();
  const [materials, setMaterials] = React.useState<Material[]>([]);
  const [vehicleOptions, setVehicleOptions] = React.useState<VehicleOptions>({ makes: [], models: [], years: [] });
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [spacer, setSpacer] = React.useState({
    make: '',
    model: '',
    year: '',
    inches: '1',
    material: '',
  });
  const [pulley, setPulley] = React.useState({
    outerDiameter: '120',
    innerBoreDiameter: '25',
    width: '3',
    grooveCount: '2',
    grooveType: 'B',
    material: '',
  });
  const [gear, setGear] = React.useState({
    toothCount: '24',
    module: '2.5',
    pitchDiameter: '60',
    outerDiameter: '70',
    width: '18',
    toothHeight: '5',
    gearType: 'Spur',
    material: '',
  });

  const [quotation, setQuotation] = React.useState<SpacerQuotation | PulleyQuotation | GearQuotation | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      fetchJson<Material[]>('/api/materials'),
      product === 'spacer' ? fetchJson<string[]>('/api/wheel/makes').catch(() => []) : Promise.resolve([]),
    ])
      .then(([materialData, makes]) => {
        if (cancelled) return;
        const uniqueMaterials = Array.from(new Map(materialData.map((item) => [item.name, item])).values());
        setMaterials(uniqueMaterials);
        setVehicleOptions((current) => ({ ...current, makes }));
        const firstMaterial = uniqueMaterials[0]?.name ?? '';
        setSpacer((current) => ({ ...current, material: current.material || firstMaterial }));
        setPulley((current) => ({ ...current, material: current.material || firstMaterial }));
        setGear((current) => ({ ...current, material: current.material || firstMaterial }));
      })
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : t('quotation.loadError')))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [product, t]);

  React.useEffect(() => {
    if (product !== 'spacer' || !spacer.make) return;
    fetchJson<string[]>(`/api/wheel/models?make=${encodeURIComponent(spacer.make)}`)
      .then((models) => setVehicleOptions((current) => ({ ...current, models, years: [] })))
      .catch(() => setVehicleOptions((current) => ({ ...current, models: [], years: [] })));
  }, [product, spacer.make]);

  React.useEffect(() => {
    if (product !== 'spacer' || !spacer.make || !spacer.model) return;
    fetchJson<number[]>(
      `/api/wheel/years?make=${encodeURIComponent(spacer.make)}&model=${encodeURIComponent(spacer.model)}`
    )
      .then((years) => setVehicleOptions((current) => ({ ...current, years })))
      .catch(() => setVehicleOptions((current) => ({ ...current, years: [] })));
  }, [product, spacer.make, spacer.model]);

  const clearQuotation = React.useCallback(() => {
    setQuotation(null);
    setError(null);
  }, []);

  const materialSelect = (value: string, onChange: (value: string) => void) => (
    <label className="grid gap-2 text-sm font-medium text-secondary/75 dark:text-white/75">
      {t('quotation.material')}
      <Select value={value} disabled={isLoading} onChange={(event) => onChange(event.target.value)}>
        <option value="">{isLoading ? t('quotation.loading') : t('quotation.chooseMaterial')}</option>
        {materials.map((material) => (
          <option key={material.id} value={material.name}>
            {material.name}
          </option>
        ))}
      </Select>
    </label>
  );

  async function calculate() {
    setIsCalculating(true);
    setError(null);
    try {
      const body =
        product === 'spacer'
          ? {
              ...spacer,
              year: Number(spacer.year),
              inches: Number(spacer.inches),
            }
          : product === 'pulley'
            ? {
                ...pulley,
                outerDiameter: Number(pulley.outerDiameter),
                innerBoreDiameter: Number(pulley.innerBoreDiameter),
                width: Number(pulley.width),
                grooveCount: Number(pulley.grooveCount),
              }
            : {
                ...gear,
                toothCount: Number(gear.toothCount),
                module: Number(gear.module),
                pitchDiameter: Number(gear.pitchDiameter),
                outerDiameter: Number(gear.outerDiameter),
                width: Number(gear.width),
                toothHeight: Number(gear.toothHeight),
              };

      const result = await fetchJson<SpacerQuotation | PulleyQuotation | GearQuotation>(apiByProduct[product], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setQuotation(result);
    } catch (calculateError) {
      setError(calculateError instanceof Error ? calculateError.message : t('quotation.calculateError'));
    } finally {
      setIsCalculating(false);
    }
  }

  const titleKey = `quotation.${product}.title`;
  const subtitleKey = `quotation.${product}.subtitle`;

  const form = (
    <div className="grid gap-5">
      {product === 'spacer' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium text-secondary/75 dark:text-white/75">
              {t('quotation.make')}
              <Select
                value={spacer.make}
                onChange={(event) => {
                  setSpacer((current) => ({ ...current, make: event.target.value, model: '', year: '' }));
                  clearQuotation();
                }}
              >
                <option value="">{t('quotation.chooseMake')}</option>
                {vehicleOptions.makes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </Select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-secondary/75 dark:text-white/75">
              {t('quotation.model')}
              <Select
                value={spacer.model}
                disabled={!spacer.make}
                onChange={(event) => {
                  setSpacer((current) => ({ ...current, model: event.target.value, year: '' }));
                  clearQuotation();
                }}
              >
                <option value="">{t('quotation.chooseModel')}</option>
                {vehicleOptions.models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </Select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-secondary/75 dark:text-white/75">
              {t('quotation.year')}
              <Select
                value={spacer.year}
                disabled={!spacer.model}
                onChange={(event) => {
                  setSpacer((current) => ({ ...current, year: event.target.value }));
                  clearQuotation();
                }}
              >
                <option value="">{t('quotation.chooseYear')}</option>
                {vehicleOptions.years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-secondary/75 dark:text-white/75">
              {t('quotation.thickness')}
              <div className="grid grid-cols-3 gap-2">
                {['1', '1.5', '2'].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={spacer.inches === value ? 'primary' : 'outline'}
                    onClick={() => {
                      setSpacer((current) => ({ ...current, inches: value }));
                      clearQuotation();
                    }}
                  >
                    {value}&quot;
                  </Button>
                ))}
              </div>
            </label>
            {materialSelect(spacer.material, (value) => {
              setSpacer((current) => ({ ...current, material: value }));
              clearQuotation();
            })}
          </div>
        </>
      ) : null}

      {product === 'pulley' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label={t('quotation.outerDiameter')} value={pulley.outerDiameter} onChange={(value) => setPulley((current) => ({ ...current, outerDiameter: value }))} clearQuotation={clearQuotation} />
            <NumberField label={t('quotation.innerBoreDiameter')} value={pulley.innerBoreDiameter} onChange={(value) => setPulley((current) => ({ ...current, innerBoreDiameter: value }))} clearQuotation={clearQuotation} />
            <NumberField label={t('quotation.width')} value={pulley.width} onChange={(value) => setPulley((current) => ({ ...current, width: value }))} clearQuotation={clearQuotation} />
            <NumberField label={t('quotation.grooveCount')} value={pulley.grooveCount} onChange={(value) => setPulley((current) => ({ ...current, grooveCount: value }))} clearQuotation={clearQuotation} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-secondary/75 dark:text-white/75">
              {t('quotation.grooveType')}
              <div className="grid grid-cols-3 gap-2">
                {['A', 'B', 'C'].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={pulley.grooveType === value ? 'primary' : 'outline'}
                    onClick={() => {
                      setPulley((current) => ({ ...current, grooveType: value }));
                      clearQuotation();
                    }}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </label>
            {materialSelect(pulley.material, (value) => {
              setPulley((current) => ({ ...current, material: value }));
              clearQuotation();
            })}
          </div>
        </>
      ) : null}

      {product === 'gear' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label={t('quotation.toothCount')} value={gear.toothCount} onChange={(value) => setGear((current) => ({ ...current, toothCount: value }))} clearQuotation={clearQuotation} />
            <NumberField label={t('quotation.module')} value={gear.module} onChange={(value) => setGear((current) => ({ ...current, module: value }))} clearQuotation={clearQuotation} />
            <NumberField label={t('quotation.pitchDiameter')} value={gear.pitchDiameter} onChange={(value) => setGear((current) => ({ ...current, pitchDiameter: value }))} clearQuotation={clearQuotation} />
            <NumberField label={t('quotation.outerDiameter')} value={gear.outerDiameter} onChange={(value) => setGear((current) => ({ ...current, outerDiameter: value }))} clearQuotation={clearQuotation} />
            <NumberField label={t('quotation.width')} value={gear.width} onChange={(value) => setGear((current) => ({ ...current, width: value }))} clearQuotation={clearQuotation} />
            <NumberField label={t('quotation.toothHeight')} value={gear.toothHeight} onChange={(value) => setGear((current) => ({ ...current, toothHeight: value }))} clearQuotation={clearQuotation} />
          </div>
          {materialSelect(gear.material, (value) => {
            setGear((current) => ({ ...current, material: value }));
            clearQuotation();
          })}
        </>
      ) : null}
    </div>
  );

  const details =
    quotation && product === 'spacer' ? (
      <div className="grid gap-2 text-sm text-secondary/66 dark:text-white/66">
        <p>{t('quotation.boltPattern')}: {(quotation as SpacerQuotation).boltCount}x{(quotation as SpacerQuotation).boltPattern}</p>
        <p>{t('quotation.centerBore')}: {(quotation as SpacerQuotation).centerBore} mm</p>
      </div>
    ) : null;

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(24rem,1.05fr)] lg:px-8">
      <section className="grid content-start gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('quotation.eyebrow')}</p>
          <h1 className="mt-2 text-3xl font-bold text-secondary dark:text-white sm:text-4xl">{t(titleKey)}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-secondary/62 dark:text-white/62">{t(subtitleKey)}</p>
        </div>

        <div className="rounded-lg border border-secondary/10 bg-background/78 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          {form}
          {error ? <p className="mt-4 rounded-md bg-error/10 px-4 py-3 text-sm text-error">{error}</p> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={calculate} isLoading={isCalculating}>
              <Calculator className="mr-2 h-4 w-4" />
              {t('quotation.calculate')}
            </Button>
            <Button type="button" variant="outline" onClick={clearQuotation}>
              <RotateCcw className="mr-2 h-4 w-4" />
              {t('quotation.reset')}
            </Button>
          </div>
        </div>
      </section>

      <aside className="grid content-start gap-4">
        <ThreeSceneFrame isReady={Boolean(quotation)}>
          {quotation && product === 'spacer' ? (
            <SpacerScene
              studCount={(quotation as SpacerQuotation).boltCount}
              thickness={(quotation as SpacerQuotation).thicknessMm * 25}
              boltPattern={(quotation as SpacerQuotation).boltPattern}
              centerBore={(quotation as SpacerQuotation).centerBore}
            />
          ) : null}
          {quotation && product === 'pulley' ? (
            <PulleyScene
              outerDiameter={(quotation as PulleyQuotation).outerDiameter}
              holeDiameter={(quotation as PulleyQuotation).innerBoreDiameter}
              numGrooves={(quotation as PulleyQuotation).grooveCount}
              beltType={((quotation as PulleyQuotation).grooveType as 'A' | 'B' | 'C') || 'B'}
            />
          ) : null}
          {quotation && product === 'gear' ? (
            <GearScene
              numTeeth={(quotation as GearQuotation).teethCount}
              outerDiameter={(quotation as GearQuotation).outerDiameter}
              innerDiameter={(quotation as GearQuotation).outerDiameter - (quotation as GearQuotation).toothHeight}
              gearThickness={(quotation as GearQuotation).width}
              holeDiameter={(quotation as GearQuotation).pitchDiameter}
            />
          ) : null}
        </ThreeSceneFrame>

        <div className="rounded-lg border border-secondary/10 bg-background/78 p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary/45 dark:text-white/45">{t('quotation.estimate')}</p>
              <p className="mt-1 text-3xl font-bold text-primary">{priceText(quotation?.price)}</p>
            </div>
            <FileText className="h-8 w-8 text-secondary/35 dark:text-white/35" />
          </div>
          {details ? <div className="mt-4 border-t border-secondary/10 pt-4 dark:border-white/10">{details}</div> : null}
        </div>
      </aside>
    </main>
  );
}

function NumberField({
  label,
  value,
  onChange,
  clearQuotation,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  clearQuotation: () => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-secondary/75 dark:text-white/75">
      {label}
      <Input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          clearQuotation();
        }}
      />
    </label>
  );
}
