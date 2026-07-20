# Using with Zod

## Overview

Use Zod schemas for validation, then infer TypeScript types for OpenAPI generation.

## Example

```ts
import { z } from 'zod'

// Define Zod schema
export const UserSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    email: z.string().email(),
    age: z.number().int().min(18).max(120).optional(),
    role: z.enum(['user', 'admin']),
    createdAt: z.string().datetime(),
})

// Infer TypeScript type
/** @component User */
export type User = z.infer<typeof UserSchema>

// Use in endpoint
/**
 * @autoswag POST /users
 * @accept {User} application/json
 * @response {User} 201 Created
 */
export async function createUser(req, res) {
    const data = UserSchema.parse(req.body) // Runtime validation
    // ... create user
}
```

The `@component` tag works on the inferred type, generating OpenAPI from TypeScript.

## Metadata

The only drawback of this approach is that [metadata](./metadata-tags) cannot be specified without redefining the property:

```ts
// Infer TypeScript type
/** @component User */
export type User = {
    /** @format uuid */
    id: string 
} & z.infer<typeof UserSchema>
```
