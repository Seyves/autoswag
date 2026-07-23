# Type Referencing

## Overview

Type parameters in curly braces `{type}` are used throughout Autoswag to reference schemas. They appear in: [`@accept`](./request-body-object#accept), [`@response`](./response-object), [`@pathParam`](./parameter-object#pathparam), [`@queryParam`](./parameter-object#queryparam), [`@headerParam`](./parameter-object#headerparam) and [`@cookieParam`](./parameter-object#cookieparam).

### Syntax

```ts
@<tag> {<type>} [other parameters...]
```

The `{type}` parameter can represent:

1. **Primitive types** - `string`, `number`, `boolean`, `null`
2. **TypeScript type references** - Interface or type alias names
3. **TypeScript type expressions** - Inline type definitions
4. **OpenAPI component references** - Pre-defined schemas with `ref:` prefix
5. **Format constants** - Built-in formats like `uuid`, `email`, `date-time`

## 1. Primitive Types

The simplest case - reference a basic JavaScript type directly.

### Example

```ts
/**
 * ...
 * @response {number} 200
 * ...
 */
```

**Generated OpenAPI:**

```json
{
  "type": "number"
}
```

### Edge case: Null type

```ts
/**
 * ...
 * @response {null} 200
 * ...
 */
```

Generates `{ "type": "null" }` in OpenAPI 3.1 or `{ "nullable": true }` in OpenAPI 3.0.

## 2. TypeScript Type References

Reference any TypeScript type defined in your codebase. This is the primary feature of Autoswag.

### Example

```ts
interface User {
  id: string
  name: string
  email?: string
}

/**
 * ...
 * @response {User} 200 User found
 * ...
 */
```

**Generated OpenAPI:**

```json
{
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
```

::: info Support
Autoswag supports almost every TypeScript type, even @typedef. More on how types are resolved [**here**](./supported-types)
:::

### Imported Type References

Types can be imported from other files:

::: code-group

```ts [types/user.ts]
export interface User {
  id: string
  name: string
  email?: string
}
```

```ts [api/users.ts]
import type { User } from '../types/user'

/**
 * ...
 * @response {User[]} 200 User list
 * ...
 */
```

:::

::: tip Cross-File Resolution
Autoswag uses the TypeScript compiler API to resolve all imports automatically. It respects your `tsconfig.json` path aliases.
:::

## 3. TypeScript Type Expressions

Use TypeScript syntax directly in the type parameter for inline types.

::: warning
To implement such functionality, Autoswag is forced to create temporary source files.
We do not recommend using too many type expressions for large projects and files.
:::

### Example

```ts
/**
 * ...
 * @response {'success'|'error'} 200 Status
 * ...
 */
```

**Generated OpenAPI:**

```json
{
  "type": "string",
  "enum": ["success", "error"]
}
```

## 4. OpenAPI Component References

Reference pre-defined [`documents[n].components`](./configuration#documents-n-basedoc) schemas using the `ref:` prefix.

Pre-defined components in configuration file:

```js
components: {
  schemas: {
    Error: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['code', 'message'],
    },
  },
},
```

Using Component Reference:

```ts
/**
 * ...
 * @response {ref:Error} 500 Server error
 * ...
 */
```

**Generated OpenAPI:**

```json
{
  "$ref": "#/components/schemas/Error"
}
```

### When to Use Component References

**Use `ref:` when:**

- Sharing hand-written schemas across many endpoints
- Integrating with existing OpenAPI documents
- Using non-json schemas

**Use TypeScript types when:**

- Type is defined in your codebase
- You want type safety and IDE autocomplete
- Schema matches your actual data structures

## 5. Format Constants

Use built-in format strings directly for common patterns.

### UUID

```ts
/**
 * ...
 * @pathParam {uuid} User ID
 * ...
 */
```

**Generated OpenAPI:**

```json
{
  "type": "string",
  "format": "uuid"
}
```

### Email

```ts
/**
 * ...
 * @queryParam {email} email Email address
 * ...
 */
```

**Generated OpenAPI:**

```json
{
  "type": "string",
  "format": "email"
}
```

### All Supported Format Constants

<details>
<summary>Click to see all 76+ supported format constants</summary>

| Name                  | Associated Type |
| --------------------- | --------------- |
| base64url             | string          |
| binary                | string          |
| byte                  | string          |
| char                  | string          |
| commonmark            | string          |
| date-time-local       | string          |
| date-time             | string          |
| date                  | string          |
| decimal               | number          |
| decimal128            | number          |
| double-int            | number          |
| double                | number          |
| duration              | string          |
| email                 | string          |
| float                 | number          |
| hostname              | string          |
| html                  | string          |
| http-date             | string          |
| idn-email             | string          |
| idn-hostname          | string          |
| int16                 | number          |
| int32                 | number          |
| int64                 | number          |
| int8                  | number          |
| ipv4-cidr             | string          |
| ipv4                  | string          |
| ipv6-cidr             | string          |
| ipv6                  | string          |
| iri-reference         | string          |
| iri                   | string          |
| json-pointer          | string          |
| language              | string          |
| media-range           | string          |
| password              | string          |
| regex                 | string          |
| relative-json-pointer | string          |
| sf-binary             | string          |
| sf-boolean            | string          |
| sf-decimal            | string          |
| sf-integer            | number          |
| sf-string             | string          |
| sf-token              | string          |
| time-local            | string          |
| time                  | string          |
| uint16                | number          |
| uint32                | number          |
| uint64                | number          |
| uint8                 | number          |
| unixtime              | number          |
| uri-reference         | string          |
| uri-template          | string          |
| uri                   | string          |
| uuid                  | string          |

</details>

## Type Resolution Order

When Autoswag encounters a type parameter, it resolves it in this order:

1. **Check if primitive** - `string`, `number`, `boolean`, `null`
2. **Check if format constant** - `uuid`, `email`, `date-time`, etc.
3. **Check if component reference** - Starts with `ref:`
4. **Parse as TypeScript expression** - Use TypeScript compiler API
5. If type could not be resolved, then using `{}`
