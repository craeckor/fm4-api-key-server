import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FM4 Program Key Discovery API',
      version: '1.0.0',
      description: 'API for discovering and retrieving FM4 radio program keys',
      contact: {
        name: 'FM4 Key Server'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        ProgramKey: {
          type: 'object',
          properties: {
            program_key: {
              type: 'string',
              description: 'Unique program key identifier',
              example: '4HB'
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Program description',
              example: 'Homebase'
            },
            title: {
              type: 'string',
              nullable: true,
              description: 'Program title',
              example: 'Homebase'
            },
            subtitle: {
              type: 'string',
              nullable: true,
              description: 'Program subtitle',
              example: 'mit Christina Pausackl'
            },
            first_seen: {
              type: 'integer',
              description: 'Unix timestamp when key was first discovered',
              example: 1699459200
            },
            last_seen: {
              type: 'integer',
              description: 'Unix timestamp when key was last seen',
              example: 1699545600
            },
            updated_at: {
              type: 'integer',
              description: 'Unix timestamp of last update',
              example: 1699545600
            }
          }
        },
        Stats: {
          type: 'object',
          properties: {
            totalKeys: {
              type: 'integer',
              description: 'Total number of program keys in database',
              example: 42
            },
            recentKeys: {
              type: 'integer',
              description: 'Number of keys seen in last 24 hours',
              example: 15
            },
            lastUpdate: {
              type: 'integer',
              nullable: true,
              description: 'Unix timestamp of most recent update',
              example: 1699545600
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Internal server error'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

export default swaggerJsdoc(options);
