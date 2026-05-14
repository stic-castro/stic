import { db } from '../lib/db';
import type { Material } from '../types/quotation';

let schemaReady: Promise<void> | null = null;

function ensureQuotationSchema() {
  schemaReady ??= db.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS quotation_materials (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL UNIQUE,
      density DOUBLE PRECISION NOT NULL,
      price_per_kg DOUBLE PRECISION NOT NULL,
      price_per_hour_machine DOUBLE PRECISION NOT NULL,
      price_per_hour_operator DOUBLE PRECISION NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS spacer_quotations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INT NOT NULL,
      bolt_count INT NOT NULL,
      bolt_pattern DOUBLE PRECISION NOT NULL,
      thickness_mm DOUBLE PRECISION NOT NULL,
      center_bore DOUBLE PRECISION NOT NULL,
      is_hub_centric BOOLEAN NOT NULL DEFAULT FALSE,
      material_id UUID NOT NULL REFERENCES quotation_materials(id),
      price DOUBLE PRECISION NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS pulley_quotations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      outer_diameter DOUBLE PRECISION NOT NULL,
      inner_bore_diameter DOUBLE PRECISION NOT NULL,
      width DOUBLE PRECISION NOT NULL,
      groove_count INT NOT NULL,
      groove_type TEXT NOT NULL,
      material_id UUID NOT NULL REFERENCES quotation_materials(id),
      price DOUBLE PRECISION NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS gear_quotations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      teeth_count INT NOT NULL,
      module DOUBLE PRECISION NOT NULL,
      pitch_diameter DOUBLE PRECISION NOT NULL,
      outer_diameter DOUBLE PRECISION NOT NULL,
      width DOUBLE PRECISION NOT NULL,
      tooth_height DOUBLE PRECISION NOT NULL,
      gear_type TEXT NOT NULL,
      material_id UUID NOT NULL REFERENCES quotation_materials(id),
      price DOUBLE PRECISION NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `).then(() => undefined);

  return schemaReady;
}

const materialSelect = `
  id::text,
  name,
  density,
  price_per_kg,
  price_per_hour_machine,
  price_per_hour_operator,
  created_at
`;

export const defaultMaterials: Omit<Material, 'id' | 'created_at'>[] = [
  {
    name: 'Steel',
    density: 7850,
    price_per_kg: 18,
    price_per_hour_machine: 55,
    price_per_hour_operator: 35,
  },
  {
    name: 'Aluminum',
    density: 2700,
    price_per_kg: 42,
    price_per_hour_machine: 50,
    price_per_hour_operator: 35,
  },
  {
    name: 'Bronze',
    density: 8800,
    price_per_kg: 85,
    price_per_hour_machine: 60,
    price_per_hour_operator: 38,
  },
];

export const quotationRepository = {
  async findMaterials(): Promise<Material[]> {
    await ensureQuotationSchema();
    const result = await db.query(`SELECT ${materialSelect} FROM quotation_materials ORDER BY name ASC`);
    return result.rows;
  },

  async findMaterialByName(name: string): Promise<Material | null> {
    await ensureQuotationSchema();
    const result = await db.query(
      `SELECT ${materialSelect} FROM quotation_materials WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [name]
    );
    return result.rows[0] ?? null;
  },

  async findMaterialById(id: string): Promise<Material | null> {
    await ensureQuotationSchema();
    const result = await db.query(`SELECT ${materialSelect} FROM quotation_materials WHERE id = $1 LIMIT 1`, [id]);
    return result.rows[0] ?? null;
  },

  async createMaterial(input: Omit<Material, 'id' | 'created_at'>): Promise<Material> {
    await ensureQuotationSchema();
    const result = await db.query(
      `INSERT INTO quotation_materials (name, density, price_per_kg, price_per_hour_machine, price_per_hour_operator)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${materialSelect}`,
      [
        input.name,
        input.density,
        input.price_per_kg,
        input.price_per_hour_machine,
        input.price_per_hour_operator,
      ]
    );
    return result.rows[0];
  },

  async updateMaterial(id: string, input: Omit<Material, 'id' | 'created_at'>): Promise<Material | null> {
    await ensureQuotationSchema();
    const result = await db.query(
      `UPDATE quotation_materials
       SET name = $2, density = $3, price_per_kg = $4, price_per_hour_machine = $5, price_per_hour_operator = $6
       WHERE id = $1
       RETURNING ${materialSelect}`,
      [
        id,
        input.name,
        input.density,
        input.price_per_kg,
        input.price_per_hour_machine,
        input.price_per_hour_operator,
      ]
    );
    return result.rows[0] ?? null;
  },

  async deleteMaterial(id: string) {
    await ensureQuotationSchema();
    const result = await db.query('DELETE FROM quotation_materials WHERE id = $1', [id]);
    return result.rowCount ?? 0;
  },

  async seedDefaultMaterialsIfEmpty() {
    await ensureQuotationSchema();
    const count = await db.query('SELECT COUNT(*)::int AS count FROM quotation_materials');
    if (count.rows[0]?.count > 0) return;

    for (const material of defaultMaterials) {
      await this.createMaterial(material);
    }
  },

  async createSpacerQuotation(input: Record<string, unknown>) {
    await ensureQuotationSchema();
    const result = await db.query(
      `INSERT INTO spacer_quotations
       (make, model, year, bolt_count, bolt_pattern, thickness_mm, center_bore, is_hub_centric, material_id, price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id::text, make, model, year, bolt_count AS "boltCount", bolt_pattern AS "boltPattern",
         thickness_mm AS "thicknessMm", center_bore AS "centerBore", is_hub_centric AS "isHubCentric",
         material_id::text AS "materialId", price, created_at`,
      [
        input.make,
        input.model,
        input.year,
        input.boltCount,
        input.boltPattern,
        input.thicknessMm,
        input.centerBore,
        input.isHubCentric,
        input.materialId,
        input.price,
      ]
    );
    return result.rows[0];
  },

  async createPulleyQuotation(input: Record<string, unknown>) {
    await ensureQuotationSchema();
    const result = await db.query(
      `INSERT INTO pulley_quotations
       (outer_diameter, inner_bore_diameter, width, groove_count, groove_type, material_id, price)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id::text, outer_diameter AS "outerDiameter", inner_bore_diameter AS "innerBoreDiameter",
         width, groove_count AS "grooveCount", groove_type AS "grooveType", material_id::text AS "materialId",
         price, created_at`,
      [
        input.outerDiameter,
        input.innerBoreDiameter,
        input.width,
        input.grooveCount,
        input.grooveType,
        input.materialId,
        input.price,
      ]
    );
    return result.rows[0];
  },

  async createGearQuotation(input: Record<string, unknown>) {
    await ensureQuotationSchema();
    const result = await db.query(
      `INSERT INTO gear_quotations
       (teeth_count, module, pitch_diameter, outer_diameter, width, tooth_height, gear_type, material_id, price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id::text, teeth_count AS "teethCount", module, pitch_diameter AS "pitchDiameter",
         outer_diameter AS "outerDiameter", width, tooth_height AS "toothHeight", gear_type AS "gearType",
         material_id::text AS "materialId", price, created_at`,
      [
        input.teethCount,
        input.module,
        input.pitchDiameter,
        input.outerDiameter,
        input.width,
        input.toothHeight,
        input.gearType,
        input.materialId,
        input.price,
      ]
    );
    return result.rows[0];
  },

  async findAll(tableName: 'spacer_quotations' | 'pulley_quotations' | 'gear_quotations') {
    await ensureQuotationSchema();
    const result = await db.query(`SELECT *, id::text, material_id::text FROM ${tableName} ORDER BY created_at DESC`);
    return result.rows;
  },

  async findById(tableName: 'spacer_quotations' | 'pulley_quotations' | 'gear_quotations', id: string) {
    await ensureQuotationSchema();
    const result = await db.query(`SELECT *, id::text, material_id::text FROM ${tableName} WHERE id = $1 LIMIT 1`, [id]);
    return result.rows[0] ?? null;
  },

  async deleteById(tableName: 'spacer_quotations' | 'pulley_quotations' | 'gear_quotations', id: string) {
    await ensureQuotationSchema();
    const result = await db.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
    return result.rowCount ?? 0;
  },
};
