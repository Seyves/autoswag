# Operation Object

Tags that define OpenAPI [Operation Object](https://spec.openapis.org/oas/v3.1.0.html#operation-object).

## @autoswag

**Required** - Defines the HTTP method and path for an API endpoint.

### Syntax

```
@autoswag <method> <path>
```

### Parameters

- `method` - HTTP method
- `path` - URL path (can include path parameters with `{name}` syntax)

### Example

```ts
/**
 * @autoswag GET /users
 */
export function listUsers() {}

/**
 * @autoswag DELETE /api/v1/users/{userId}/posts/{postId}
 * @pathParam {string} userId User ID
 * @pathParam {string} postId Post ID
 */
export function deleteUserPost() {}
```

### Path Parameters

Include path parameters in curly braces:

```ts
/**
 * @autoswag GET /users/{id}
 * @autoswag GET /posts/{postId}/comments/{commentId}
 * @autoswag GET /files/{filePath*}  // Greedy parameter (matches /)
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

Defines `tags` field.

### Syntax

```
@tag <name>
```

### Example

**Single tag:**

```ts{3}
/**
 * @autoswag GET /users
 * @tag Users
 * @response {User[]} 200 Users list
 */
```

**Multiple tags:**

```ts{3-4}
/**
 * @autoswag POST /users/{id}/avatar
 * @tag Users
 * @tag Media
 * @pathParam {string} id User ID
 * @accept {File} multipart/form-data
 * @response 201 Avatar uploaded
 */
```

### Tag Descriptions

Define tag descriptions in [`root`](./configuration#documents-n-root).

## description

Defines `description` field.

There is no tag for description, **Autoswag** takes JSDoc description text.

### Example

One line:

```ts{2}
/**
 * Retrieve detailed user information including profile and settings.
 * @autoswag GET /users
 */
```

Multiple lines:

```ts{2-6}
/**
 * Retrieve detailed user information including profile and settings.
 *
 * This endpoint returns comprehensive user data.
 * Use GET /users/{id}/profile for a lighter response with
 * just profile information.
 *
 * @autoswag GET /users/{id}
 * @summary Get user details
 * @pathParam {string} id User ID
 * @response {UserDetails} 200 Success
 */
```

## @summary

Defines `summary` field.

### Syntax

```
@summary <text>
```

### Example

```ts{3}
/**
* @autoswag GET /users
* @summary List all users
 */
```

## @externalDocs

Defines `externalDocs` field.

### Syntax

```
@externalDocs <url> [description]
```

### Example

```ts{6}
/**
 * @autoswag POST /webhooks
 * @summary Receive webhook
 * @accept {WebhookPayload}
 * @response 200 Received
 * @externalDocs https://docs.example.com/webhooks Webhook setup guide
 */
```

## @operationId

Defines `operationId` field.

### Syntax

```
@operationId <id>
```

### Example

```ts{3}
/**
 * @autoswag GET /users/{id}
 * @operationId getUserById
 */
```

## @deprecated

Defines `deprecated` field.

### Syntax

```
@deprecated
```

### Example

```ts{4}
/**
 * @autoswag GET /api/v1/users
 * @summary List users
 * @deprecated
 */
```

## @security

Defines `security` field.

If multiple security schemes are specified, **Autoswag** interprets them as an OR condition in the OpenAPI security requirement.

::: info
The security tag just references already defined [`document[n].components`](./configuration#documents-n-components) security schemas.
:::

### Syntax

```
@security <schemeName> [scope1 scope2 ...]
```

- `schemeName` - Name of the pre-defined security scheme
- `scopes` - Optional list of required scopes (for OAuth2/OpenID Connect)

### Example

```ts{4}
/**
 * @autoswag GET /profile
 * @summary Get current user profile
 * @security bearerAuth
 * @response {User} 200 Profile data
 * @response 401 Unauthorized
 */
```

## @server

Defines `servers` field.

### Syntax

```
@server <url> [description]
```

### Example

**Different server for specific endpoints:**

```ts{3}
/**
 * @autoswag POST /upload
 * @server https://cdn.example.com CDN upload endpoint
 * @accept {File} multipart/form-data
 * @response 201 Uploaded
 */
```

**Multiple servers:**

```ts{3-4}
/**
 * @autoswag GET /data
 * @server https://api-primary.example.com Primary datacenter
 * @server https://api-backup.example.com Backup datacenter
 * @response {Data} 200 Success
 */
```
