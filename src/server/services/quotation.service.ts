import { defaultMaterials, quotationRepository } from '../repositories/quotation.repository';
import type {
  GearQuotationInput,
  Material,
  PulleyQuotationInput,
  SpacerQuotationInput,
} from '../types/quotation';
import { wheelFitmentService } from './wheel-fitment.service';

const spacerHoursPerInch = 5;
const spacerExtraDiameterMm = 60;
const spacerQuantity = 4;
const pulleyHoursPerChannel = 1.5;
const pulleyExtraDiameterMm = 5;
const gearHoursPerTooth = 0.17;

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function calculateWeight(diameterMm: number, material: Material, heightInches: number, extraDiameterMm: number) {
  const radiusMeters = ((diameterMm + extraDiameterMm) / 1000) / 2;
  const heightMeters = heightInches * 0.0254;
  const volume = Math.PI * radiusMeters ** 2 * heightMeters;
  return volume * material.density;
}

function fallbackMaterials(): Material[] {
  return defaultMaterials.map((material, index) => ({
    id: `fallback-${index + 1}`,
    created_at: new Date(0).toISOString(),
    ...material,
  }));
}

async function getMaterial(name: string) {
  let material: Material | null = null;

  try {
    await quotationRepository.seedDefaultMaterialsIfEmpty();
    material = await quotationRepository.findMaterialByName(name);
  } catch (error) {
    console.warn('Using fallback quotation materials because the database is unavailable:', error);
    material = fallbackMaterials().find((item) => item.name.toLowerCase() === name.toLowerCase()) ?? null;
  }

  if (!material) throw new Error(`Material "${name}" was not found`);
  return material;
}

async function createWithFallback<T>(persist: () => Promise<T>, fallback: T) {
  try {
    return await persist();
  } catch (error) {
    console.warn('Returning non-persistent quotation because the database is unavailable:', error);
    return fallback;
  }
}

export const quotationService = {
  async getMaterials() {
    try {
      await quotationRepository.seedDefaultMaterialsIfEmpty();
      return await quotationRepository.findMaterials();
    } catch (error) {
      console.warn('Using fallback quotation materials because the database is unavailable:', error);
      return fallbackMaterials();
    }
  },

  async createMaterial(input: Partial<Material>) {
    if (!input.name) throw new Error('Material name is required');
    return quotationRepository.createMaterial({
      name: input.name.trim(),
      density: toNumber(input.density),
      price_per_kg: toNumber(input.price_per_kg),
      price_per_hour_machine: toNumber(input.price_per_hour_machine),
      price_per_hour_operator: toNumber(input.price_per_hour_operator),
    });
  },

  async updateMaterial(id: string, input: Partial<Material>) {
    if (!input.name) throw new Error('Material name is required');
    return quotationRepository.updateMaterial(id, {
      name: input.name.trim(),
      density: toNumber(input.density),
      price_per_kg: toNumber(input.price_per_kg),
      price_per_hour_machine: toNumber(input.price_per_hour_machine),
      price_per_hour_operator: toNumber(input.price_per_hour_operator),
    });
  },

  async calculateSpacer(input: SpacerQuotationInput) {
    const material = await getMaterial(input.material);
    const [wheelDetails] = await wheelFitmentService.getFitments(input.make, input.model, input.year, input.region);
    if (!wheelDetails) throw new Error('No wheel fitment data found for the specified vehicle');

    const inches = toNumber(input.inches);
    const weight = calculateWeight(wheelDetails.boltPattern, material, inches, spacerExtraDiameterMm);
    const laborPrice =
      (material.price_per_hour_machine + material.price_per_hour_operator) * inches * spacerHoursPerInch;
    const materialPrice = spacerQuantity * weight * material.price_per_kg;

    const quotation = {
      id: crypto.randomUUID(),
      make: input.make,
      model: input.model,
      year: input.year,
      boltCount: wheelDetails.boltCount,
      boltPattern: wheelDetails.boltPattern,
      centerBore: wheelDetails.centerBore,
      isHubCentric: false,
      materialId: material.id,
      price: materialPrice + laborPrice,
      thicknessMm: inches,
      created_at: new Date().toISOString(),
    };

    return createWithFallback(() => quotationRepository.createSpacerQuotation(quotation), quotation);
  },

  async calculatePulley(input: PulleyQuotationInput) {
    const material = await getMaterial(input.material);
    const width = toNumber(input.width);
    const weight = calculateWeight(toNumber(input.outerDiameter), material, width, pulleyExtraDiameterMm);
    const materialPrice = weight * material.price_per_kg;
    const machiningPrice =
      toNumber(input.grooveCount) * pulleyHoursPerChannel * (material.price_per_hour_machine + material.price_per_hour_operator);

    const quotation = {
      id: crypto.randomUUID(),
      outerDiameter: toNumber(input.outerDiameter),
      innerBoreDiameter: toNumber(input.innerBoreDiameter),
      width,
      grooveCount: toNumber(input.grooveCount),
      grooveType: String(input.grooveType || 'A').slice(0, 1),
      materialId: material.id,
      price: materialPrice + machiningPrice,
      created_at: new Date().toISOString(),
    };

    return createWithFallback(() => quotationRepository.createPulleyQuotation(quotation), quotation);
  },

  async calculateGear(input: GearQuotationInput) {
    const material = await getMaterial(input.material);
    const teethCount = toNumber(input.toothCount ?? input.teethCount);
    const width = toNumber(input.width);
    const weight = calculateWeight(toNumber(input.outerDiameter), material, width, 0);
    const materialPrice = weight * material.price_per_kg;
    const machiningPrice =
      teethCount * gearHoursPerTooth * (material.price_per_hour_machine + material.price_per_hour_operator);

    const quotation = {
      id: crypto.randomUUID(),
      teethCount,
      module: toNumber(input.module),
      pitchDiameter: toNumber(input.pitchDiameter),
      outerDiameter: toNumber(input.outerDiameter),
      width,
      toothHeight: toNumber(input.toothHeight),
      gearType: input.gearType || 'Spur',
      materialId: material.id,
      price: materialPrice + machiningPrice,
      created_at: new Date().toISOString(),
    };

    return createWithFallback(() => quotationRepository.createGearQuotation(quotation), quotation);
  },
};
