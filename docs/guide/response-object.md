# Response Object

Tags that define OpenAPI [Response Object](https://spec.openapis.org/oas/v3.1.0.html#responses-object).

## @response

### Syntax

```
@response {type} <code>[.contentType] <description>
@response <code>[.contentType] <description>
```

- `{type}` - Response body type (optional)
- `code` - HTTP status code (200, 404, etc.)
- `.contentType` - MIME type (optional, default: `application/json`)
- `description` - Description

### Example

```ts{4-5,11-12}
/**
 * @autoswag GET /users/{id}
 * @pathParam {string} id User ID
 * @response {User} 200 User found
 * @response 404 User not found
 */

/**
 * @autoswag DELETE /users/{id}
 * @pathParam {string} id User ID
 * @response 204 User deleted
 * @response 404 User not found
 */
```
