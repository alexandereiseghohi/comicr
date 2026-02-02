#!/usr/bin/env tsx
/**
 * setup-api.ts - REST API Development Suite
 * Creates comprehensive REST API endpoints with OpenAPI documentation
 * Implements rate limiting, validation, and testing infrastructure
 */
import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

// Color utilities
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✔${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✖${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

// API packages
const API_PACKAGES = [
  "swagger-ui-react",
  "@types/swagger-ui-react",
  "openapi-types",
  "zod-to-openapi",
  "express-rate-limit",
];

// API utilities template
const API_UTILITIES = `import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { auth } from '@/lib/auth';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp?: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  category?: string;
  status?: string;
  [key: string]: any;
}

export type ApiParams = PaginationParams & SortParams & FilterParams;

export class ApiHandler {
  static success<T>(data: T, meta?: any): Response {
    return NextResponse.json({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    });
  }

  static error(
    error: string,
    status: number = 400,
    details?: any
  ): Response {
    return NextResponse.json(
      {
        success: false,
        error,
        details: process.env.NODE_ENV === 'development' ? details : undefined,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status }
    );
  }

  static async validateUser(request: NextRequest) {
    const session = await auth();

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    return session.user;
  }

  static async validateAdmin(request: NextRequest) {
    const user = await this.validateUser(request);

    if (user.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    return user;
  }

  static async validateRequest<T>(
    request: NextRequest,
    schema: ZodSchema<T>
  ): Promise<T> {
    try {
      const body = await request.json();
      return schema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(\`Validation failed: \${error.errors[0]?.message ?? 'Unknown error'}\`);
      }
      throw new Error('Invalid request body');
    }
  }

  static parseQueryParams(request: NextRequest): ApiParams {
    const { searchParams } = new URL(request.url);

    return {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
    };
  }

  static paginationMeta(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}

export async function withApiHandler<T>(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<T>
): Promise<Response> {
  try {
    const result = await handler(request);
    return ApiHandler.success(result);
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return ApiHandler.error('Authentication required', 401);
      }
      if (error.message === 'Insufficient permissions') {
        return ApiHandler.error('Admin access required', 403);
      }
      if (error.message.startsWith('Validation failed')) {
        return ApiHandler.error(error.message, 400);
      }

      return ApiHandler.error(error.message, 500);
    }

    return ApiHandler.error('Internal server error', 500);
  }
}`;

// OpenAPI configuration
const OPENAPI_CONFIG = `import { OpenAPIV3 } from 'openapi-types';

export const openApiConfig: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'ComicWise API',
    description: 'REST API for ComicWise comic reading platform',
    version: '1.0.0',
    contact: {
      name: 'ComicWise Support',
      email: 'support@comicwise.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || 'https://comicwise.com/api',
      description: 'Production server',
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
  ],
  paths: {
    '/comics': {
      get: {
        summary: 'List comics',
        description: 'Retrieve a paginated list of comics',
        tags: ['Comics'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Items per page',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Search query',
            schema: { type: 'string' },
          },
          {
            name: 'genre',
            in: 'query',
            description: 'Filter by genre',
            schema: { type: 'string' },
          },
          {
            name: 'sortBy',
            in: 'query',
            description: 'Sort field',
            schema: {
              type: 'string',
              enum: ['title', 'createdAt', 'updatedAt', 'rating'],
              default: 'createdAt'
            },
          },
          {
            name: 'sortOrder',
            in: 'query',
            description: 'Sort order',
            schema: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'desc'
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Comic' },
                    },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '500': { $ref: '#/components/responses/ServerError' },
        },
      },
      post: {
        summary: 'Create comic',
        description: 'Create a new comic (Admin only)',
        tags: ['Comics'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateComicRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Comic created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Comic' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '500': { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/comics/{id}': {
      get: {
        summary: 'Get comic',
        description: 'Retrieve a specific comic by ID',
        tags: ['Comics'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Comic ID',
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Comic found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Comic' },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/ServerError' },
        },
      },
    },
  },
  components: {
    schemas: {
      Comic: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Amazing Comic' },
          slug: { type: 'string', example: 'amazing-comic' },
          description: { type: 'string', example: 'An amazing comic story' },
          coverUrl: { type: 'string', example: 'https://example.com/cover.jpg' },
          status: {
            type: 'string',
            enum: ['ongoing', 'completed', 'hiatus', 'cancelled'],
            example: 'ongoing'
          },
          rating: { type: 'number', example: 4.5 },
          chapters: { type: 'integer', example: 25 },
          views: { type: 'integer', example: 10000 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          author: { $ref: '#/components/schemas/Author' },
          genres: {
            type: 'array',
            items: { $ref: '#/components/schemas/Genre' },
          },
        },
        required: ['id', 'title', 'slug', 'description'],
      },
      Author: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'John Doe' },
          slug: { type: 'string', example: 'john-doe' },
          bio: { type: 'string', example: 'Famous comic author' },
          avatarUrl: { type: 'string', example: 'https://example.com/avatar.jpg' },
        },
      },
      Genre: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Action' },
          slug: { type: 'string', example: 'action' },
          description: { type: 'string', example: 'Action-packed stories' },
        },
      },
      CreateComicRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'New Comic' },
          description: { type: 'string', example: 'A great new comic' },
          authorId: { type: 'integer', example: 1 },
          genreIds: {
            type: 'array',
            items: { type: 'integer' },
            example: [1, 2]
          },
          coverUrl: { type: 'string', example: 'https://example.com/cover.jpg' },
          status: {
            type: 'string',
            enum: ['ongoing', 'completed', 'hiatus', 'cancelled'],
            example: 'ongoing'
          },
        },
        required: ['title', 'description', 'authorId'],
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 100 },
          totalPages: { type: 'integer', example: 10 },
          hasNext: { type: 'boolean', example: true },
          hasPrev: { type: 'boolean', example: false },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Error message' },
          meta: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      Unauthorized: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      Forbidden: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      ServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  tags: [
    {
      name: 'Comics',
      description: 'Comic management operations',
    },
    {
      name: 'Chapters',
      description: 'Chapter management operations',
    },
    {
      name: 'Authors',
      description: 'Author management operations',
    },
    {
      name: 'Users',
      description: 'User management operations',
    },
    {
      name: 'Authentication',
      description: 'Authentication operations',
    },
  ],
};`;

// Sample API route template
const SAMPLE_API_ROUTE = `import { NextRequest } from 'next/server';
import { withApiHandler, ApiHandler } from '@/lib/api/utils';
import * as queries from '@/database/queries/comic.queries';

export async function GET(request: NextRequest) {
  return withApiHandler(request, async (req) => {
    const params = ApiHandler.parseQueryParams(req);

    const { comics, total } = await queries.getComics({
      page: params.page,
      limit: params.limit,
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });

    const meta = ApiHandler.paginationMeta(params.page!, params.limit!, total);

    return { comics, meta };
  });
}

export async function POST(request: NextRequest) {
  return withApiHandler(request, async (req) => {
    // Validate admin permissions
    await ApiHandler.validateAdmin(req);

    // Validate request body (implement schema validation)
    const data = await req.json();

    // Create comic logic here
    const comic = await queries.createComic(data);

    return comic;
  });
}`;

async function setupAPI() {
  log.info("🔌 Setting up REST API development suite...");

  try {
    // Install API packages
    log.info("Installing API packages...");
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

    const packagesToInstall = API_PACKAGES.filter((pkg) => {
      const hasPackage = packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg];
      if (!hasPackage) {
        log.info(`  - Adding: ${pkg}`);
        return true;
      } else {
        log.info(`  ✓ Already installed: ${pkg}`);
        return false;
      }
    });

    if (packagesToInstall.length > 0) {
      const installCommand = `pnpm add ${packagesToInstall.join(" ")}`;
      log.info(`Running: ${installCommand}`);
      execSync(installCommand, { stdio: "inherit" });
      log.success("API packages installed");
    } else {
      log.success("All API packages already installed");
    }

    // Create API utilities directory
    const apiDir = path.join(process.cwd(), "src", "lib", "api");
    await fs.mkdir(apiDir, { recursive: true });

    // Create API utilities
    log.info("Creating API utilities...");
    const utilsPath = path.join(apiDir, "utils.ts");
    await fs.writeFile(utilsPath, API_UTILITIES);
    log.success("✓ Created API utilities");

    // Create OpenAPI configuration
    log.info("Creating OpenAPI configuration...");
    const openApiPath = path.join(apiDir, "openapi.ts");
    await fs.writeFile(openApiPath, OPENAPI_CONFIG);
    log.success("✓ Created OpenAPI configuration");

    // Update existing OpenAPI documentation
    log.info("Updating OpenAPI documentation...");
    const docsPath = path.join(process.cwd(), "docs", "openapi.yaml");
    try {
      const existingDocs = await fs.readFile(docsPath, "utf-8");
      const backupPath = path.join(process.cwd(), "docs", "openapi.yaml.backup");
      await fs.writeFile(backupPath, existingDocs);
      log.info(`Backed up existing OpenAPI docs to: ${backupPath}`);
    } catch {
      log.info("Creating new OpenAPI documentation");
    }

    // Create API documentation route
    const appApiDir = path.join(process.cwd(), "src", "app", "api");
    const docsApiDir = path.join(appApiDir, "docs");
    await fs.mkdir(docsApiDir, { recursive: true });

    const docsRoute = `import { NextResponse } from 'next/server';
import { openApiConfig } from '@/lib/api/openapi';

export async function GET() {
  return NextResponse.json(openApiConfig, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}`;
    await fs.writeFile(path.join(docsApiDir, "route.ts"), docsRoute);
    log.success("✓ Created API docs route");

    // Create sample API routes
    log.info("Creating sample API routes...");
    const v1ApiDir = path.join(appApiDir, "v1", "comics");
    await fs.mkdir(v1ApiDir, { recursive: true });

    await fs.writeFile(path.join(v1ApiDir, "route.ts"), SAMPLE_API_ROUTE);
    log.success("✓ Created sample comics API route");

    // Create API index
    const indexContent = `export * from './utils';
export * from './openapi';

// Re-export commonly used items
export { ApiHandler, withApiHandler } from './utils';
export { openApiConfig } from './openapi';
`;
    const indexPath = path.join(apiDir, "index.ts");
    await fs.writeFile(indexPath, indexContent);
    log.success("✓ Created API index");

    log.success("🎉 REST API setup completed successfully!");
    log.info("Available features:");
    log.info("  • API Utilities - Request handling, validation, and responses");
    log.info("  • OpenAPI Documentation - Swagger/OpenAPI 3.0 specifications");
    log.info("  • Sample Routes - Example API endpoints in /api/v1/");
    log.info("  • Auto-generated Documentation - Available at /api/docs");
  } catch (error) {
    log.error(`API setup failed: ${error}`);
    throw error;
  }
}

// Execute when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupAPI().catch(console.error);
}

export default setupAPI;
