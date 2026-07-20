# Configuration

Complete reference for the `generate()` function configuration options.

## Config Interface

```ts
interface Config {
    source: string[]
    baseDoc?: any
    version?: OpenApiVersion
    compilerOptions?: ts.CompilerOptions
    debug?: boolean
}
```

## Options

### `source` (required)

**Type:** `string[]`

Glob patterns for source files to scan for JSDoc comments.

```ts
generate({
    source: ['src/api/**/*.ts'], // Single pattern
})

generate({
    source: [
        'src/api/**/*.ts',
        'src/routes/**/*.ts',
        '!src/**/*.test.ts', // Exclude test files
    ],
})
```

**Glob Pattern Syntax:**

- `**` - Matches any directory recursively
- `*` - Matches any file/directory name
- `!` prefix - Excludes matching files
- `{a,b}` - Matches either a or b

**Examples:**

```ts
// All TypeScript files in src/
;['src/**/*.ts'][
    // Multiple directories
    ('src/api/**/*.ts', 'src/controllers/**/*.ts')
][
    // Include .js files with JSDoc
    'src/**/*.{ts,js}'
][
    // Exclude tests and type definitions
    ('src/**/*.ts', '!**/*.test.ts', '!**/*.d.ts')
]
```

::: tip Performance
Be specific with patterns. Scanning fewer files = faster generation.

**Good:** `['src/api/**/*.ts']` (only API files)  
**Avoid:** `['**/*.ts']` (entire project including node_modules)
:::

### `baseDoc`

**Type:** `any` (OpenAPI document object)  
**Default:** `undefined`

Base OpenAPI document. Use it ONLY to define [OpenAPI Object](https://spec.openapis.org/oas/v3.1.0.html#openapi-object) fields (other than paths) and [Components](https://spec.openapis.org/oas/v3.1.0.html#components-object). If you want to merge existing OpenAPI documentation with generated - do it after the generation.

```ts
generate({
    source: ['src/api/**/*.ts'],
    baseDoc: {
        info: {
            title: 'My API',
            version: '1.0.0',
            description: 'API documentation',
            termsOfService: 'https://example.com/terms',
            contact: {
                name: 'API Support',
                email: 'support@example.com',
                url: 'https://example.com/support',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: 'https://api.example.com/v1',
                description: 'Production',
            },
            {
                url: 'http://localhost:3000',
                description: 'Development',
            },
        ],
        tags: [
            {
                name: 'Users',
                description: 'User management endpoints',
            },
            {
                name: 'Products',
                description: 'Product catalog endpoints',
            },
        ],
        security: [{ bearerAuth: [] }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                apiKey: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key',
                },
            },
        },
    },
})
```

### `version`

**Type:** `OpenApiVersion`  
**Default:** `OpenApiVersion.v31` (OpenAPI 3.1.0)

OpenAPI specification version for output.

```ts
import { OpenApiVersion } from 'swagger-autodoc'

generate({
    source: ['src/api/**/*.ts'],
    version: OpenApiVersion.v31, // OpenAPI 3.1.0 (default)
})

generate({
    source: ['src/api/**/*.ts'],
    version: OpenApiVersion.v30, // OpenAPI 3.0.0
})
```

**Differences Between Versions:**

| Feature             | OpenAPI 3.0        | OpenAPI 3.1                  |
| ------------------- | ------------------ | ---------------------------- |
| **Nullable values** | `nullable: true`   | `type: ["string", "null"]`   |
| **Tuples**          | `oneOf` workaround | `prefixItems` (native)       |
| **JSON Schema**     | Subset             | Full JSON Schema 2020-12     |
| **Type arrays**     | Not supported      | `type: ["string", "number"]` |

::: tip Which Version to Use?

- **Use 3.1** if your tools support it (newer, more powerful)
- **Use 3.0** for compatibility with older tools (Swagger UI < 4.15, etc.)

Most modern tools now support 3.1. When in doubt, try 3.1 first.
:::

### `compilerOptions`

**Type:** `ts.CompilerOptions`  
**Default:** Loaded from `tsconfig.json`

Override TypeScript compiler options. Rarely needed - the generator auto-detects your tsconfig.json.

```ts
import ts from 'typescript'

generate({
    source: ['src/api/**/*.ts'],
    compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        strict: true,
        paths: {
            '@/*': ['./src/*'],
        },
    },
})
```

**When to Use:**

- Testing with different compiler settings
- Overriding path aliases temporarily
- Running without a tsconfig.json (not recommended)

::: warning
If you override `compilerOptions`, you must provide complete options. Partial overrides don't merge with tsconfig.json.
:::

### `debug`

**Type:** `boolean`  
**Default:** `false`

Enable verbose logging for troubleshooting.

```ts
generate({
    source: ['src/api/**/*.ts'],
    debug: true,
})
```
