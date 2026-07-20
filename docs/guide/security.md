# Security

Document authentication and authorization requirements with the `@security` tag.

## Overview

The `@security` tag specifies which security schemes are required for an endpoint. Security schemes themselves are defined in `baseDoc.components.securitySchemes`.

## Defining Security Schemes

First, define schemes in `baseDoc`:

```ts
import { generate, OpenApiVersion } from 'autoswag'

const spec = generate({
    source: ['src/api/**/*.ts'],
    baseDoc: {
        info: { title: 'My API', version: '1.0.0' },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                },
                apiKey: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key'
                },
                oauth2: {
                    type: 'oauth2',
                    flows: {
                        authorizationCode: {
                            authorizationUrl: 'https://example.com/oauth/authorize',
                            tokenUrl: 'https://example.com/oauth/token',
                            scopes: {
                                'read:users': 'Read user data',
                                'write:users': 'Modify user data',
                                'admin': 'Administrative access'
                            }
                        }
                    }
                }
            }
        }
    },
    version: OpenApiVersion.v31
})
```

## Using @security

### Bearer Token (JWT)

```ts
/**
 * @autoswag GET /profile
 * @summary Get current user profile
 * @security bearerAuth
 * @response {User} 200 Profile data
 * @response 401 Unauthorized
 */
export async function getProfile(req, res) {
    // Requires: Authorization: Bearer <token>
}
```

### API Key

```ts
/**
 * @autoswag GET /data
 * @summary Get protected data
 * @security apiKey
 * @response {Data} 200 Data
 * @response 401 Invalid API key
 */
export async function getData(req, res) {
    // Requires: X-API-Key: <key>
}
```

### OAuth2 with Scopes

```ts
/**
 * @autoswag GET /users
 * @summary List users
 * @security oauth2 read:users
 * @response {User[]} 200 User list
 * @response 401 Unauthorized
 * @response 403 Insufficient scope
 */
export async function listUsers(req, res) {
    // Requires OAuth2 token with read:users scope
}

/**
 * @autoswag POST /users
 * @summary Create user
 * @security oauth2 write:users admin
 * @accept {CreateUserRequest}
 * @response {User} 201 Created
 * @response 403 Insufficient permissions
 */
export async function createUser(req, res) {
    // Requires OAuth2 token with both write:users AND admin scopes
}
```

### Multiple Security Schemes (OR)

Apply multiple `@security` tags to allow alternative authentication methods:

```ts
/**
 * @autoswag GET /data
 * @summary Get data
 * @security bearerAuth
 * @security apiKey
 * @response {Data} 200 Data
 */
```

This means: "Authenticate with bearerAuth **OR** apiKey" (user can choose either).

### No Security (Public Endpoint)

Omit `@security` for public endpoints:

```ts
/**
 * @autoswag GET /public/info
 * @summary Get public information
 * @response {Info} 200 Public info
 */
export async function getPublicInfo(req, res) {
    // No authentication required
}
```
