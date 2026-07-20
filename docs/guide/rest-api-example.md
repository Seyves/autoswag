# REST API Example

Complete example of a RESTful API with CRUD operations.

## Project Structure

```
src/
├── types/
│   ├── user.ts
│   └── common.ts
├── api/
│   ├── users.ts
│   └── auth.ts
└── index.ts

scripts/
└── generate-docs.ts

openapi.json
```

::: code-group

```ts [types/common.ts]
/**
 * @component ErrorResponse
 */
export interface ErrorResponse {
    error: string
    message: string
    /** @format date-time */
    timestamp: string
}

/**
 * @component PaginationMeta
 */
export interface PaginationMeta {
    page: number
    pageSize: number
    total: number
    hasMore: boolean
}
```

```ts [types/user.ts]
/**
 * @component User
 */
export interface User {
    /** @format uuid */
    id: string
    
    name: string
    
    /** @format email */
    email: string
    
    role: 'user' | 'admin'
    
    /** @format date-time */
    createdAt: string
    
    /** @format date-time */
    updatedAt: string
}

export interface CreateUserRequest {
    name: string
    
    /** @format email */
    email: string
    
    /** @format password */
    password: string
}

export interface UpdateUserRequest {
    name?: string
    
    /** @format email */
    email?: string
}

/**
 * @component UserListResponse
 */
export interface UserListResponse {
    users: User[]
    meta: PaginationMeta
}
```

```ts [api/auth.ts]
import type { User, ErrorResponse } from '../types'

interface LoginRequest {
    /** @format email */
    email: string
    
    /** @format password */
    password: string
}

interface AuthToken {
    token: string
    
    /** @format date-time */
    expiresAt: string
    
    user: User
}

/**
 * Authenticate with email and password
 * 
 * @autodoc POST /auth/login
 * @operationId login
 * @summary User login
 * @tag Authentication
 * 
 * @accept {LoginRequest} application/json
 * 
 * @response {AuthToken} 200.application/json Login successful
 * @response {ErrorResponse} 401.application/json Invalid credentials
 * @response {ErrorResponse} 400.application/json Missing required fields
 */
export async function login(req, res) {
    // Implementation
}

/**
 * End current session
 * 
 * @autodoc POST /auth/logout
 * @operationId logout
 * @summary User logout
 * @tag Authentication
 * 
 * @security bearerAuth
 * 
 * @response 204 Logout successful
 * @response {ErrorResponse} 401.application/json Unauthorized
 */
export async function logout(req, res) {
    // Implementation
}
```

```ts [api/users.ts]
import type {
    User,
    CreateUserRequest,
    UpdateUserRequest,
    UserListResponse,
    ErrorResponse
} from '../types'

/**
 * Create a new user account
 * 
 * @autodoc POST /users
 * @operationId createUser
 * @summary Create user
 * @tag Users
 * 
 * @security bearerAuth
 * 
 * @accept {CreateUserRequest} application/json
 * 
 * @response {User} 201.application/json User created
 * @response {ErrorResponse} 400.application/json Invalid input
 * @response {ErrorResponse} 401.application/json Unauthorized
 * @response {ErrorResponse} 409.application/json Email already exists
 */
export async function createUser(req, res) {
    // Implementation
}

/**
 * Retrieve user by ID
 * 
 * @autodoc GET /users/{id}
 * @operationId getUserById
 * @summary Get user
 * @tag Users
 * 
 * @security bearerAuth
 * 
 * @pathParam {string} id User ID
 * 
 * @response {User} 200.application/json User found
 * @response {ErrorResponse} 401.application/json Unauthorized
 * @response {ErrorResponse} 404.application/json User not found
 */
export async function getUserById(req, res) {
    // Implementation
}

/**
 * List all users with pagination
 * 
 * @autodoc GET /users
 * @operationId listUsers
 * @summary List users
 * @tag Users
 * 
 * @security bearerAuth
 * 
 * @queryParam {number} [page=1] Page number
 * @queryParam {number} [pageSize=20] Items per page
 * @queryParam {string} [search] Search by name or email
 * @queryParam {string} [role] Filter by role
 * 
 * @response {UserListResponse} 200.application/json User list
 * @response {ErrorResponse} 401.application/json Unauthorized
 */
export async function listUsers(req, res) {
    // Implementation
}

/**
 * Update user information
 * 
 * @autodoc PATCH /users/{id}
 * @operationId updateUser
 * @summary Update user
 * @tag Users
 * 
 * @security bearerAuth
 * 
 * @pathParam {string} id User ID
 * 
 * @accept {UpdateUserRequest} application/json
 * 
 * @response {User} 200.application/json User updated
 * @response {ErrorResponse} 400.application/json Invalid input
 * @response {ErrorResponse} 401.application/json Unauthorized
 * @response {ErrorResponse} 403.application/json Forbidden
 * @response {ErrorResponse} 404.application/json User not found
 */
export async function updateUser(req, res) {
    // Implementation
}

/**
 * Delete user account
 * 
 * @autodoc DELETE /users/{id}
 * @operationId deleteUser
 * @summary Delete user
 * @tag Users
 * 
 * @security bearerAuth
 * 
 * @pathParam {string} id User ID
 * 
 * @response 204 User deleted
 * @response {ErrorResponse} 401.application/json Unauthorized
 * @response {ErrorResponse} 403.application/json Forbidden
 * @response {ErrorResponse} 404.application/json User not found
 */
export async function deleteUser(req, res) {
    // Implementation
}
```

:::

```ts [generate-docs.ts]
import { generate, OpenApiVersion } from 'swagger-autodoc'
import { writeFileSync } from 'fs'

const spec = generate({
    source: ['src/api/**/*.ts'],
    baseDoc: {
        info: {
            title: 'User Management API',
            version: '1.0.0',
            description: 'RESTful API for user management',
            contact: {
                name: 'API Support',
                email: 'api@example.com'
            }
        },
        servers: [
            {
                url: 'https://api.example.com/v1',
                description: 'Production'
            },
            {
                url: 'http://localhost:3000/v1',
                description: 'Development'
            }
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication endpoints'
            },
            {
                name: 'Users',
                description: 'User management operations'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token from /auth/login'
                }
            }
        }
    },
    version: OpenApiVersion.v31
})

writeFileSync('./openapi.json', JSON.stringify(spec, null, 2))
console.log('✓ Generated openapi.json')
```

## Run Generator

```bash
npx tsx scripts/generate-docs.ts
```

## View Documentation

```bash
npx @redocly/cli preview-docs openapi.json
```

Or deploy to GitHub Pages, use Swagger UI, etc.
