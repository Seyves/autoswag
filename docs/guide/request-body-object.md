# Request Body Object

Tags that define OpenAPI [Requst Body Object](https://spec.openapis.org/oas/v3.1.0.html#request-body-object).

## Overview

Request bodies are defined using two tags:

1. **`@body`** - Metadata (required/optional, description)
2. **`@accept`** - Schema and content-type

::: info
You can use **`@accept`** without **`@body`**; however, **`@body`** cannot be used without **`@accept`**, since the OpenAPI content map is mandatory.

:::

## @body

Defines `description` and `required` fields.

### Syntax

```
@body required [description]
@body optional [description]
```

### Example

```ts{3,9}
/**
 * @autoswag POST /users
 * @body required User data
 * @accept {User} application/json
 */

/**
 * @autoswag PATCH /users/{id}
 * @body optional Partial user updates
 * @accept {Partial<User>} application/json
 */
```

## @accept

Defines element in `content` map field.

### Syntax

```
@accept {type} [contentType]
```

- `{type}` - TypeScript type reference
- `contentType` - MIME type (defaults to `application/json`)

### Example

```ts{4,11-12}
/**
 * @autoswag POST /users
 * @body required User data
 * @accept {CreateUserRequest}  
 * @response {User} 201 Created
 */

/**
 * @autoswag POST /upload
 * @body required File upload
 * @accept {FileUpload} multipart/form-data
 * @accept {string} text/plain
 * @response 201 Uploaded
 */
```
