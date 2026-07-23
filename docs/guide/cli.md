# CLI

Complete reference for **Autoswag CLI**.

## Raw execution

Generates an OpenAPI document for each [`documents`](./configuration#documents) item.

```sh
$ npx autoswag
```

## `-i`, `--init`

Creates an example `.autoswagrc.cjs` in you project.

```sh
$ npx autoswag --init
```

## `-c`, `--config`

Specify a custom path to configuration file

```sh
$ npx autoswag --config ./backend/.autoswagrc.cjs
```
