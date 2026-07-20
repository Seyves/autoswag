# Security

Document authentication and authorization requirements with the `@security` tag.

## Overview

The `@security` tag specifies which security schemes are required for an endpoint. Security schemes themselves are defined in `baseDoc.components.securitySchemes`.

## Defining Security Schemes

First, define schemes in `baseDoc`:

```ts
import { generate, OpenApiVersion } from 'swagger-autodoc'

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
 * @autodoc GET /profile
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
 * @autodoc GET /data
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
 * @autodoc GET /users
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
 * @autodoc POST /users
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
 * @autodoc GET /data
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
 * @autodoc GET /public/info
 * @summary Get public information
 * @response {Info} 200 Public info
 */
export async function getPublicInfo(req, res) {
    // No authentication required
}
```

## Security Scheme Types

### HTTP Authentication

#### Bearer Token

```ts
// In baseDoc
components: {
    securitySchemes: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'  // Optional description
        }
    }
}

// Usage
/**
 * @autodoc GET /protected
 * @security bearerAuth
 */
```

**HTTP Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Basic Authentication

```ts
// In baseDoc
components: {
    securitySchemes: {
        basicAuth: {
            type: 'http',
            scheme: 'basic'
        }
    }
}

// Usage
/**
 * @autodoc GET /admin
 * @security basicAuth
 */
```

**HTTP Header:**
```
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

### API Key

#### Header

```ts
// In baseDoc
components: {
    securitySchemes: {
        apiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key'
        }
    }
}

// Usage
/**
 * @autodoc GET /data
 * @security apiKey
 */
```

**HTTP Header:**
```
X-API-Key: abc123xyz789
```

#### Query Parameter

```ts
// In baseDoc
components: {
    securitySchemes: {
        apiKeyQuery: {
            type: 'apiKey',
            in: 'query',
            name: 'api_key'
        }
    }
}

// Usage
/**
 * @autodoc GET /data
 * @security apiKeyQuery
 */
```

**URL:**
```
/data?api_key=abc123xyz789
```

#### Cookie

```ts
// In baseDoc
components: {
    securitySchemes: {
        cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'sessionId'
        }
    }
}

// Usage
/**
 * @autodoc GET /profile
 * @security cookieAuth
 */
```

**HTTP Header:**
```
Cookie: sessionId=abc123xyz789
```

### OAuth 2.0

#### Authorization Code Flow

```ts
// In baseDoc
components: {
    securitySchemes: {
        oauth2: {
            type: 'oauth2',
            flows: {
                authorizationCode: {
                    authorizationUrl: 'https://example.com/oauth/authorize',
                    tokenUrl: 'https://example.com/oauth/token',
                    refreshUrl: 'https://example.com/oauth/refresh',
                    scopes: {
                        'read:data': 'Read access to data',
                        'write:data': 'Write access to data',
                        'admin': 'Admin access'
                    }
                }
            }
        }
    }
}

// Usage
/**
 * @autodoc GET /data
 * @security oauth2 read:data
 */

/**
 * @autodoc POST /data
 * @security oauth2 write:data
 */

/**
 * @autodoc DELETE /data
 * @security oauth2 admin
 */
```

#### Client Credentials Flow

```ts
// In baseDoc
components: {
    securitySchemes: {
        oauth2ClientCredentials: {
            type: 'oauth2',
            flows: {
                clientCredentials: {
                    tokenUrl: 'https://example.com/oauth/token',
                    scopes: {
                        'api:read': 'Read API access',
                        'api:write': 'Write API access'
                    }
                }
            }
        }
    }
}
```

#### Implicit Flow

```ts
// In baseDoc
components: {
    securitySchemes: {
        oauth2Implicit: {
            type: 'oauth2',
            flows: {
                implicit: {
                    authorizationUrl: 'https://example.com/oauth/authorize',
                    scopes: {
                        'read': 'Read access',
                        'write': 'Write access'
                    }
                }
            }
        }
    }
}
```

#### Password Flow

```ts
// In baseDoc
components: {
    securitySchemes: {
        oauth2Password: {
            type: 'oauth2',
            flows: {
                password: {
                    tokenUrl: 'https://example.com/oauth/token',
                    scopes: {
                        'user': 'User access'
                    }
                }
            }
        }
    }
}
```

### OpenID Connect

```ts
// In baseDoc
components: {
    securitySchemes: {
        openId: {
            type: 'openIdConnect',
            openIdConnectUrl: 'https://example.com/.well-known/openid-configuration'
        }
    }
}

// Usage
/**
 * @autodoc GET /user
 * @security openId profile email
 */
```

## Complete Examples

### REST API with JWT

```ts
// scripts/generate-docs.ts
import { generate, OpenApiVersion } from 'swagger-autodoc'

const spec = generate({
    source: ['src/api/**/*.ts'],
    baseDoc: {
        info: { title: 'My API', version: '1.0.0' },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token from /auth/login'
                }
            }
        },
        security: [{ bearerAuth: [] }]  // Apply to all endpoints by default
    },
    version: OpenApiVersion.v31
})

// src/api/auth.ts
/**
 * @autodoc POST /auth/login
 * @summary Login with credentials
 * @tag Authentication
 * @accept {LoginRequest}
 * @response {AuthToken} 200 Login successful
 * @response 401 Invalid credentials
 */
export async function login(req, res) {}

/**
 * @autodoc POST /auth/logout
 * @summary Logout current session
 * @tag Authentication
 * @security bearerAuth
 * @response 204 Logged out
 */
export async function logout(req, res) {}

// src/api/users.ts
/**
 * @autodoc GET /users
 * @summary List all users
 * @tag Users
 * @security bearerAuth
 * @response {User[]} 200 Users
 */
export async function listUsers(req, res) {}
```

### Multi-Scheme API

```ts
// Allow both JWT and API key
const spec = generate({
    baseDoc: {
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer'
                },
                apiKey: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key'
                }
            }
        }
    }
})

/**
 * @autodoc GET /data
 * @security bearerAuth
 * @security apiKey
 * @response {Data} 200 Data
 */
// User can authenticate with EITHER bearer token OR API key
```

### OAuth2 with Fine-Grained Permissions

```ts
const spec = generate({
    baseDoc: {
        components: {
            securitySchemes: {
                oauth2: {
                    type: 'oauth2',
                    flows: {
                        authorizationCode: {
                            authorizationUrl: 'https://auth.example.com/authorize',
                            tokenUrl: 'https://auth.example.com/token',
                            scopes: {
                                'read:profile': 'Read user profile',
                                'write:profile': 'Update user profile',
                                'read:posts': 'Read posts',
                                'write:posts': 'Create and edit posts',
                                'delete:posts': 'Delete posts',
                                'admin': 'Full administrative access'
                            }
                        }
                    }
                }
            }
        }
    }
})

/**
 * @autodoc GET /profile
 * @security oauth2 read:profile
 */

/**
 * @autodoc PATCH /profile
 * @security oauth2 write:profile
 */

/**
 * @autodoc GET /posts
 * @security oauth2 read:posts
 */

/**
 * @autodoc POST /posts
 * @security oauth2 write:posts
 */

/**
 * @autodoc DELETE /posts/{id}
 * @security oauth2 delete:posts
 * @pathParam {string} id Post ID
 */

/**
 * @autodoc DELETE /users/{id}
 * @security oauth2 admin
 * @pathParam {string} id User ID
 */
```

## Global vs Per-Endpoint Security

### Global Security (Default)

Apply security to all endpoints by default:

```ts
const spec = generate({
    baseDoc: {
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer' }
            }
        },
        security: [{ bearerAuth: [] }]  // Applied globally
    }
})

// All endpoints require bearerAuth unless explicitly overridden
```

### Per-Endpoint Override

```ts
/**
 * @autodoc GET /public
 * @summary Public endpoint
 * No @security tag = uses global security
 */

// To make an endpoint public when global security is set,
// define it in baseDoc.paths or use a separate generation
```

::: tip
For mixed public/private APIs, it's easier to NOT set global security and add `@security` tags to each protected endpoint explicitly.
:::
