# Autoswag

[![npm version](https://img.shields.io/npm/v/autoswag.svg)](https://www.npmjs.com/package/autoswag)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

TypeScript-first tool that generates OpenAPI documentation from JSDoc comments and TypeScript types.

## Features

- **OpenAPI 3.0 & 3.1 support** - Choose your version, get correct output
- **TypeScript-first** - Automatically converts TypeScript types to OpenAPI schemas
- **Comprehensive type support** - Interfaces, unions, intersections, generics, enums, records, tuples
- **JSDoc @typedef support** - Works with JavaScript projects too
- **Rich metadata** - Add formats, examples, validation rules via JSDoc tags
- **Component management** - Extract reusable schemas automatically
- **Cross-file resolution** - Import types from anywhere in your project

## Installation

```bash
npm install -D autoswag
```

## Documentation

Full documentation available at [autoswag.vercel.app](https://swagger-autoswag.vercel.app/)

## Roadmap

- [ ] CLI tool
- [ ] Full OpenAPI metadata support
- [ ] Better Zod integration with metadata support
