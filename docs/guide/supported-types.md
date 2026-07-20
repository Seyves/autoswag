# Supported TypeScript Types

Autoswag uses the TypeScript compiler API to understand your types and convert them to OpenAPI schemas.

## Primitives

### Basic Types

```ts
type Email = string // → { "type": "string" }
type IsValid = boolean // → { "type": "boolean" }
```

### Literal Types

```ts
type Status = 'active' // → { "type": "string", "enum": ["active"] }
type Code = 200 // → { "type": "number", "enum": [200] }
```

### Any and Unknown

```ts
type MyAny = any // → { } (empty schema, allows anything)
type MyUnknown = unknown // → { } (empty schema)
```

::: warning
`any` and `unknown` types generate empty schemas with no validation. Use specific types when possible.
:::

## Objects

### Interfaces

```ts
interface User {
    id: string
    name: string
    email?: string // Optional
}
```

**Generated OpenAPI:**

```json
{
    "type": "object",
    "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "email": { "type": "string" }
    },
    "required": ["id", "name"]
}
```

### Type Aliases

```ts
type Point = {
    x: number
    y: number
}
```

Works identically to interfaces.

### Nested Objects

```ts
interface Address {
    street: string
    city: string
    country: string
}

interface User {
    name: string
    address: Address
}
```

**Generated OpenAPI:**

```json
{
    "type": "object",
    "properties": {
        "name": { "type": "string" },
        "address": {
            "type": "object",
            "properties": {
                "street": { "type": "string" },
                "city": { "type": "string" },
                "country": { "type": "string" }
            },
            "required": ["street", "city", "country"]
        }
    },
    "required": ["name", "address"]
}
```

### Index Signatures

```ts
interface Dictionary {
    [key: string]: number
}
```

**Generated OpenAPI:**

```json
{
    "type": "object",
    "additionalProperties": {
        "type": "number"
    }
}
```

### Readonly Properties

```ts
interface User {
    readonly id: string // Treated as required, no special OpenAPI handling
    name: string
}
```

::: info
OpenAPI doesn't have a `readonly` concept. The property is just required.
:::

## Arrays

### Array Syntax

```ts
// → { "type": "array", "items": { "type": "string" } }
type Tags = string[]
// → { "type": "array", "items": { "type": "number" } }
type Numbers = Array<number>
// → { "type": "array", "items": { "$ref": "#/components/schemas/User" }}
type Users = User[]
```

### Nested Arrays

```ts
type Matrix = number[][] // → array of arrays
type Complex = User[][] // → array of array of User
```

## Tuples

Fixed-length arrays with specific types for each position.

```ts
type Pair = [string, number]
```

**OpenAPI 3.1 (prefixItems):**

```json
{
    "type": "array",
    "prefixItems": [{ "type": "string" }, { "type": "number" }],
    "minItems": 2,
    "maxItems": 2
}
```

**OpenAPI 3.0 (oneOf workaround):**

```json
{
    "type": "array",
    "items": {
        "oneOf": [{ "type": "string" }, { "type": "number" }]
    }
}
```

## Unions

Multiple possible types, separated by `|`.

### Union of same type Primitives

```ts
// → { "type": "string", "enum": ["pending", "active", "inactive"] }
type Status = 'pending' | 'active' | 'inactive'
// → { "type": "number", "enum": [200, 404, 500] }
type Code = 200 | 404 | 500
```

### Union of Objects

```ts
interface Success {
    status: 'success'
    data: string
}

interface Error {
    status: 'error'
    message: string
}

type Response = Success | Error
```

**Generated OpenAPI:**

```json
{
    "oneOf": [
        {
            "type": "object",
            "properties": {
                "status": { "type": "string", "enum": ["success"] },
                "data": { "type": "string" }
            },
            "required": ["status", "data"]
        },
        {
            "type": "object",
            "properties": {
                "status": { "type": "string", "enum": ["error"] },
                "message": { "type": "string" }
            },
            "required": ["status", "message"]
        }
    ]
}
```

### Optional via Union with Undefined

```ts
interface Example {
    optional1: string | undefined // Same as string?
    optional2?: string // Preferred syntax
}
```

Both generate the same OpenAPI (non-required property).

### Nullable Types

```ts
interface Example {
    nullableString: string | null
}
```

**OpenAPI 3.1:**

```json
{
    "type": ["string", "null"]
}
```

**OpenAPI 3.0:**

```json
{
    "type": "string",
    "nullable": true
}
```

## Intersections

Combine multiple types with `&`.

```ts
interface Named {
    name: string
}

interface Aged {
    age: number
}

type Person = Named & Aged

// Equivalent to:
// interface Person {
//     name: string
//     age: number
// }
```

**Generated OpenAPI:**

```json
{
    "type": "object",
    "properties": {
        "name": { "type": "string" },
        "age": { "type": "number" }
    },
    "required": ["name", "age"]
}
```
::: warning
Autoswag handles only objects intersections.
:::

::: warning
If an object intersection contains a property defined in both objects, Autoswag uses the one from the object listed first.
Example:

```ts
// → { "type": "string" }
type A = { id: string } & { id: number }
// → { "type": "number" }
type A = { id: number } & { id: string }
```
:::

## Enums

### String Enums

```ts
enum Status {
    Pending = 'pending',
    Active = 'active',
    Inactive = 'inactive',
}
```

**Generated OpenAPI:**

```json
{
    "type": "string",
    "enum": ["pending", "active", "inactive"]
}
```

### Numeric Enums

```ts
enum HttpStatus {
    OK = 200,
    NotFound = 404,
    ServerError = 500,
}
```

**Generated OpenAPI:**

```json
{
    "type": "number",
    "enum": [200, 404, 500]
}
```

### Auto-Incrementing Enums

```ts
enum Order {
    First, // 0
    Second, // 1
    Third, // 2
}
```

**Generated OpenAPI:**

```json
{
    "type": "number",
    "enum": [0, 1, 2]
}
```

### Const Enums

```ts
const enum Direction {
    Up = 'up',
    Down = 'down',
}
```

Works the same as regular enums.

## Records

Key-value maps with typed keys and values.

### Record Type

```ts
type StringMap = Record<string, number>

// Equivalent to:
// interface StringMap {
//     [key: string]: number
// }
```

**Generated OpenAPI:**

```json
{
    "type": "object",
    "additionalProperties": {
        "type": "number"
    }
}
```

### Record with Object Values

```ts
type UserMap = Record<string, User>
```

**Generated OpenAPI:**

```json
{
    "type": "object",
    "additionalProperties": {
        "$ref": "#/components/schemas/User"
    }
}
```

### Record with Literal Keys

```ts
type Config = Record<'development' | 'production', string>

// Expands to:
// interface Config {
//     development: string
//     production: string
// }
```

## Generics

### Generic Types

```ts
interface Response<T> {
    data: T
    status: number
}

type UserResponse = Response<User>

// Expands to:
// interface UserResponse {
//     data: User
//     status: number
// }
```

::: info
Generics are resolved at the point of use. The generic type itself isn't exported to OpenAPI.
:::

## Limitations

### Not Supported

These TypeScript features don't convert to OpenAPI:

- **Function types** - Methods on interfaces are ignored
- **Unresolved conditional types** - `T extends U ? X : Y`
- **Template literal types** - `` `prefix-${string}` `` (resolves to string)
- **Symbols** - `symbol` type
- **Classes** - Use interfaces instead

### Circular References

Circular types must use the `@component` tag:

```ts
/**
 * @component TreeNode
 */
interface TreeNode {
    value: string
    children: TreeNode[] // Circular reference
}
```

Without `@component`, circular references throw an error.

[Learn more about components →](./components)
