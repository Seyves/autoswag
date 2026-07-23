# Configuration

Complete reference for `.autoswagrc.cjs`.

## `version`

**Required:** `false`  
**Type:** `OpenApiVersion`  
**Default:** `OpenApiVersion.v31`

Determines generated OpenAPI version.

::: warning
Do not specify version in [`root`](#documents-n-root). It will not affect the generation, but it will make your configuration more confusing.
:::

Example:

```js
version: OpenApiVersion.v30
```

## `compilerOptions`

**Required:** `false`  
**Type:** `ts.CompilerOptions`  
**Default:** Loaded from `tsconfig.json`

Override TypeScript compiler options. If you override `compilerOptions`, you must provide complete options. Partial overrides don't merge with tsconfig.json.

::: warning
Autoswagger is immature for now, some TypeScript options may break the generation, if you encounter them, please [create an issue](https://github.com/Seyves/autoswag/issues)
:::

Example:

```js
compilerOptions: {
  moduleDetection: ts.ModuleDetectionKind.Force,
  target: ts.ScriptTarget.ESNext,
  allowJs: true,
  checkJs: true,
}
```

## `format`

**Required:** `false`  
**Type:** `OpenApiFormat`  
**Default:** `OpenApiFormat.json`

Determines the format of generated OpenAPI document.

```js
format: OpenApiFormat.yaml
```

::: warning
`yaml` npm package is required for `OpenApiFormat.yaml` option.
```sh
$ npm install -D yaml
```
:::

## `tabWidth`

**Required:** `false`  
**Type:** `number`  
**Default:** `2`

Changes tab width of the generated json.

Example:

```js
tabWidth: 4
```

## `debug`

**Required:** `false`  
**Type:** `boolean`  
**Default:** `false`

Enable verbose logging.

Example:

```js
debug: true
```

## `documents`

**Required:** `true`  
**Type:** `DocumentConfig[]`

Configuration for each of your OpenAPI documents.

## `documents[n].source`

**Required:** `true`  
**Type:** `string[]`

Glob patterns that Autoswag uses to locate your source files. You only need to include files containing JSDoc endpoint definitions. Referenced types will still be resolved as long as they are imported somewhere in your source code.

::: tip Performance
Be specific with patterns. Scanning fewer files = faster generation.
:::

Example:

```js
source: ['src/**/*.ts', '!**/*.test.ts', '!**/*.d.ts']
```

## `documents[n].output`

**Required:** `true`  
**Type:** `string`

Path for generated OpenAPI document.

```js
output: 'openapi.json'
```

## `documents[n].root`

**Required:** `false`  
**Type:** `any` (OpenAPI document object)  
**Default:** `undefined`

Root-level OpenAPI document information.

::: warning
This field is optional, however without `info.title` and `info.version` your OpenAPI document will be invalid.
:::

```js
root: {
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
},
```

## `documents[n].components`

**Required:** `false`  
**Type:** `any` (OpenAPI components object)  
**Default:** `undefined`

Manually defined OpenAPI components.
