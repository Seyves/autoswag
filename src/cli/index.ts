#!/usr/bin/env node

import * as config from '@/config'
import path from 'path'
import fs from 'fs'
import * as autoswag from '..'
import { writeFile } from 'fs/promises'

const initConfig = `// @ts-check
const autoswag = require('autoswag')

/** @type {autoswag.Config} */
const config = {
  version: autoswag.OpenApiVersion.v31,
  documents: [
    {
      source: ['src/api/*.ts'],
      output: 'openapi.json',
      root: {
        info: {
          version: '1.0.0',
          title: 'Your title here',
          description: 'Your description here',
        },
      },
    },
  ],
}

module.exports = config`

interface Flag {
    short: string
    full: string
    description: string
    bool?: boolean
}

const flags: Record<string, Flag> = {
    help: {
        short: '-h',
        full: '--help',
        description: 'Show help',
        bool: true,
    },
    init: {
        short: '-i',
        full: '--init',
        description: 'Create init .autoswagrc.cjs file',
        bool: true,
    },
    config: {
        short: '-c',
        full: '--config',
        description: 'Specify config file, looking for .autoswagrc.cjs by default',
    },
}

async function execute() {
    let parsed: ParsedArgs
    try {
        parsed = parseFlags(process.argv.slice(2))
    } catch (e) {
        console.error('\x1b[31m%s\x1b[0m', (e as Error).message)
        process.exit(1)
    }

    if (parsed.help) {
        printHelp()
        return
    }

    if (parsed.init) {
        if (fs.existsSync(config.defaultFile)) {
            console.log('\x1b[32m%s\x1b[0m', `Your project already contains ${config.defaultFile}!`)
            return
        }
        await writeFile(config.defaultFile, initConfig)
        console.log('\x1b[32m%s\x1b[0m', `${config.defaultFile} successfully created!`)
        return
    }

    const cwd = process.cwd()

    let cfg: config.Config
    try {
        const cfgPath = path.resolve(cwd, parsed.config)
        if (!fs.existsSync(cfgPath)) {
            const hint =
                'Generate init config with --init or provide a different path with --config.'
            throw new Error(`not found at ${cfgPath}.\n${hint}`)
        }
        const module = await import(cfgPath)
        if (!module.default) {
            throw new Error('module does not have a default import')
        }
        cfg = config.parse(module.default)
    } catch (e) {
        console.error('\x1b[31m%s\x1b[0m', `Error parsing config file: ${(e as Error).message}`)
        process.exit(1)
    }

    const generator = new autoswag.Generator(cfg)

    const documents = cfg.documents.map((docCfg) => {
        let document
        try {
            document = generator.build(docCfg.source, docCfg.root, docCfg.components)
        } catch (e) {
            if (e instanceof autoswag.AutoswagError) {
                console.error('\x1b[31m%s\x1b[0m', `Syntax error: ${e.message}`)
            } else {
                console.error('\x1b[31m%s\x1b[0m', `Error parsing source: ${(e as Error).message}`)
            }
            process.exit(1)
        }
        return document
    })

    const tabWidth = cfg.tabWidth ?? 2
    const format = cfg.format ?? config.OpenApiFormat.json

    let stringifier: Stringifier
    switch (format) {
        case config.OpenApiFormat.yaml:
            stringifier = new YamlStringifier(await import('yaml'), tabWidth)
            break
        case config.OpenApiFormat.json:
            stringifier = new JsonStringifier(tabWidth)
            break
    }

    await Promise.all(
        documents.map((doc, i) => {
            return writeFile(cfg.documents[i]!.output!, stringifier.stringify(doc))
        }),
    )

    console.log('\x1b[32m%s\x1b[0m', `OpenAPI successefully generated!`)
    process.exit(0)
}

abstract class Stringifier {
    protected tabWidth: number
    constructor(tabWidth: number) {
        this.tabWidth = tabWidth
    }
    abstract stringify(input: any): string
}

class YamlStringifier extends Stringifier {
    private yaml
    constructor(module: typeof import('yaml'), tabWidth: number) {
        super(tabWidth)
        this.yaml = module
    }
    stringify(input: any) {
        return this.yaml.stringify(input, { indent: this.tabWidth })
    }
}

class JsonStringifier extends Stringifier {
    constructor(tabWidth: number) {
        super(tabWidth)
    }
    stringify(input: any) {
        return JSON.stringify(input, null, this.tabWidth)
    }
}

interface ParsedArgs {
    help: boolean
    init: boolean
    config: string
}

function parseFlags(args: string[]) {
    const parsed: ParsedArgs = {
        help: false,
        init: false,
        config: config.defaultFile,
    }

    I: for (let i = 0; i < args.length; i++) {
        const arg = args[i]!

        for (let name in flags) {
            const flag = flags[name]!
            if (arg !== flag.short && arg !== flag.full) {
                continue
            }
            if (flag.bool) {
                //@ts-ignore
                parsed[name] = true
            } else if (i < args.length - 1) {
                //@ts-ignore
                parsed[name] = args[i + 1]
                i++
            } else {
                throw new Error(`No value provided for option: ${arg}`)
            }
            continue I
        }
        throw new Error(`Unknown option: ${arg}`)
    }
    return parsed
}

function printHelp() {
    const header = 'Usage: autoswag [...options]'

    const longest = Object.values(flags).reduce((acc, flag) => {
        const len = flag.full.length + flag.short.length + 2
        if (len > acc) return len
        return acc
    }, 0)

    const flagDocs: string[] = []
    for (const name in flags) {
        const flag = flags[name]!
        const prefix = `${flag.short}, ${flag.full}`.padEnd(longest, ' ')
        flagDocs.push(`${prefix} ${flag.description}`)
    }
    console.log(`${header}\n${flagDocs.join('\n')}`)
}

execute()
