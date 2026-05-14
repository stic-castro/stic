import type { WheelDetails } from '../types/quotation';

const regionsToTry = [
  'usdm',
  'cdm',
  'mxndm',
  'ladm',
  'eudm',
  'russia',
  'jdm',
  'chdm',
  'skdm',
  'sam',
  'medm',
  'nadm',
  'sadm',
  'audm',
];

function getWheelFitmentConfig() {
  return {
    baseUrl: process.env.WHEEL_FITMENT_BASE_URL ?? 'https://api.wheel-size.com/v2',
    apiKey: process.env.WHEEL_FITMENT_API_KEY ?? process.env.WHEELFITMENT_API_KEY,
  };
}

function parseNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number.parseFloat(value.replace(',', '.')) || 0;
  return 0;
}

async function wheelFetch(path: string, params: Record<string, string | number | undefined>) {
  const { baseUrl, apiKey } = getWheelFitmentConfig();
  if (!apiKey) {
    throw new Error('WheelFitment API key is not configured');
  }

  const url = new URL(`${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`);
  url.searchParams.set('user_key', apiKey);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`WheelFitment request failed with ${response.status}`);
  }

  return response.json() as Promise<{ data?: unknown[] }>;
}

function parseWheelFitments(data: unknown[]): WheelDetails[] {
  return data.map((item) => {
    const row = item as Record<string, unknown>;
    const make = row.make as Record<string, unknown> | undefined;
    const model = row.model as Record<string, unknown> | undefined;
    const technical = row.technical as Record<string, unknown> | undefined;
    const fasteners = technical?.wheel_fasteners as Record<string, unknown> | undefined;
    const regions = row.regions as unknown[] | undefined;

    return {
      make: String(make?.name ?? ''),
      model: String(model?.name ?? ''),
      year: Number(row.start_year ?? row.year ?? 0),
      region: regions?.[0] ? String(regions[0]) : 'Global',
      boltCount: Number(technical?.stud_holes ?? 0),
      boltPattern: parseNumber(technical?.pcd),
      centerBore: parseNumber(technical?.centre_bore),
      lugType: fasteners?.type ? String(fasteners.type) : null,
      threadSize: fasteners?.thread_size ? String(fasteners.thread_size) : null,
    };
  });
}

function uniqueFitments(make: string, model: string, year: number, fitments: WheelDetails[]) {
  const byPattern = new Map<string, WheelDetails>();
  for (const fitment of fitments) {
    const key = [
      fitment.boltCount,
      fitment.boltPattern,
      fitment.centerBore,
      fitment.lugType,
      fitment.threadSize,
    ].join('|');
    byPattern.set(key, { ...fitment, make, model, year });
  }
  return Array.from(byPattern.values());
}

export const wheelFitmentService = {
  async getFitments(make: string, model: string, year: number, region?: string | null) {
    if (!make || !model || !year) throw new Error('Make, model, and year are required');

    if (region) {
      const json = await wheelFetch('search/by_model/', { region, make, model, year });
      return uniqueFitments(make, model, year, parseWheelFitments(json.data ?? []));
    }

    for (const regionAttempt of regionsToTry) {
      try {
        const json = await wheelFetch('search/by_model/', { region: regionAttempt, make, model, year });
        const fitments = uniqueFitments(make, model, year, parseWheelFitments(json.data ?? []));
        if (fitments.length > 0) return fitments;
      } catch (error) {
        if (error instanceof Error && error.message.includes('404')) continue;
        throw error;
      }
    }

    return [];
  },

  async getMakes() {
    const json = await wheelFetch('makes/', {});
    return (json.data ?? [])
      .map((item) => String((item as Record<string, unknown>).name ?? ''))
      .filter(Boolean);
  },

  async getModels(make: string) {
    if (!make) throw new Error('Parameter make is required');
    const json = await wheelFetch('models/', { make });
    return (json.data ?? [])
      .map((item) => String((item as Record<string, unknown>).name ?? ''))
      .filter(Boolean);
  },

  async getYears(make: string, model: string) {
    if (!make || !model) throw new Error('Parameters make and model are required');
    const json = await wheelFetch('years/', { make, model });
    return (json.data ?? [])
      .map((item) => Number((item as Record<string, unknown>).name ?? 0))
      .filter(Boolean)
      .sort((a, b) => b - a);
  },
};
