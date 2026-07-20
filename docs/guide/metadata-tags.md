# Metadata Tags

Add metadata for your OpenAPI [Schema Object](https://spec.openapis.org/oas/v3.1.0.html#schema-object) via JSDoc metadata tags.

## Available Tags

| Tag           | Purpose                    | Example                       |
| ------------- | -------------------------- | ----------------------------- |
| `@format`     | String format hint         | `@format uuid`                |
| `@example`    | Example value              | `@example "john@example.com"` |
| `@minimum`    | Minimum number value       | `@minimum 0`                  |
| `@maximum`    | Maximum number value       | `@maximum 100`                |
| `@multipleOf` | Number must be multiple of | `@multipleOf 5`               |
| `@pattern`    | Regex pattern              | `@pattern ^[A-Z]{3}$`         |
| `@component`  | Mark as reusable component | `@component User`             |

## Description

To add `description` field to your schema you should specify it like JSDoc comment.

### Example

```ts
/** This is a simple description example */
interface Example {
    id: string
    ratio: number
}
```

**Generated OpenAPI:**

```json
{
    "type": "object",
    "properties": {
        "id": {
            "type": "string"
        },
        "ratio": {
            "type": "number"
        }
    },
    "description": "This is a simple description example",
    "required": ["id", "ratio"]
}
```

### Multiline

```ts
/**
 * Autoswag also
 * supports multiline descriptions.
 *
 * Yep.
 */
interface Example {
    id: string
    ratio: number
}
```

**Generated OpenAPI:**

```json
{
    "type": "object",
    "properties": {
        "id": {
            "type": "string"
        },
        "ratio": {
            "type": "number"
        }
    },
    "description": "Autoswag also supports multiline descriptions. Yep.",
    "required": ["id", "ratio"]
}
```

## @format

Defines `format` field.

### Syntax

```
@format <string>
```

### Example

```ts
interface Example {
    /** @format uuid */
    id: string // → { "type": "string", "format": "uuid" }
    /** @format float */
    ratio: number // → { "type": "number", "format": "float" }
}
```

## @example

Defines `example` field. Parsed as JSON

### Syntax

```
@example <json>
```

### Primitives

```ts
/** @example "John Doe" */
type Name = string
```

**Generated OpenAPI:**

```json
{
    "type": "string",
    "example": "John Doe"
}
```

### Objects

```ts
/**
 * @example {"street": "123 Main St", "city": "NYC"}
 */
type Address = {
    street: string
    city: string
}
```

**Generated OpenAPI:**

```json
{
    "type": "object",
    "properties": {
        "street": {
            "type": "string"
        },
        "city": {
            "type": "string"
        }
    },
    "required": ["street", "city"],
    "example": {
        "street": "123 Main St",
        "city": "NYC"
    }
}
```

## @minimum / @maximum

Define `minimum` and `maximum` fields.

### Syntax

```
@minimum <number>
@maximum <number>
```

### Example

```ts
/**
 * @minimum 18
 * @maximum 120
 */
type Age = number
```

Generated OpenAPI:

```json
{
    "type": "string",
    "minimum": 18,
    "maximum": 120
}
```

## @multipleOf

Define `multipleOf` field.

### Syntax

```
@multipleOf <number>
```

### Example

```ts
interface Order {
    /** @multipleOf 5 */
    quantity: number
}
```

Generated OpenAPI:

```json
{
    "type": "object",
    "properties": {
        "quantity": {
            "type": "number",
            "multipleOf": 5
        }
    },
    "required": ["quantity"]
}
```

## @pattern

Defines `pattern` field.

### Syntax

```
@pattern <string>
```

### Example

```ts
interface User {
    /** @pattern ^[a-zA-Z0-9_]+$ */
    username: string
}
```

Generated OpenAPI:

```json
{
    "type": "object",
    "properties": {
        "username": {
            "type": "string",
            "pattern": "^[a-zA-Z0-9_]+$"
        }
    },
    "required": ["username"]
}
```

::: tip
Regex patterns must be valid JavaScript regex. Backslashes must be escaped in JSDoc.
:::
