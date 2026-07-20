# Installation

## Install the Package

Choose your preferred package manager:

::: code-group
```bash [npm]
npm install -D swagger-autodoc
```

```bash [pnpm]
pnpm add -D swagger-autodoc
```

```bash [yarn]
yarn add -D swagger-autodoc
```
:::

## TypeScript Configuration

Swagger Autodoc reads your `tsconfig.json` automatically. No special configuration is required:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

::: warning Important
If you use path aliases (like `@/*`), Swagger Autodoc will respect them from your tsconfig.json `paths` configuration.
:::

::: tip 
TypeScript configuration used by Swagger Autodoc can be overridden in the config. See [compilerOptions](./configuration#compilerOptions)
:::

## Next Steps

Now that installation is complete:

1. **[Quick Start →](./quick-start)** - Generate your first OpenAPI document
2. **[Configuration →](./configuration)** - Learn about all configuration options

Or jump straight to the **[JSDoc Tags reference →](./tags-overview)** to learn how to document endpoints.
