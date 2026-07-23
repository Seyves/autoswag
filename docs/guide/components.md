# Components

Extract reusable schemas with the `@component` tag.

## What Are Components?

Components are reusable schemas stored in `components.schemas` and referenced with `$ref`. They reduce duplication and make OpenAPI specs more maintainable.

## @component Tag

Mark a type as a component by adding `@component` in its JSDoc:

```ts
/**
 * @component User
 */
interface User {
  id: string
  name: string
  email: string
}
```

### Generated OpenAPI

```json
{
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "email": { "type": "string" }
        },
        "required": ["id", "name", "email"]
      }
    }
  }
}
```

### References

Everywhere `User` is used, it becomes a `$ref`:

```ts
/**
 * @autoswag GET /users/{id}
 * @pathParam {string} id
 * @response {User} 200 Success
 */
```

**Generated OpenAPI:**

```json
{
  "responses": {
    "200": {
      "description": "Success",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/User"
          }
        }
      }
    }
  }
}
```

## Component Names

Component name should **always** be specified:

```ts
/**
 * @component UserProfile
 */
interface User {
  id: string
  name: string
}
```

## Nested Components

Components can reference other components:

```ts
/**
 * @component Address
 */
interface Address {
  street: string
  city: string
  country: string
}

/**
 * @component User
 */
interface User {
  id: string
  name: string
  address: Address // References another component
}
```

**Generated:**

```json
{
  "components": {
    "schemas": {
      "Address": {
        "type": "object",
        "properties": {
          "street": { "type": "string" },
          "city": { "type": "string" },
          "country": { "type": "string" }
        },
        "required": ["street", "city", "country"]
      },
      "User": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "address": {
            "$ref": "#/components/schemas/Address"
          }
        },
        "required": ["id", "name", "address"]
      }
    }
  }
}
```

## Circular References

Circular types **must** use `@component`:

```ts
/**
 * @component Category
 */
interface Category {
  id: string
  name: string
  parent?: Category // Circular reference
  children: Category[]
}
```

Without `@component`, the generator throws an error to prevent infinite recursion.

### Tree Structures

```ts
/**
 * @component TreeNode
 */
interface TreeNode {
  value: string
  left?: TreeNode
  right?: TreeNode
}
```

### Linked Lists

```ts
/**
 * @component ListNode
 */
interface ListNode<T> {
  value: T
  next?: ListNode<T>
}
```

## Component Merging

Generated components are merged with [`documents[n].components`](./configuration#documents-n-components) components:

```js
// Manually provided Error schema
components: {
  schemas: {
    Error: { /* ... */ }
  }
}

// Your code defines User with @component
/**
 * @component User
 */
interface User { /* ... */ }

// Final OpenAPI has both
{
  "components": {
    "schemas": {
      "Error": { /* manually defined */ },
      "User": { /* generated */ }
    }
  }
}
```
