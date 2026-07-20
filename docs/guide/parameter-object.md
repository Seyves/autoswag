# Parameter Object

Tags that define OpenAPI [Parameter Object](https://spec.openapis.org/oas/v3.1.0.html#parameter-object)

## Common Syntax

```
@<tag> {type} [name] [description]
@<tag> {type} name [description]
```

- `{type}` - TypeScript type reference
- `[name]` - Optional parameter (with brackets)
- `name` - Required parameter (no brackets)
- `[description]` - Human-readable description

## @pathParam

Defines **Parameter Object** with `path` name

### Syntax

```
@pathParam {type} name description
```

### Example

```ts
/**
 * @autodoc GET /users/{id}
 * @pathParam {string} id User ID
 * @response {User} 200 Success
 */

/**
 * @autodoc GET /users/{userId}
 * @pathParam {uuid} userId User UUID
 */
```

::: warning
Path parameters are **always required** in OpenAPI. The `[name]` optional syntax doesn't apply to `@pathParam`.
:::

## @queryParam

Defines **Parameter Object** with `query` name

### Syntax

```
@queryParam {type} [name] description // Optional
@queryParam {type} name description   // Required
```

### Example

```ts
/**
 * @autodoc GET /users
 * @queryParam {number} [limit] Max results
 * @queryParam {number} [offset] Pagination offset
 * @queryParam {string} [sort] Sort field
 * @response {User[]} 200 User list
 */
```

## @headerParam

Defines **Parameter Object** with `header` name

### Syntax

```
@headerParam {type} [name] description // Optional
@headerParam {type} name description   // Required
```

### Example

```ts
/**
 * @autodoc POST /users
 * @headerParam {uuid} X-Idempotency-Key Unique request ID
 * @headerParam {string} [X-Request-ID] Request trace ID
 * @accept {User} application/json
 * @response {User} 201 Created
 */
```
::: tip Authorization
Header params are separate from security schemes. For OAuth/API keys, use [`@security`](./security) instead.
:::

## @cookieParam

Defines **Parameter Object** with `cookie` name

### Syntax

```
@cookieParam {type} [name] description // Optional
@cookieParam {type} name description   // Required
```

### Example

```ts
/**
 * @autodoc GET /profile
 * @cookieParam {string} sessionId Session identifier
 * @cookieParam {string} [preferences] User preferences JSON
 * @response {Profile} 200 User profile
 */
```
