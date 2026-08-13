const json = (schema: unknown) => ({
  'application/json': { schema },
});

const ok = (schema?: unknown, description = 'Successful response') => ({
  description,
  ...(schema ? { content: json(schema) } : {}),
});

const body = (schema: unknown) => ({
  required: true,
  content: json(schema),
});

const idParam = (name = 'id') => ({
  name,
  in: 'path',
  required: true,
  schema: { type: 'string' },
});

const queryParam = (name: string, schema: unknown = { type: 'string' }, required = false) => ({
  name,
  in: 'query',
  required,
  schema,
});

const listOf = (schema: unknown) => ({ type: 'array', items: schema });
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'STIC Motors API',
    version: '1.0.0',
    description: 'API for the STIC Motors monolith, including workshop operations, notifications, quotations, and WheelFitment integration.',
  },
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin', 'mechanic', 'trainee'] },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Car: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          brand: { type: 'string' },
          model: { type: 'string' },
          year: { type: 'integer' },
          plate: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Job: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'in_progress', 'completed'] },
          payment_status: { type: 'string', enum: ['pending_payment', 'paid'] },
          mechanic_id: { type: 'string', format: 'uuid' },
          car_id: { type: 'string', format: 'uuid' },
          mechanic_review_rating: { type: 'integer', nullable: true },
          mechanic_review_comment: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      ProgressLog: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          job_id: { type: 'string', format: 'uuid' },
          description: { type: 'string' },
          started_at: { type: 'string', format: 'date-time' },
          ended_at: { type: 'string', format: 'date-time', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          job_id: { type: 'string', format: 'uuid', nullable: true },
          title: { type: 'string' },
          message: { type: 'string' },
          is_read: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Material: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          density: { type: 'number' },
          price_per_kg: { type: 'number' },
          price_per_hour_machine: { type: 'number' },
          price_per_hour_operator: { type: 'number' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      WheelDetails: {
        type: 'object',
        properties: {
          make: { type: 'string' },
          model: { type: 'string' },
          year: { type: 'integer' },
          region: { type: 'string', nullable: true },
          boltCount: { type: 'integer' },
          boltPattern: { type: 'number' },
          centerBore: { type: 'number' },
          lugType: { type: 'string', nullable: true },
          threadSize: { type: 'string', nullable: true },
        },
      },
      SpacerQuotation: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          make: { type: 'string' },
          model: { type: 'string' },
          year: { type: 'integer' },
          boltCount: { type: 'integer' },
          boltPattern: { type: 'number' },
          thicknessMm: { type: 'number' },
          centerBore: { type: 'number' },
          isHubCentric: { type: 'boolean' },
          materialId: { type: 'string' },
          price: { type: 'number' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      PulleyQuotation: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          outerDiameter: { type: 'number' },
          innerBoreDiameter: { type: 'number' },
          width: { type: 'number' },
          grooveCount: { type: 'integer' },
          grooveType: { type: 'string' },
          materialId: { type: 'string' },
          price: { type: 'number' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      GearQuotation: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          teethCount: { type: 'integer' },
          module: { type: 'number' },
          pitchDiameter: { type: 'number' },
          outerDiameter: { type: 'number' },
          width: { type: 'number' },
          toothHeight: { type: 'number' },
          gearType: { type: 'string' },
          materialId: { type: 'string' },
          price: { type: 'number' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      AuthCredentials: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/api/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Create an account',
        requestBody: body({
          type: 'object',
          required: ['name', 'email', 'phone', 'password'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            password: { type: 'string', minLength: 8 },
          },
        }),
        responses: { '201': ok(ref('User'), 'Account created'), '400': ok(ref('Error'), 'Invalid input') },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in',
        requestBody: body(ref('AuthCredentials')),
        responses: { '200': ok(ref('User'), 'Authenticated'), '401': ok(ref('Error'), 'Invalid credentials') },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Log out',
        responses: { '200': ok({ type: 'object', properties: { success: { type: 'boolean' } } }) },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        responses: { '200': ok(listOf(ref('User'))) },
      },
      post: {
        tags: ['Users'],
        summary: 'Create a user',
        requestBody: body({
          type: 'object',
          required: ['name', 'email', 'phone', 'password', 'role'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            password: { type: 'string', minLength: 8 },
            role: { type: 'string', enum: ['user', 'admin', 'mechanic', 'trainee'] },
          },
        }),
        responses: { '201': ok(ref('User'), 'User created'), '400': ok(ref('Error'), 'Invalid input') },
      },
    },
    '/api/users/{id}/role': {
      patch: {
        tags: ['Users'],
        summary: 'Update a user role',
        parameters: [idParam()],
        requestBody: body({
          type: 'object',
          required: ['role'],
          properties: { role: { type: 'string', enum: ['user', 'admin', 'mechanic', 'trainee'] } },
        }),
        responses: { '200': ok(ref('User')), '403': ok(ref('Error'), 'Admin role required') },
      },
    },
    '/api/mechanics': {
      get: {
        tags: ['Mechanics'],
        summary: 'List mechanics',
        responses: { '200': ok(listOf(ref('User'))) },
      },
      post: {
        tags: ['Mechanics'],
        summary: 'Unsupported endpoint kept for compatibility',
        responses: { '405': ok(ref('Error'), 'Mechanics are managed through user roles') },
      },
    },
    '/api/cars': {
      get: {
        tags: ['Cars'],
        summary: 'List visible cars',
        responses: { '200': ok(listOf(ref('Car'))) },
      },
      post: {
        tags: ['Cars'],
        summary: 'Create a car',
        requestBody: body({
          type: 'object',
          required: ['brand', 'model', 'year', 'plate'],
          properties: {
            user_id: { type: 'string', format: 'uuid' },
            brand: { type: 'string' },
            model: { type: 'string' },
            year: { type: 'integer' },
            plate: { type: 'string' },
          },
        }),
        responses: { '201': ok(ref('Car'), 'Car created'), '401': ok(ref('Error'), 'Authentication required') },
      },
    },
    '/api/jobs': {
      get: {
        tags: ['Jobs'],
        summary: 'List visible jobs',
        responses: { '200': ok(listOf(ref('Job'))) },
      },
      post: {
        tags: ['Jobs'],
        summary: 'Create a job',
        requestBody: body({
          type: 'object',
          required: ['description', 'mechanic_id', 'car_id'],
          properties: {
            description: { type: 'string' },
            mechanic_id: { type: 'string', format: 'uuid' },
            car_id: { type: 'string', format: 'uuid' },
          },
        }),
        responses: { '201': ok(ref('Job'), 'Job created'), '403': ok(ref('Error'), 'Role not allowed') },
      },
    },
    '/api/jobs/{id}': {
      patch: {
        tags: ['Jobs'],
        summary: 'Update job status, payment, or review data',
        parameters: [idParam()],
        requestBody: body({
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['pending', 'in_progress', 'completed'] },
            payment_status: { type: 'string', enum: ['pending_payment', 'paid'] },
            mechanic_review_rating: { type: 'integer' },
            mechanic_review_comment: { type: 'string' },
          },
        }),
        responses: { '200': ok(ref('Job')), '404': ok(ref('Error'), 'Job not found') },
      },
    },
    '/api/progress_logs': {
      get: {
        tags: ['Progress Logs'],
        summary: 'List visible progress logs',
        responses: { '200': ok(listOf(ref('ProgressLog'))) },
      },
      post: {
        tags: ['Progress Logs'],
        summary: 'Create a progress log',
        requestBody: body({
          type: 'object',
          required: ['job_id', 'description', 'started_at'],
          properties: {
            job_id: { type: 'string', format: 'uuid' },
            description: { type: 'string' },
            started_at: { type: 'string', format: 'date-time' },
            ended_at: { type: 'string', format: 'date-time' },
          },
        }),
        responses: { '201': ok(ref('ProgressLog'), 'Log created') },
      },
    },
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List visible notifications',
        responses: { '200': ok(listOf(ref('Notification'))) },
      },
      post: {
        tags: ['Notifications'],
        summary: 'Create a notification manually',
        requestBody: body({
          type: 'object',
          required: ['user_id', 'title', 'message'],
          properties: {
            user_id: { type: 'string', format: 'uuid' },
            job_id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            message: { type: 'string' },
          },
        }),
        responses: { '201': ok(ref('Notification'), 'Notification created'), '403': ok(ref('Error'), 'Admin role required') },
      },
      patch: {
        tags: ['Notifications'],
        summary: 'Mark notifications as read',
        requestBody: body({
          type: 'object',
          properties: { notification_ids: { type: 'array', items: { type: 'string', format: 'uuid' } } },
        }),
        responses: { '200': ok({ type: 'object', properties: { success: { type: 'boolean' } } }) },
      },
    },
    '/api/materials': {
      get: {
        tags: ['Quotation Materials'],
        summary: 'List quotation materials',
        responses: { '200': ok(listOf(ref('Material'))) },
      },
      post: {
        tags: ['Quotation Materials'],
        summary: 'Create a quotation material',
        requestBody: body(ref('Material')),
        responses: { '201': ok(ref('Material'), 'Material created') },
      },
    },
    '/api/materials/{id}': {
      get: { tags: ['Quotation Materials'], summary: 'Get a material', parameters: [idParam()], responses: { '200': ok(ref('Material')), '404': ok(ref('Error')) } },
      put: { tags: ['Quotation Materials'], summary: 'Update a material', parameters: [idParam()], requestBody: body(ref('Material')), responses: { '200': ok(ref('Material')), '404': ok(ref('Error')) } },
      delete: { tags: ['Quotation Materials'], summary: 'Delete a material', parameters: [idParam()], responses: { '204': ok(undefined, 'Deleted'), '404': ok(ref('Error')) } },
    },
    '/api/Material': {
      get: { tags: ['Quotation Materials'], summary: 'Compatibility alias for /api/materials', responses: { '200': ok(listOf(ref('Material'))) } },
      post: { tags: ['Quotation Materials'], summary: 'Compatibility alias to create a material', requestBody: body(ref('Material')), responses: { '201': ok(ref('Material')) } },
    },
    '/api/Material/{id}': {
      get: { tags: ['Quotation Materials'], summary: 'Compatibility alias to get a material', parameters: [idParam()], responses: { '200': ok(ref('Material')) } },
      put: { tags: ['Quotation Materials'], summary: 'Compatibility alias to update a material', parameters: [idParam()], requestBody: body(ref('Material')), responses: { '200': ok(ref('Material')) } },
      delete: { tags: ['Quotation Materials'], summary: 'Compatibility alias to delete a material', parameters: [idParam()], responses: { '204': ok(undefined, 'Deleted') } },
    },
    '/api/wheel': {
      get: {
        tags: ['WheelFitment'],
        summary: 'Get wheel fitments by vehicle',
        parameters: [
          queryParam('make', { type: 'string' }, true),
          queryParam('model', { type: 'string' }, true),
          queryParam('year', { type: 'integer' }, true),
          queryParam('region'),
        ],
        responses: { '200': ok(listOf(ref('WheelDetails'))), '404': ok(ref('Error')) },
      },
    },
    '/api/wheel/makes': {
      get: { tags: ['WheelFitment'], summary: 'List WheelFitment makes', responses: { '200': ok(listOf({ type: 'string' })) } },
    },
    '/api/wheel/models': {
      get: { tags: ['WheelFitment'], summary: 'List WheelFitment models by make', parameters: [queryParam('make', { type: 'string' }, true)], responses: { '200': ok(listOf({ type: 'string' })) } },
    },
    '/api/wheel/years': {
      get: { tags: ['WheelFitment'], summary: 'List WheelFitment years by make and model', parameters: [queryParam('make', { type: 'string' }, true), queryParam('model', { type: 'string' }, true)], responses: { '200': ok(listOf({ type: 'integer' })) } },
    },
    '/api/wheel/request': {
      post: { tags: ['WheelFitment'], summary: 'Process a WheelDetailsRequest event payload', requestBody: body({ type: 'object' }), responses: { '200': ok({ type: 'object' }) } },
    },
    '/api/WheelDetails': {
      get: { tags: ['WheelFitment'], summary: 'Compatibility alias for /api/wheel', responses: { '200': ok(listOf(ref('WheelDetails'))) } },
    },
    '/api/WheelDetails/makes': {
      get: { tags: ['WheelFitment'], summary: 'Compatibility alias for /api/wheel/makes', responses: { '200': ok(listOf({ type: 'string' })) } },
    },
    '/api/WheelDetails/models': {
      get: { tags: ['WheelFitment'], summary: 'Compatibility alias for /api/wheel/models', parameters: [queryParam('make', { type: 'string' }, true)], responses: { '200': ok(listOf({ type: 'string' })) } },
    },
    '/api/WheelDetails/years': {
      get: { tags: ['WheelFitment'], summary: 'Compatibility alias for /api/wheel/years', parameters: [queryParam('make', { type: 'string' }, true), queryParam('model', { type: 'string' }, true)], responses: { '200': ok(listOf({ type: 'integer' })) } },
    },
    '/api/WheelDetails/request': {
      post: { tags: ['WheelFitment'], summary: 'Compatibility alias for /api/wheel/request', requestBody: body({ type: 'object' }), responses: { '200': ok({ type: 'object' }) } },
    },
    '/api/quotation/Spacer': {
      get: { tags: ['Quotations'], summary: 'List spacer quotations', responses: { '200': ok(listOf(ref('SpacerQuotation'))) } },
      post: { tags: ['Quotations'], summary: 'Create a spacer quotation', requestBody: body(ref('SpacerQuotation')), responses: { '201': ok(ref('SpacerQuotation')) } },
    },
    '/api/quotation/Spacer/{id}': {
      get: { tags: ['Quotations'], summary: 'Get a spacer quotation', parameters: [idParam()], responses: { '200': ok(ref('SpacerQuotation')) } },
      put: { tags: ['Quotations'], summary: 'Recalculate a spacer quotation', parameters: [idParam()], requestBody: body(ref('SpacerQuotation')), responses: { '201': ok(ref('SpacerQuotation')) } },
      delete: { tags: ['Quotations'], summary: 'Delete a spacer quotation', parameters: [idParam()], responses: { '204': ok(undefined, 'Deleted') } },
    },
    '/api/quotation/Spacer/calculate-price': {
      post: {
        tags: ['Quotations'],
        summary: 'Calculate spacer price',
        requestBody: body({ type: 'object', required: ['material', 'inches', 'make', 'model', 'year'], properties: { material: { type: 'string' }, inches: { type: 'number' }, make: { type: 'string' }, model: { type: 'string' }, year: { type: 'integer' }, region: { type: 'string' } } }),
        responses: { '201': ok(ref('SpacerQuotation')) },
      },
    },
    '/api/quotation/Spacer/receiver': {
      post: { tags: ['Quotations'], summary: 'Receive a WheelDetailsResponse event payload', requestBody: body({ type: 'object' }), responses: { '200': ok({ type: 'object' }) } },
    },
    '/api/quotation/Pulley': {
      get: { tags: ['Quotations'], summary: 'List pulley quotations', responses: { '200': ok(listOf(ref('PulleyQuotation'))) } },
      post: { tags: ['Quotations'], summary: 'Create a pulley quotation', requestBody: body(ref('PulleyQuotation')), responses: { '201': ok(ref('PulleyQuotation')) } },
    },
    '/api/quotation/Pulley/{id}': {
      get: { tags: ['Quotations'], summary: 'Get a pulley quotation', parameters: [idParam()], responses: { '200': ok(ref('PulleyQuotation')) } },
      put: { tags: ['Quotations'], summary: 'Recalculate a pulley quotation', parameters: [idParam()], requestBody: body(ref('PulleyQuotation')), responses: { '201': ok(ref('PulleyQuotation')) } },
      delete: { tags: ['Quotations'], summary: 'Delete a pulley quotation', parameters: [idParam()], responses: { '204': ok(undefined, 'Deleted') } },
    },
    '/api/quotation/Pulley/calculate-price': {
      post: {
        tags: ['Quotations'],
        summary: 'Calculate pulley price',
        requestBody: body({ type: 'object', required: ['material', 'outerDiameter', 'innerBoreDiameter', 'width', 'grooveCount', 'grooveType'], properties: { material: { type: 'string' }, outerDiameter: { type: 'number' }, innerBoreDiameter: { type: 'number' }, width: { type: 'number' }, grooveCount: { type: 'integer' }, grooveType: { type: 'string' } } }),
        responses: { '201': ok(ref('PulleyQuotation')) },
      },
    },
    '/api/quotation/Gear': {
      get: { tags: ['Quotations'], summary: 'List gear quotations', responses: { '200': ok(listOf(ref('GearQuotation'))) } },
      post: { tags: ['Quotations'], summary: 'Create a gear quotation', requestBody: body(ref('GearQuotation')), responses: { '201': ok(ref('GearQuotation')) } },
    },
    '/api/quotation/Gear/{id}': {
      get: { tags: ['Quotations'], summary: 'Get a gear quotation', parameters: [idParam()], responses: { '200': ok(ref('GearQuotation')) } },
      put: { tags: ['Quotations'], summary: 'Recalculate a gear quotation', parameters: [idParam()], requestBody: body(ref('GearQuotation')), responses: { '201': ok(ref('GearQuotation')) } },
      delete: { tags: ['Quotations'], summary: 'Delete a gear quotation', parameters: [idParam()], responses: { '204': ok(undefined, 'Deleted') } },
    },
    '/api/quotation/Gear/calculate-price': {
      post: {
        tags: ['Quotations'],
        summary: 'Calculate gear price',
        requestBody: body({ type: 'object', required: ['material', 'toothCount', 'module', 'pitchDiameter', 'outerDiameter', 'width', 'toothHeight', 'gearType'], properties: { material: { type: 'string' }, toothCount: { type: 'integer' }, module: { type: 'number' }, pitchDiameter: { type: 'number' }, outerDiameter: { type: 'number' }, width: { type: 'number' }, toothHeight: { type: 'number' }, gearType: { type: 'string' } } }),
        responses: { '201': ok(ref('GearQuotation')) },
      },
    },
    '/api/spacer/quotation': {
      post: { tags: ['Quotations'], summary: 'Frontend compatibility alias for spacer calculation', requestBody: body({ type: 'object' }), responses: { '201': ok(ref('SpacerQuotation')) } },
    },
    '/api/pulley/quotation': {
      post: { tags: ['Quotations'], summary: 'Frontend compatibility alias for pulley calculation', requestBody: body({ type: 'object' }), responses: { '201': ok(ref('PulleyQuotation')) } },
    },
    '/api/gear/quotation': {
      post: { tags: ['Quotations'], summary: 'Frontend compatibility alias for gear calculation', requestBody: body({ type: 'object' }), responses: { '201': ok(ref('GearQuotation')) } },
    },
    '/api/openapi': {
      get: { tags: ['Documentation'], summary: 'Get the OpenAPI specification', responses: { '200': ok({ type: 'object' }) } },
    },
  },
} as const;
