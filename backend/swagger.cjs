// @ts-check
const swaggerJsDoc = require('swagger-jsdoc');

/**
 * Swagger configuration for RIZAT Modern ERP Interface
 * OpenAPI 3.0 specification
 */

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RIZAT Modern ERP API Documentation',
      version: '1.0.0',
      description: 'Complete REST API documentation for RIZAT ERP system with full CRUD operations',
      contact: {
        name: 'RIZAT Support',
        email: 'support@rizat.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development Server',
      },
      {
        url: 'http://localhost:5555',
        description: 'Production Server',
      },
    ],
    components: {
      schemas: {
        // ──── Client Schema ────
        Client: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique client identifier',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            name: {
              type: 'string',
              description: 'Client name',
              example: 'Acme Corporation',
            },
            companyName: {
              type: 'string',
              description: 'Company name',
              example: 'Acme Corp SARL',
            },
            firstName: {
              type: 'string',
              description: 'Contact first name',
              example: 'John',
            },
            lastName: {
              type: 'string',
              description: 'Contact last name',
              example: 'Doe',
            },
            address: {
              type: 'string',
              description: 'Client address',
              example: '123 Business St, Paris 75001',
            },
            phone: {
              type: 'string',
              description: 'Client phone number',
              example: '+33123456789',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Client email',
              example: 'contact@acme.com',
            },
            customId: {
              type: 'integer',
              description: 'Custom client ID for internal reference',
              example: 1001,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },

        // ──── Quote Item Schema ────
        QuoteItem: {
          type: 'object',
          required: ['description', 'quantity', 'unitPrice'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique quote item identifier',
            },
            productRef: {
              type: 'string',
              description: 'Product reference code',
              example: 'PROD-001',
            },
            description: {
              type: 'string',
              description: 'Item description',
              example: 'Professional Consulting Service',
            },
            quantity: {
              type: 'number',
              description: 'Item quantity',
              example: 10,
            },
            unitPrice: {
              type: 'string',
              description: 'Unit price (stored as decimal string)',
              example: '150.00',
            },
            totalPrice: {
              type: 'string',
              description: 'Total price for this item',
              example: '1500.00',
            },
          },
        },

        // ──── Quote Schema ────
        Quote: {
          type: 'object',
          required: ['quoteNumber', 'clientId'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique quote identifier',
            },
            quoteNumber: {
              type: 'string',
              description: 'Unique quote reference number',
              example: 'T-0001-0001',
            },
            clientId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated client ID',
            },
            status: {
              type: 'string',
              enum: ['draft', 'sent', 'pending', 'accepted', 'rejected', 'archived'],
              description: 'Quote status',
              example: 'draft',
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Quote date',
            },
            deliveryDate: {
              type: 'string',
              format: 'date',
              description: 'Expected delivery date',
            },
            shippingPoint: {
              type: 'string',
              description: 'Shipping location',
              example: 'Paris, France',
            },
            shippingTerms: {
              type: 'string',
              description: 'Shipping terms',
              example: 'Free delivery',
            },
            comments: {
              type: 'string',
              description: 'Internal comments',
            },
            remarks: {
              type: 'string',
              description: 'Additional remarks',
            },
            tvaRate: {
              type: 'string',
              description: 'VAT/TAX rate as percentage',
              example: '20',
            },
            totalHt: {
              type: 'string',
              description: 'Total before tax',
              example: '10000.00',
            },
            totalTva: {
              type: 'string',
              description: 'Total VAT amount',
              example: '2000.00',
            },
            totalTtc: {
              type: 'string',
              description: 'Total after tax (TTC)',
              example: '12000.00',
            },
            customerReference: {
              type: 'string',
              description: 'Customer reference number',
            },
            salesPerson: {
              type: 'string',
              description: 'Assigned sales person',
            },
            deliveryDelay: {
              type: 'string',
              description: 'Delivery delay specification',
              example: '7 days',
            },
            globalIndex: {
              type: 'integer',
              description: 'Global sequence index',
            },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/QuoteItem' },
              description: 'Quote line items',
            },
            client: { $ref: '#/components/schemas/Client' },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // ──── CatalogItem Schema ────
        CatalogItem: {
          type: 'object',
          required: ['name', 'unitPrice'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique catalog item identifier',
            },
            reference: {
              type: 'string',
              description: 'Product reference code',
              example: 'REF-2024-001',
            },
            name: {
              type: 'string',
              description: 'Product name',
              example: 'Professional Service',
            },
            description: {
              type: 'string',
              description: 'Product description',
            },
            unitPrice: {
              type: 'string',
              description: 'Unit price (stored as decimal string)',
              example: '299.99',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // ──── CompanySettings Schema ────
        CompanySettings: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              description: 'Company name',
              example: 'RIZAT Solutions',
            },
            address: {
              type: 'string',
              description: 'Company address',
            },
            phone: {
              type: 'string',
              description: 'Company phone',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Company email',
            },
            logoUrl: {
              type: 'string',
              description: 'Company logo URL',
            },
            legalNotesDefault: {
              type: 'string',
              description: 'Default legal notes for quotes',
            },
            defaultTva: {
              type: 'string',
              description: 'Default VAT rate',
              example: '20',
            },
            siren: {
              type: 'string',
              description: 'French SIREN number',
            },
            tvaNumber: {
              type: 'string',
              description: 'VAT registration number',
            },
            paymentMethod: {
              type: 'string',
              description: 'Default payment method',
            },
          },
        },

        // ──── User Schema ────
        User: {
          type: 'object',
          required: ['email', 'fullName'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@rizat.com',
            },
            fullName: {
              type: 'string',
              description: 'Full user name',
              example: 'John Doe',
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            role: {
              type: 'string',
              enum: ['admin', 'commercial', 'manager', 'viewer'],
              example: 'commercial',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              example: 'active',
            },
            password: {
              type: 'string',
              description: 'Password (only in POST/PUT)',
              writeOnly: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // ──── Calendar Event Schema ────
        CalendarEvent: {
          type: 'object',
          required: ['title', 'startAt', 'endAt'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
              description: 'Event title',
              example: 'Client Meeting',
            },
            description: {
              type: 'string',
              description: 'Event description',
            },
            startAt: {
              type: 'string',
              format: 'date-time',
              description: 'Event start time',
            },
            endAt: {
              type: 'string',
              format: 'date-time',
              description: 'Event end time',
            },
            allDay: {
              type: 'boolean',
              description: 'Is this an all-day event?',
              example: false,
            },
            color: {
              type: 'string',
              description: 'Event color in hex format',
              example: '#5B3EFF',
            },
            location: {
              type: 'string',
              description: 'Event location',
            },
            type: {
              type: 'string',
              enum: ['event', 'meeting', 'deadline', 'follow-up'],
              example: 'meeting',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'Assigned user ID',
            },
            userName: {
              type: 'string',
              description: 'Assigned user name',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // ──── Activity Log Schema ────
        ActivityLog: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            userName: {
              type: 'string',
              description: 'Name of user who performed action',
            },
            action: {
              type: 'string',
              description: 'Action performed',
              example: 'Created Quote',
            },
            module: {
              type: 'string',
              description: 'Module where action occurred',
              example: 'Quotes',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // ──── Error Response Schema ────
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Resource not found',
            },
          },
        },

        // ──── Success Response Schema ────
        SuccessResponse: {
          type: 'object',
          properties: {
            ok: {
              type: 'boolean',
              example: true,
            },
          },
        },
      },

      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        BadRequest: {
          description: 'Invalid request parameters',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        Unauthorized: {
          description: 'Unauthorized access',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },

    paths: {
      // ──── ROOT ────
      '/': {
        get: {
          summary: 'API Health Check',
          tags: ['Health'],
          description: 'Check if API is running',
          responses: {
            200: {
              description: 'API is running',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      message: { type: 'string', example: 'ERP API v1 — utilisez /api/...' },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ──── CLIENTS ────
      '/api/clients': {
        get: {
          summary: 'List all clients',
          tags: ['Clients'],
          description: 'Retrieve all clients with quote count',
          responses: {
            200: {
              description: 'List of clients',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Client' },
                  },
                },
              },
            },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
        post: {
          summary: 'Create new client',
          tags: ['Clients'],
          description: 'Create a new client record',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Client' },
                example: {
                  name: 'Tech Solutions SARL',
                  companyName: 'Tech Solutions',
                  firstName: 'Alice',
                  lastName: 'Martin',
                  email: 'alice@techsolutions.com',
                  phone: '+33612345678',
                  address: '456 Tech Avenue, Lyon 69000',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Client created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Client' },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },

      '/api/clients/{id}': {
        put: {
          summary: 'Update client',
          tags: ['Clients'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Client ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Client' },
              },
            },
          },
          responses: {
            200: {
              description: 'Client updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Client' },
                },
              },
            },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
        delete: {
          summary: 'Delete client',
          tags: ['Clients'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'Client deleted',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SuccessResponse' },
                },
              },
            },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },

      // ──── QUOTES ────
      '/api/quotes': {
        get: {
          summary: 'List all quotes',
          tags: ['Quotes'],
          description: 'Retrieve all quotes with client and items details',
          responses: {
            200: {
              description: 'List of quotes',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Quote' },
                  },
                },
              },
            },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
        post: {
          summary: 'Create new quote',
          tags: ['Quotes'],
          description: 'Create a new quote with items',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Quote' },
                example: {
                  quoteNumber: 'T-0001-0001',
                  clientId: '550e8400-e29b-41d4-a716-446655440000',
                  status: 'draft',
                  tvaRate: '20',
                  totalHt: '10000.00',
                  totalTva: '2000.00',
                  totalTtc: '12000.00',
                  items: [
                    {
                      productRef: 'PROD-001',
                      description: 'Consulting Service',
                      quantity: 10,
                      unitPrice: '1000.00',
                      total: '10000.00',
                    },
                  ],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Quote created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Quote' },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },

      '/api/quotes/{id}': {
        get: {
          summary: 'Get quote by ID',
          tags: ['Quotes'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'Quote details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Quote' },
                },
              },
            },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
        put: {
          summary: 'Update quote',
          tags: ['Quotes'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Quote' },
              },
            },
          },
          responses: {
            200: {
              description: 'Quote updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Quote' },
                },
              },
            },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
        delete: {
          summary: 'Delete quote',
          tags: ['Quotes'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'Quote deleted',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SuccessResponse' },
                },
              },
            },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },

      '/api/quotes/next-number': {
        get: {
          summary: 'Get next quote number',
          tags: ['Quotes'],
          description: 'Generate the next available quote number and index',
          parameters: [
            {
              name: 'clientId',
              in: 'query',
              schema: { type: 'string', format: 'uuid' },
              description: 'Optional client ID for custom numbering',
            },
          ],
          responses: {
            200: {
              description: 'Next quote number',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      number: { type: 'string', example: 'T-0001-0001' },
                      index: { type: 'integer', example: 1 },
                    },
                  },
                },
              },
            },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },

      // ──── CATALOG ────
      '/api/catalog': {
        get: {
          summary: 'List all catalog items',
          tags: ['Catalog'],
          responses: {
            200: {
              description: 'List of catalog items',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/CatalogItem' },
                  },
                },
              },
            },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
        post: {
          summary: 'Create catalog item',
          tags: ['Catalog'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CatalogItem' },
                example: {
                  reference: 'PROD-2024-001',
                  name: 'Professional Consultation',
                  description: 'Expert business consulting service',
                  unitPrice: '299.99',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Catalog item created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CatalogItem' },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },

      '/api/catalog/{id}': {
        put: {
          summary: 'Update catalog item',
          tags: ['Catalog'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CatalogItem' },
              },
            },
          },
          responses: {
            200: {
              description: 'Catalog item updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CatalogItem' },
                },
              },
            },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
        delete: {
          summary: 'Delete catalog item',
          tags: ['Catalog'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'Catalog item deleted',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SuccessResponse' },
                },
              },
            },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },

      '/api/catalog/import': {
        post: {
          summary: 'Bulk import catalog items',
          tags: ['Catalog'],
          description: 'Import multiple catalog items from array',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/CatalogItem' },
                },
                example: [
                  {
                    reference: 'PROD-001',
                    name: 'Product A',
                    description: 'Description A',
                    unitPrice: '100.00',
                  },
                  {
                    reference: 'PROD-002',
                    name: 'Product B',
                    description: 'Description B',
                    unitPrice: '200.00',
                  },
                ],
              },
            },
          },
          responses: {
            200: {
              description: 'Items imported successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      count: { type: 'integer', example: 2 },
                      items: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/CatalogItem' },
                      },
                    },
                  },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },

      // ──── SETTINGS ────
      '/api/settings': {
        get: {
          summary: 'Get company settings',
          tags: ['Settings'],
          responses: {
            200: {
              description: 'Company settings',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CompanySettings' },
                },
              },
            },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
        put: {
          summary: 'Update company settings',
          tags: ['Settings'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CompanySettings' },
                example: {
                  name: 'RIZAT Solutions',
                  email: 'info@rizat.com',
                  phone: '+33123456789',
                  address: '789 Business Park, Paris 75001',
                  defaultTva: '20',
                  siren: '123456789',
                  tvaNumber: 'FR12345678901',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Settings updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CompanySettings' },
                },
              },
            },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },

      // ──── USERS ────
      '/api/users': {
        get: {
          summary: 'List all users',
          tags: ['Users'],
          responses: {
            200: {
              description: 'List of users',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
        post: {
          summary: 'Create new user',
          tags: ['Users'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
                example: {
                  email: 'newuser@rizat.com',
                  firstName: 'Jean',
                  lastName: 'Dupont',
                  password: 'SecurePassword123!',
                  role: 'commercial',
                  status: 'active',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'User created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },

      '/api/users/{id}': {
        put: {
          summary: 'Update user',
          tags: ['Users'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          responses: {
            200: {
              description: 'User updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
        delete: {
          summary: 'Delete user',
          tags: ['Users'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'User deleted',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SuccessResponse' },
                },
              },
            },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },

      // ──── ACTIVITY LOG ────
      '/api/activity-log': {
        get: {
          summary: 'Get activity logs',
          tags: ['Activity Log'],
          parameters: [
            {
              name: 'sortBy',
              in: 'query',
              schema: { type: 'string', enum: ['date', 'action', 'user'] },
              description: 'Field to sort by',
            },
            {
              name: 'sortDir',
              in: 'query',
              schema: { type: 'string', enum: ['asc', 'desc'] },
              description: 'Sort direction',
            },
            {
              name: 'filterUser',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filter by user name',
            },
            {
              name: 'filterAction',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filter by action',
            },
          ],
          responses: {
            200: {
              description: 'Activity logs',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/ActivityLog' },
                  },
                },
              },
            },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
        post: {
          summary: 'Log activity',
          tags: ['Activity Log'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ActivityLog' },
                example: {
                  userId: '550e8400-e29b-41d4-a716-446655440000',
                  userName: 'John Doe',
                  action: 'Created Quote',
                  module: 'Quotes',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Activity logged',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SuccessResponse' },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
        delete: {
          summary: 'Clear all activity logs',
          tags: ['Activity Log'],
          responses: {
            200: {
              description: 'All logs deleted',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SuccessResponse' },
                },
              },
            },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },

      '/api/activity-log/{id}': {
        delete: {
          summary: 'Delete activity log entry',
          tags: ['Activity Log'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'Log entry deleted',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SuccessResponse' },
                },
              },
            },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },

      // ──── EVENTS / CALENDAR ────
      '/api/events': {
        get: {
          summary: 'Get calendar events',
          tags: ['Calendar'],
          parameters: [
            {
              name: 'start',
              in: 'query',
              schema: { type: 'string', format: 'date-time' },
              description: 'Filter events after start date',
            },
            {
              name: 'end',
              in: 'query',
              schema: { type: 'string', format: 'date-time' },
              description: 'Filter events before end date',
            },
            {
              name: 'userId',
              in: 'query',
              schema: { type: 'string', format: 'uuid' },
              description: 'Filter by user ID',
            },
          ],
          responses: {
            200: {
              description: 'Calendar events',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/CalendarEvent' },
                  },
                },
              },
            },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
        post: {
          summary: 'Create calendar event',
          tags: ['Calendar'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CalendarEvent' },
                example: {
                  title: 'Client Meeting',
                  description: 'Discuss new project',
                  startAt: '2024-02-20T10:00:00Z',
                  endAt: '2024-02-20T11:00:00Z',
                  location: 'Conference Room A',
                  type: 'meeting',
                  color: '#5B3EFF',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Event created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CalendarEvent' },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },

      '/api/events/{id}': {
        put: {
          summary: 'Update calendar event',
          tags: ['Calendar'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CalendarEvent' },
              },
            },
          },
          responses: {
            200: {
              description: 'Event updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CalendarEvent' },
                },
              },
            },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
        delete: {
          summary: 'Delete calendar event',
          tags: ['Calendar'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'Event deleted',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SuccessResponse' },
                },
              },
            },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },

      // ──── DASHBOARD ────
      '/api/dashboard/stats': {
        get: {
          summary: 'Get dashboard statistics',
          tags: ['Dashboard'],
          description: 'Get comprehensive dashboard stats including revenue, clients, quotes',
          responses: {
            200: {
              description: 'Dashboard statistics',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      revenue: {
                        type: 'object',
                        properties: {
                          value: { type: 'number' },
                          thisMonth: { type: 'number' },
                          lastMonth: { type: 'number' },
                          trend: { type: 'integer' },
                        },
                      },
                      clients: {
                        type: 'object',
                        properties: {
                          value: { type: 'integer' },
                          thisMonth: { type: 'integer' },
                          lastMonth: { type: 'integer' },
                          trend: { type: 'integer' },
                        },
                      },
                      quotesInProgress: {
                        type: 'object',
                        properties: {
                          value: { type: 'integer' },
                          thisMonth: { type: 'integer' },
                          lastMonth: { type: 'integer' },
                          trend: { type: 'integer' },
                        },
                      },
                      totalQuotes: {
                        type: 'object',
                        properties: {
                          value: { type: 'integer' },
                          thisMonth: { type: 'integer' },
                          lastMonth: { type: 'integer' },
                          trend: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },

      // ──── AUTH ────
      '/api/auth/login': {
        post: {
          summary: 'User login',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'user@rizat.com',
                    },
                    password: {
                      type: 'string',
                      format: 'password',
                      example: 'SecurePassword123!',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: {
              description: 'Account inactive',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },

      '/api/auth/me': {
        get: {
          summary: 'Get current user',
          tags: ['Authentication'],
          parameters: [
            {
              name: 'x-user-id',
              in: 'header',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'User ID from header',
            },
          ],
          responses: {
            200: {
              description: 'Current user info',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/ServerError' },
          },
        },
      },
    },

    tags: [
      {
        name: 'Health',
        description: 'API health check endpoints',
      },
      {
        name: 'Clients',
        description: 'Client management endpoints',
      },
      {
        name: 'Quotes',
        description: 'Quote/Devis management endpoints',
      },
      {
        name: 'Catalog',
        description: 'Product catalog management',
      },
      {
        name: 'Settings',
        description: 'Company settings management',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Activity Log',
        description: 'Activity logging endpoints',
      },
      {
        name: 'Calendar',
        description: 'Calendar and event management',
      },
      {
        name: 'Dashboard',
        description: 'Dashboard and statistics',
      },
      {
        name: 'Authentication',
        description: 'Authentication endpoints',
      },
    ],
  },

  apis: [], // Routes are defined inline in definition above
};

/**
 * Generate Swagger spec from options
 */
const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;
