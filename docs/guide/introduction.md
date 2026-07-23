# Introduction

## What is Autoswag?

Autoswag is a TypeScript-first tool that generates [OpenAPI](https://spec.openapis.org) documentation from JSDoc comments and TypeScript type definitions. It bridges the gap between your source code and API documentation, keeping them in perfect sync.

## The Problem

Maintaining API documentation is painful:

- **Manual OpenAPI files** - Writing YAML/JSON by hand is tedious, error-prone, and quickly falls out of sync with code
- **Duplication** - You define types in TypeScript, then redefine the same schemas in OpenAPI
- **Version drift** - Code changes, documentation doesn't, users get confused
- **No type safety** - Manual schemas have no connection to your actual types

## The Solution

Autoswag lets you define API endpoints using JSDoc comments directly in your code, while automatically generating OpenAPI schemas from your TypeScript types. You write documentation once, right next to the code it describes.

**Benefits:**

- **Single source of truth** - Types and documentation live together in source code
- **Type-safe** - Schemas are derived from actual TypeScript types, impossible to drift
- **Version controlled** - Documentation changes are tracked in git alongside code changes
- **Zero duplication** - Define types once in TypeScript, use them everywhere
- **Developer-friendly** - Write natural JSDoc comments instead of verbose YAML

## Key Features

- **OpenAPI 3.0 & 3.1 support** - Choose your version, get correct output
- **TypeScript-first** - Automatically converts TypeScript types to OpenAPI schemas
- **Comprehensive type support** - Interfaces, unions, intersections, generics, enums, records, tuples
- **JSDoc @typedef support** - Works with JavaScript projects too
- **Rich metadata** - Add formats, examples, validation rules via JSDoc tags
- **Component management** - Extract reusable schemas automatically
- **Cross-file resolution** - Import types from anywhere in your project

## Quick Example

### Before: Manual OpenAPI

Without Autoswag, you'd maintain types AND schemas separately:

::: code-group

```ts [types.ts]
interface User {
  id: string
  name: string
  email?: string
}
```

```json [manual-openapi.json]
{
  "paths": {
    "/user": {
      "post": {
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "id": { "type": "string", "format": "uuid" },
                  "name": { "type": "string" },
                  "email": { "type": "string" }
                },
                "required": ["id", "name"]
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

### After: Autoswag

With Autoswag, document endpoints with JSDoc and reference your types:

::: code-group

```ts [src/types/user.ts]
interface User {
  /** @format uuid */
  id: string
  name: string
  email?: string
}
```

```ts [src/api/users.ts]
/**
 * @autoswag POST /user
 * @summary Create a new user
 * @accept {User} application/json
 * @response {User} 201 User created successfully
 * @response 400 Invalid user data
 */
export async function createUser(req, res) {
  // Your implementation
}
```

:::

Run **Autoswag CLI**:

```sh
$ npx autoswag
```

Get your generated OpenAPI document:

::: details Generated OpenAPI (click to expand)

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "My API",
    "version": "1.0.0"
  },
  "components": {
    "schemas": {}
  },
  "paths": {
    "/user": {
      "post": {
        "summary": "Create a new user",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "format": "uuid"
                  },
                  "name": {
                    "type": "string"
                  },
                  "email": {
                    "type": "string"
                  }
                },
                "required": ["id", "name"]
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
                    "id": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "name": {
                      "type": "string"
                    },
                    "email": {
                      "type": "string"
                    }
                  },
                  "required": ["id", "name"]
                }
              }
            }
          },
          "400": {
            "description": "Invalid user data"
          }
        }
      }
    }
  }
}
```

:::

**Change your TypeScript type once, documentation updates automatically.** No manual schema maintenance, no sync issues.

## How It Works

1. **Write JSDoc comments** - Mark endpoints with `@autoswag` and other tags
2. **Reference TypeScript types** - Use `{type}` syntax in your JSDoc
3. **Run the generator** - Scans your code, extracts endpoints, converts types
4. **Get OpenAPI output** - Valid OpenAPI 3.0/3.1 JSON ready to use

The generator uses the TypeScript compiler API to understand your types perfectly, supporting interfaces, unions, generics, and [more](./supported-types).

## What Makes It Different?

**vs. Writing OpenAPI manually:**

- No schema duplication
- Type changes automatically propagate
- Less verbose, more maintainable

**vs. swagger-jsdoc:**

- No manual schema definitions in JSDoc
- True TypeScript type integration
- Supports complex types (generics, intersections, etc.)

**vs. Code-first frameworks (tsoa, NestJS):**

- Framework-agnostic - works with Express, Fastify, Hono, anything
- No runtime decorators required
- Lighter weight, just documentation generation

## Next Steps

Ready to get started?

- **[Installation & Setup ->](./installation)** - Install and configure in 2 minutes
- **[Quick Start Guide ->](./quick-start)** - Generate your first OpenAPI doc
- **[JSDoc Tags Reference ->](./tags-overview)** - Learn all available tags
- **[TypeScript Support ->](./supported-types)** - See what types are supported

Or jump straight to **[examples ->](./rest-api-example)** to see real-world usage.
