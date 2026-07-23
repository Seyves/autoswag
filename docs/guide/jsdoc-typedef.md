# JSDoc @typedef

Use Autoswag with JavaScript files using JSDoc `@typedef`.

## Overview

If you're not using TypeScript, you can still define types with JSDoc comments. The generator parses `@typedef` blocks and converts them to OpenAPI schemas.

## Simple Example

```javascript
/**
 * User account information
 * @typedef {Object} User
 * @property {string} id User ID
 * @property {string} name Full name
 * @property {string} [email] Email address
 * @property {number} age Age in years
 */
```

**Generated OpenAPI:**

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "User ID"
    },
    "name": {
      "type": "string",
      "description": "Full name"
    },
    "email": {
      "type": "string",
      "description": "Email address"
    },
    "age": {
      "type": "number",
      "description": "Age in years"
    }
  },
  "required": ["id", "name", "age"]
}
```

## Adding Metadata

Add metadata to your `@typedef` with our custom syntax.
Every tag specified on [this page](./metadata-tags) is supported.

::: info
The syntax was invented in the first place because TypeScript compiler
is very strict about @typedef definitions. It is not allowed to use custom JSDoc tags there.
:::

### Syntax

```
 * - <tag_name>: <value>
```

### Example

```javascript
/**
 * @typedef {Object} User
 * @property {string} id User ID
 * - format: uuid
 * @property {string} email Email address
 * - format: email
 * - example: "john@example.com"
 * @property {string} createdAt Creation timestamp
 * - format: date-time
 */
```

**Generated OpenAPI:**

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "User ID",
      "format": "uuid"
    },
    "email": {
      "type": "string",
      "description": "Email address",
      "format": "email"
    },
    "createdAt": {
      "type": "string",
      "description": "Creation timestamp",
      "format": "date-time"
    }
  },
  "required": ["id", "email", "createdAt"]
}
```

### Components

This syntax also used to define `@typedef` type as an OpenAPI component.

[See more about components ->](./components)

```javascript
/**
 * User account information
 * - component: User
 * @typedef {Object} User
 * @property {string} id
 * - format: uuid
 * @property {string} name
 * @property {string} email
 * - format: email
 */
```

**Generated OpenAPI:**

```json
{
  "components": {
    "schemas": {
      "User": {
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
            "type": "string",
            "format": "email"
          }
        },
        "required": ["id", "name", "email"],
        "description": "User account information"
      }
    }
  }
}
```

## TypeScript vs JSDoc

**TypeScript:**

```ts
/** @component User */
interface User {
  /**
   * User ID
   * @format uuid
   */
  id: string
  /** Full name */
  name: string
  /**
   * Email address
   * @format email
   */
  email: string
}
```

**JSDoc equivalent:**

```javascript
/**
 * - component: User
 * @typedef {Object} User
 * @property {string} id User ID
 * - format: uuid
 * @property {string} name Full name
 * @property {string} email Email address
 * - format: email
 */
```
