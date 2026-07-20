# Quick Start

Generate your first OpenAPI document in 5 minutes. This guide walks through a complete example from scratch.

## Step 1: Create Your Types

First, define your data types. These will be automatically converted to OpenAPI schemas:

```ts [src/types/user.ts]
export interface User {
    /** @format uuid */
    id: string

    name: string

    /** @format email */
    email: string

    age?: number

    /** @format date-time */
    createdAt: string
}

export interface CreateUserRequest {
    name: string

    /** @format email */
    email: string

    age?: number
}

export interface ErrorResponse {
    error: string
    message: string
}
```

::: tip JSDoc Format Tags
`@format` tags add OpenAPI `format` field to the schema. [Learn more about metadata tags→](./metadata-tags)
:::

::: tip Defining standalone types
You are not forced to define types yourself, Swagger Autodoc can infer them from almost any TypeScript type. You can use `z.infer` from zod, for [example](./zod-example).
:::

## Step 2: Document Your Endpoints

Now document your API endpoints using JSDoc comments:

```ts [src/api/users.ts]
import type { User, CreateUserRequest, ErrorResponse } from '../types/user'

/**
 * @autodoc POST /users
 * @summary Create a new user
 * @tag Users
 * @accept {CreateUserRequest}
 * @response {User} 201 User created successfully
 * @response {ErrorResponse} 400 Invalid input
 * @response 401 Unauthorized
 */
export async function createUser(req, res) {
    // Your implementation here
}

/**
 * @autodoc GET /users/{id}
 * @summary Get user by ID
 * @tag Users
 * @pathParam {string} id User ID
 * @response {User} 200 User found
 * @response {ErrorResponse} 404 User not found
 */
export async function getUser(req, res) {
    // Your implementation here
}

/**
 * @autodoc GET /users
 * @summary List all users
 * @tag Users
 * @queryParam {number} [limit] Maximum number of users
 * @queryParam {number} [offset] Pagination offset
 * @response {User[]} 200 List of users
 */
export async function listUsers(req, res) {
    // Your implementation here
}
```

::: info JSDoc Tags Explained

- `@autodoc <METHOD> <path>` - Defines the endpoint
- `@summary` - Brief description (shows in API docs)
- `@tag` - Groups related endpoints together
- `@accept` - Request body type and content-type
- `@response` - Response type, status code, and description
- `@pathParam` / `@queryParam` - Parameters

**[See all available tags →](./tags-overview)**
:::

## Step 3: Create Generator Script

Create a script to generate the OpenAPI document:

```ts [scripts/generate-docs.ts]
import { generate, OpenApiVersion } from 'swagger-autodoc'
import { writeFileSync } from 'fs'

// Base OpenAPI document (metadata)
const baseDoc = {
    info: {
        title: 'My API',
        version: '1.0.0',
        description: 'API for managing users',
        contact: {
            name: 'API Support',
            email: 'support@example.com',
        },
    },
    servers: [
        {
            url: 'https://api.example.com',
            description: 'Production server',
        },
        {
            url: 'http://localhost:3000',
            description: 'Development server',
        },
    ],
}

// Generate OpenAPI document
const openApiDoc = generate({
    source: ['src/api/**/*.ts'], // Scan all API files
    baseDoc,
    version: OpenApiVersion.v31, // Use OpenAPI 3.1
})

// Write to file
writeFileSync('./openapi.json', JSON.stringify(openApiDoc, null, 2), 'utf-8')
```

## Step 4: Run the Generator

Execute your generator script:

```bash
npx tsx scripts/generate-docs.ts
```

Or add it to your `package.json`:

```json
{
    "scripts": {
        "generate:docs": "tsx scripts/generate-docs.ts"
    }
}
```

Then run:

```bash
npm run generate:docs
```

## Step 5: View Your Documentation

You now have a complete `openapi.json` file:

::: details Click to view generated OpenAPI (excerpt)

```json
{
    "openapi": "3.1.0",
    "info": {
        "title": "My API",
        "version": "1.0.0",
        "description": "API for managing users"
    },
    "servers": [
        {
            "url": "https://api.example.com",
            "description": "Production server"
        }
    ],
    "paths": {
        "/users": {
            "post": {
                "summary": "Create a new user",
                "tags": ["Users"],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "name": { "type": "string" },
                                    "email": { "type": "string", "format": "email" },
                                    "age": { "type": "number" }
                                },
                                "required": ["name", "email"]
                            }
                        }
                    }
                },
                "responses": {
                    "201": {
                        "description": "User created successfully",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "id": { "type": "string", "format": "uuid" },
                                        "name": { "type": "string" },
                                        "email": { "type": "string", "format": "email" },
                                        "age": { "type": "number" },
                                        "createdAt": { "type": "string", "format": "date-time" }
                                    },
                                    "required": ["id", "name", "email", "createdAt"]
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid input",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "error": { "type": "string" },
                                        "message": { "type": "string" }
                                    },
                                    "required": ["error", "message"]
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
```

:::

You can view it with any OpenAPI tool:

### Option 1: Swagger UI (Docker)

```bash
docker run -p 8080:8080 \
  -e SWAGGER_JSON=/openapi.json \
  -v $(pwd)/openapi.json:/openapi.json \
  swaggerapi/swagger-ui
```

Open `http://localhost:8080`

### Option 2: Redoc (Docker)

```bash
docker run -p 8080:80 \
  -e SPEC_URL=openapi.json \
  -v $(pwd)/openapi.json:/usr/share/nginx/html/openapi.json \
  redocly/redoc
```

Open `http://localhost:8080`

### Option 3: VS Code Extension

Install the **OpenAPI (Swagger) Editor** extension and open `openapi.json` directly in VS Code.

### Option 4: Online Viewer

Upload your `openapi.json` to:

- [Swagger Editor](https://editor.swagger.io/)
- [Redoc Demo](https://redocly.github.io/redoc/)

## What Just Happened?

1. **JSDoc comments** were extracted and mapped to OpenAPI operations
2. **TypeScript types** were parsed and converted to OpenAPI schemas
3. **Format tags** (`@format uuid`, `@format email`) became OpenAPI format constraints
4. **Optional properties** (`age?: number`) were marked as non-required
5. Everything merged into a **valid OpenAPI 3.1 document**

## Next Steps

You've generated your first OpenAPI document. Now:

- **[Learn all JSDoc tags →](./tags-overview)** - Parameters, security, metadata, etc.
- **[Explore TypeScript support →](./supported-types)** - Unions, generics, enums, etc.
- **[See real examples →](./rest-api-example)** - Complete API examples

Or dive into **[Configuration →](./configuration)** to customize the generator.
