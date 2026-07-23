# Installation

## Install the Package

Choose your preferred package manager:

::: code-group
```bash [npm]
npm install -D autoswag
```

```bash [pnpm]
pnpm add -D autoswag
```

```bash [yarn]
yarn add -D autoswag
```
:::

## TypeScript Configuration

Autoswag reads your `tsconfig.json` automatically. No special configuration is required:

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
If you use path aliases (like `@/*`), Autoswag will respect them from your tsconfig.json `paths` configuration.
:::

::: tip 
TypeScript configuration used by Autoswag can be overridden in the config. See [compilerOptions](./configuration#compilerOptions)
:::
