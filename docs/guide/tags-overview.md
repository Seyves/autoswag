# JSDoc Tags Overview

Autoswag uses JSDoc comment blocks to define API endpoints. This page provides an overview of all available tags.

## Tag Categories

### Endpoint

Define OpenAPI [Operation Object](https://spec.openapis.org/oas/v3.1.0.html#operation-object)

| Tag | Purpose | 
|-----|---------|
| [`@autoswag`](./operation-object#autoswag) | Define HTTP method and path | 
| [`@tag`](./operation-object#tag) | Group endpoints |
| [`@summary`](./operation-object#summary) | Brief endpoint description | 
| [`@externalDocs`](./operation-object#externaldocs) | Link to external docs |
| [`@operationId`](./operation-object#operationid) | Unique operation identifier | 
| [`@deprecated`](./operation-object#deprecated) | Mark as deprecated | 
| [`@security`](./operation-object#security) | Apply security scheme |
| [`@server`](./operation-object#server) | Override server URL |

### Parameters

Define OpenAPI [Parameter object](https://spec.openapis.org/oas/v3.1.0.html#parameter-object)

| Tag | Purpose |
|-----|---------|
| [`@pathParam`](./parameter-object#pathparam) | Path parameter |
| [`@queryParam`](./parameter-object#queryparam) | Query parameter |
| [`@headerParam`](./parameter-object#headerparam) | Header parameter |
| [`@cookieParam`](./parameter-object#cookieparam) | Cookie parameter |

### Request Body

Define OpenAPI [Request body object](https://spec.openapis.org/oas/v3.1.0.html#request-body-object)

| Tag | Purpose |
|-----|---------|
| [`@body`](./request-body-object#body) | Request body metadata |
| [`@accept`](./request-body-object#accept) | Content-type and schema |

### Responses

Define OpenAPI [Response object](https://spec.openapis.org/oas/v3.1.0.html#responses-object)

| Tag | Purpose |
|-----|---------|
| [`@response`](./response-object#response) | Response definition |

## Type Reference Syntax

Reference TypeScript types using `{type}`:

```ts
/**
 * @autoswag POST /users
 * @accept {CreateUserRequest} application/json
 * @response {User} 201 Created
 */
```

[See more about type referencing →](./type-referencing)

## Complete Example

Here's a complete endpoint using multiple tags:

```ts
/**
 * @autoswag PUT /users/{id}
 * @operationId updateUser
 * @summary Update user information
 * @tag Users
 * @deprecated Use PATCH /users/{id} instead
 * 
 * @security bearerAuth
 * 
 * @pathParam {string} id User ID
 * @queryParam {boolean} [sendNotification=true] Send email notification
 * @headerParam {string} X-Request-ID Request trace ID
 * 
 * @body required User data to update
 * @accept {UpdateUserRequest} application/json
 * 
 * @response {User} 200 User updated successfully
 * @response {ErrorResponse} 400 Invalid input
 * @response 401 Unauthorized
 * @response {ErrorResponse} 404 User not found
 * 
 * @externalDocs https://docs.example.com/api/users#update User update guide
 */
export async function updateUser(req, res) {
    // Implementation
}
```

This generates a complete OpenAPI operation with:
- Method and path
- Unique ID and description
- Tag grouping
- Deprecation notice
- Security requirement
- Three parameter types
- Request body schema
- Four response definitions
- External documentation link

## Multiple Values

Some tags can be used multiple times:

```ts
/**
 * @autoswag GET /search
 * 
 * @tag Users
 * @tag Products
 * 
 * @queryParam {string} [q] Search query
 * @queryParam {number} [limit] Result limit
 * @queryParam {number} [offset] Result offset
 * 
 * @security apiKey
 * @security bearerAuth
 * 
 * @response {SearchResult} 200 Search results
 * @response 400 Invalid query
 * @response 401 Unauthorized
 */
```
