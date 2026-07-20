# Operation Object

Tags that define OpenAPI [Operation Object](https://spec.openapis.org/oas/v3.1.0.html#operation-object)

## @autodoc

**Required** - Defines the HTTP method and path for an API endpoint.

### Syntax

```
@autodoc <method> <path>
```

### Parameters

- `method` - HTTP method
- `path` - URL path (can include path parameters with `{name}` syntax)

### Example

```ts
/**
 * @autodoc GET /users
 */
export function listUsers() {}

/**
 * @autodoc DELETE /api/v1/users/{userId}/posts/{postId}
 * @pathParam {string} userId User ID
 * @pathParam {string} postId Post ID
 */
export function deleteUserPost() {}
```

### Path Parameters

Include path parameters in curly braces:

```ts
/**
 * @autodoc GET /users/{id}
 * @autodoc GET /posts/{postId}/comments/{commentId}
 * @autodoc GET /files/{filePath*}  // Greedy parameter (matches /)
 */
```

::: tip
Path parameters in the URL are automatically detected. You still need `@pathParam` to define their type and description.
:::

### Supported HTTP Methods

- **GET**
- **POST**
- **PUT**
- **PATCH**
- **DELETE**
- **OPTIONS**
- **HEAD**
- **TRACE**

## @tag

Defines `tags` field

### Syntax

```
@tag <name>
```

### Example

**Single tag:**

```ts
/**
 * @autodoc GET /users
 * @tag Users
 * @response {User[]} 200 Users list
 */
```

**Multiple tags:**

```ts
/**
 * @autodoc POST /users/{id}/avatar
 * @tag Users
 * @tag Media
 * @pathParam {string} id User ID
 * @accept {File} multipart/form-data
 * @response 201 Avatar uploaded
 */
```

### Tag Descriptions

Define tag descriptions in `baseDoc`:

```ts
generate({
    source: ['src/api/**/*.ts'],
    baseDoc: {
        info: { title: 'My API', version: '1.0.0' },
        tags: [
            {
                name: 'Users',
                description: 'User management endpoints',
            },
            {
                name: 'Products',
                description: 'Product catalog operations',
            },
            {
                name: 'Admin',
                description: 'Administrative functions (requires admin role)',
                externalDocs: {
                    description: 'Admin Guide',
                    url: 'https://docs.example.com/admin',
                },
            },
        ],
    },
})
```

## @summary

Defines `summary` field

### Syntax

```
@summary <text>
```

### Example

```ts
/**
 * @autodoc GET /users
 * @summary List all users
 */
```

### With Long Descriptions

Combine with JSDoc description:

```ts
/**
 * Retrieve detailed user information including profile, settings, and activity.
 *
 * This endpoint returns comprehensive user data. Use GET /users/{id}/profile
 * for a lighter response with just profile information.
 *
 * @autodoc GET /users/{id}
 * @summary Get user details
 * @pathParam {string} id User ID
 * @response {UserDetails} 200 Success
 */
```

In the generated OpenAPI:

- `@summary` → `summary` field (short, shows in lists)
- JSDoc description → `description` field (long, shows in detail view)

## @externalDocs

Defines `externalDocs` field

### Syntax

```
@externalDocs <url> [description]
```

### Example

```ts
/**
 * @autodoc POST /payments
 * @summary Process payment
 * @accept {PaymentRequest}
 * @response {PaymentResult} 200 Payment processed
 * @externalDocs https://docs.example.com/payments
 */

/**
 * @autodoc POST /webhooks
 * @summary Receive webhook
 * @accept {WebhookPayload}
 * @response 200 Received
 * @externalDocs https://docs.example.com/webhooks Webhook setup guide
 */
```

## @operationId

Defines `operationId` field

### Syntax

```
@operationId <id>
```

### Example

```ts
/**
 * @autodoc GET /users/{id}
 * @operationId getUserById
 */
export function getUser() {}
```

## @deprecated

Defines `deprecated` field

### Syntax

```
@deprecated
```

### Example

```ts
/**
 * @autodoc GET /api/v1/users
 * @summary List users
 * @deprecated
 */
```

## @security

Defines `security` field.

::: info
More about using security **[here](./security)**
:::

### Syntax

```
@security <schemeName> [scope1 scope2 ...]
```

- `schemeName` - Name of the security scheme (defined in baseDoc)
- `scopes` - Optional list of required scopes (for OAuth2/OpenID Connect)

### Example

```ts
/**
 * @autodoc GET /profile
 * @summary Get current user profile
 * @security bearerAuth
 * @response {User} 200 Profile data
 * @response 401 Unauthorized
 */
```

## @server

Defines `servers` field

### Syntax

```
@server <url> [description]
```

### Example

**Different server for specific endpoints:**

```ts
/**
 * @autodoc POST /upload
 * @server https://cdn.example.com CDN upload endpoint
 * @accept {File} multipart/form-data
 * @response 201 Uploaded
 */
```

**Multiple servers:**

```ts
/**
 * @autodoc GET /data
 * @server https://api-primary.example.com Primary datacenter
 * @server https://api-backup.example.com Backup datacenter
 * @response {Data} 200 Success
 */
```
