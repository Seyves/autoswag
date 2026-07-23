# Quick Start

Generate your first OpenAPI document in 5 minutes.

## Step 1: Initialize a Project

To init your project just run:

```
$ npx autoswag --init
```

This will create a simple `.autoswagrc.cjs` example file.

## Step 2: Configure Autoswag

Your init config will look something like this:

```js [.autoswagrc.cjs]
// @ts-check
const autoswag = require('autoswag')

/** @type {autoswag.Config} */
const config = {
  // OpenAPI version (it should be here, not in the root)
  version: autoswag.OpenApiVersion.v31,
  documents: [
    {
      // Glob patterns to search for your source code
      source: ['src/api/*.ts'],
      // Where to put generated OpenAPI
      output: 'openapi.json',
      // Root OpenAPI information
      root: {
        info: {
          title: 'Your title here',
          description: 'Your description here',
        },
      },
    },
  ],
}

module.exports = config
```

Configure source pattern and you are ready to go.

::: info YAML
If you want to generate your OpenAPI with YAML, reference [this](./configuration#format).
:::

## Step 3: Document Your Endpoints

Now document your API endpoints using Autoswag JSDoc syntax:

```ts [src/api/users.ts]
import type { User, CreateUserRequest, ErrorResponse } from '../types/user'

/**
 * @autoswag POST /users
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
 * @autoswag GET /users/{id}
 * @summary Get user by ID
 * @tag Users
 * @pathParam {string} id User ID
 * @response {User} 200 User found
 * @response {ErrorResponse} 404 User not found
 */
export async function getUser(req, res) {
  // Your implementation here
}
```

## Step 4: Run Generation

```
$ npx autoswag
```

## Step 5: View Your Documentation

You now have a complete `openapi.json` file:

::: details Click to view generated OpenAPI

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
      //...
    }
  }
}
```

:::

You can view it with any OpenAPI tool:

```bash
docker run -p 8080:8080 \
  -e SWAGGER_JSON=/openapi.json \
  -v $(pwd)/openapi.json:/openapi.json \
  swaggerapi/swagger-ui
```
