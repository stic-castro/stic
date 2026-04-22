export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'STIC Motors API',
    version: '1.0.0',
    description: 'API for STIC Motors Monolithic App',
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin', 'mechanic', 'trainee'] },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Mechanic: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string' },
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
          mechanic_id: { type: 'string', format: 'uuid' },
          car_id: { type: 'string', format: 'uuid' },
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
    },
  },
  paths: {
    '/api/users': {
      get: {
        summary: 'Get all users',
        responses: {
          '200': {
            description: 'A list of users',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } }
          }
        }
      },
      post: {
        summary: 'Create a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'role'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string', enum: ['user', 'admin', 'mechanic', 'trainee'] },
                  password: { type: 'string', minLength: 8 }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'User created', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '400': { description: 'Invalid input' }
        }
      }
    },
    '/api/mechanics': {
      get: {
        summary: 'Get all mechanics',
        responses: {
          '200': {
            description: 'A list of mechanics',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Mechanic' } } } }
          }
        }
      },
      post: {
        summary: 'Mechanics are managed through user roles',
        responses: {
          '405': { description: 'Mechanic creation is not supported through this endpoint' }
        }
      }
    },
    '/api/cars': {
      get: {
        summary: 'Get all cars',
        responses: {
          '200': {
            description: 'A list of cars',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Car' } } } }
          }
        }
      },
      post: {
        summary: 'Create a new car',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { user_id: { type: 'string' }, brand: { type: 'string' }, model: { type: 'string' }, year: { type: 'integer' }, plate: { type: 'string' } } } } }
        },
        responses: {
          '201': { description: 'Car created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Car' } } } },
          '400': { description: 'Invalid input' }
        }
      }
    },
    '/api/jobs': {
      get: {
        summary: 'Get all jobs',
        responses: {
          '200': {
            description: 'A list of jobs',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Job' } } } }
          }
        }
      },
      post: {
        summary: 'Create a new job',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { description: { type: 'string' }, mechanic_id: { type: 'string' }, car_id: { type: 'string' } } } } }
        },
        responses: {
          '201': { description: 'Job created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Job' } } } },
          '400': { description: 'Invalid input' }
        }
      }
    },
    '/api/progress_logs': {
      get: {
        summary: 'Get all progress logs',
        responses: {
          '200': {
            description: 'A list of progress logs',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ProgressLog' } } } }
          }
        }
      },
      post: {
        summary: 'Create a new progress log',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { job_id: { type: 'string' }, description: { type: 'string' }, started_at: { type: 'string', format: 'date-time' }, ended_at: { type: 'string', format: 'date-time' } } } } }
        },
        responses: {
          '201': { description: 'Log created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProgressLog' } } } },
          '400': { description: 'Invalid input' }
        }
      }
    }
  }
};
