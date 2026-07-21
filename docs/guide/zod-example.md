# Using with Zod

## Overview

Autoswag supports Zod out of the box. This is one of the most convenient and easiest ways to maintain you API.

::: info
Autoswag does not support automatic format resolution for now.
:::

## Example

```ts
import { z } from 'zod'

export const AddressSchema = z.object({
    /** Street address */
    street: z.string(),
    city: z.string(),
    zip: z.string(),
})

export const UserSchema = z.object({
    /** @format uuid */
    id: z.uuid(),
    /** User name */
    name: z.string(),
    /** @format email */
    email: z.email(),
    age: z.number().int().optional(),
    address: AddressSchema,
    role: z.enum(['user', 'admin']),
    /** @format datetime */
    createdAt: z.iso.datetime(),
})

export type User = z.infer<typeof UserSchema>

/**
 * @autoswag POST /users
 * @accept {User}
 * @response {{id: string}} 201 Created
 */
export async function createUser(req, res) {
    const data = UserSchema.parse(req.body)
    // ... create user
}
```

**Generated OpenApi paths:**

```json
{
  "/users": {
    "post": {
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
                  "type": "string",
                  "description": "User name"
                },
                "email": {
                  "type": "string",
                  "format": "email"
                },
                "address": {
                  "type": "object",
                  "properties": {
                    "street": {
                      "type": "string",
                      "description": "Street address"
                    },
                    "city": {
                      "type": "string"
                    },
                    "zip": {
                      "type": "string"
                    }
                  },
                  "required": [
                    "street",
                    "city",
                    "zip"
                  ]
                },
                "role": {
                  "type": "string",
                  "enum": [
                    "user",
                    "admin"
                  ]
                },
                "createdAt": {
                  "type": "string",
                  "format": "datetime"
                },
                "age": {
                  "type": "number"
                }
              },
              "required": [
                "id",
                "name",
                "email",
                "address",
                "role",
                "createdAt"
              ]
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Created",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string"
                  }
                },
                "required": [
                  "id"
                ]
              }
            }
          }
        }
      }
    }
  }
}
```
