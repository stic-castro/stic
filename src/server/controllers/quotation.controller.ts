import { NextRequest, NextResponse } from 'next/server';
import { quotationRepository } from '../repositories/quotation.repository';
import { quotationService } from '../services/quotation.service';
import { wheelFitmentService } from '../services/wheel-fitment.service';

type ProductTable = 'spacer_quotations' | 'pulley_quotations' | 'gear_quotations';

function errorResponse(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : 'Unexpected error';
  return NextResponse.json({ error: message }, { status });
}

async function readJson(req: NextRequest | Request) {
  return req.json().catch(() => null);
}

export const MaterialController = {
  async getAll() {
    try {
      return NextResponse.json(await quotationService.getMaterials());
    } catch (error) {
      return errorResponse(error, 500);
    }
  },

  async getById(id: string) {
    try {
      const material = await quotationRepository.findMaterialById(id);
      return material
        ? NextResponse.json(material)
        : NextResponse.json({ error: 'Material not found' }, { status: 404 });
    } catch (error) {
      return errorResponse(error, 500);
    }
  },

  async create(req: NextRequest | Request) {
    try {
      const body = await readJson(req);
      if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      return NextResponse.json(await quotationService.createMaterial(body), { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  },

  async update(req: NextRequest | Request, id: string) {
    try {
      const body = await readJson(req);
      if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      const material = await quotationService.updateMaterial(id, body);
      return material
        ? NextResponse.json(material)
        : NextResponse.json({ error: 'Material not found' }, { status: 404 });
    } catch (error) {
      return errorResponse(error);
    }
  },

  async delete(id: string) {
    try {
      const deleted = await quotationRepository.deleteMaterial(id);
      return deleted > 0
        ? new NextResponse(null, { status: 204 })
        : NextResponse.json({ error: 'Material not found' }, { status: 404 });
    } catch (error) {
      return errorResponse(error, 500);
    }
  },
};

export const QuotationController = {
  async list(tableName: ProductTable) {
    try {
      return NextResponse.json(await quotationRepository.findAll(tableName));
    } catch (error) {
      return errorResponse(error, 500);
    }
  },

  async get(tableName: ProductTable, id: string) {
    try {
      const row = await quotationRepository.findById(tableName, id);
      return row ? NextResponse.json(row) : NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    } catch (error) {
      return errorResponse(error, 500);
    }
  },

  async delete(tableName: ProductTable, id: string) {
    try {
      const deleted = await quotationRepository.deleteById(tableName, id);
      return deleted > 0
        ? new NextResponse(null, { status: 204 })
        : NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    } catch (error) {
      return errorResponse(error, 500);
    }
  },

  async calculateSpacer(req: NextRequest | Request) {
    try {
      const body = await readJson(req);
      if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      return NextResponse.json(await quotationService.calculateSpacer(body), { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  },

  async calculatePulley(req: NextRequest | Request) {
    try {
      const body = await readJson(req);
      if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      return NextResponse.json(await quotationService.calculatePulley(body), { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  },

  async calculateGear(req: NextRequest | Request) {
    try {
      const body = await readJson(req);
      if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      return NextResponse.json(await quotationService.calculateGear(body), { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  },

  async receiver() {
    return NextResponse.json({ ok: true });
  },
};

export const WheelDetailsController = {
  async getFitments(req: NextRequest) {
    try {
      const params = req.nextUrl.searchParams;
      const make = params.get('make') ?? '';
      const model = params.get('model') ?? '';
      const year = Number(params.get('year') ?? 0);
      const region = params.get('region');
      const fitments = await wheelFitmentService.getFitments(make, model, year, region);

      return fitments.length > 0
        ? NextResponse.json(fitments)
        : NextResponse.json({ error: 'No wheel fitment data found for the specified vehicle' }, { status: 404 });
    } catch (error) {
      return errorResponse(error);
    }
  },

  async getMakes() {
    try {
      return NextResponse.json(await wheelFitmentService.getMakes());
    } catch (error) {
      return errorResponse(error);
    }
  },

  async getModels(req: NextRequest) {
    try {
      return NextResponse.json(await wheelFitmentService.getModels(req.nextUrl.searchParams.get('make') ?? ''));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async getYears(req: NextRequest) {
    try {
      const params = req.nextUrl.searchParams;
      return NextResponse.json(
        await wheelFitmentService.getYears(params.get('make') ?? '', params.get('model') ?? '')
      );
    } catch (error) {
      return errorResponse(error);
    }
  },

  async request(req: NextRequest | Request) {
    try {
      const body = await readJson(req);
      const data = body?.data ?? body?.Data ?? body;
      if (!data) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      const fitments = await wheelFitmentService.getFitments(data.make ?? data.Make, data.model ?? data.Model, data.year ?? data.Year, data.region ?? data.Region);
      return NextResponse.json({
        eventType: 'WheelDetailsResponse',
        data: {
          correlationId: data.correlationId ?? data.CorrelationId,
          ...fitments[0],
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
