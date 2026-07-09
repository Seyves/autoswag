import type ts from 'typescript'
import * as utils from '@/translater/utils'
import { generateError } from './errors'

export type Tags = {
    description?: string
    example?: any
    component?: string
    format?: string
    pattern?: string
    minimum?: number
    maximum?: number
    multipleOf?: number
}

/**
 * @param symbol Symbol on which the tags are declared
 * @param parent Object declaration symbol.
 * For properties should be the object that declares these properties.
 * Should be missing on anonymous objects
 */
export function parseSymbolJSDoc(
    checker: ts.TypeChecker,
    symbol: ts.Symbol,
    parent?: ts.Symbol,
): Tags {
    const docs = symbol.getDocumentationComment(checker)
    const docText = docs.map((d) => d.text).join(' ')

    if (parent && utils.isJSDocTypedef(parent)) {
        const { description, metadata } = parsePropertyMetadata(docText)
        if (description) {
            return { description, ...parseRawTags(symbol, metadata) }
        } else {
            return parseRawTags(symbol, metadata)
        }
    } else {
        const description = docText.replace(/\n/g, ' ').trim()
        const jsDocTags = symbol.getJsDocTags()
        const rawTags: Record<string, string> = {}
        for (const tag of jsDocTags) {
            if (!tag.text || !tag.text.length) continue
            rawTags[tag.name] = tag.text
                .map((t) => t.text)
                .join(' ')
                .replace(/\n/g, ' ')
                .trim()
        }
        if (description) {
            return { description, ...parseRawTags(symbol, rawTags) }
        }
        return parseRawTags(symbol, rawTags)
    }
}

function parsePropertyMetadata(documentation: string): {
    description?: string
    metadata: Record<string, string>
} {
    const lines = documentation
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l)

    let description = ''
    const metadata: Record<string, string> = {}

    for (const line of lines) {
        // Match metadata lines: - key: value
        const metaMatch = line.match(/^-\s*(\w+):\s*(.+)$/)

        if (metaMatch) {
            const [_, key, value] = metaMatch as [string, string, string]
            metadata[key] = value.trim()
        } else {
            description = line
        }
    }

    return { description, metadata }
}

function parseRawTags(symbol: ts.Symbol, rawTags: Record<string, string>): Tags {
    const tags: Tags = {}

    for (const [key, value] of Object.entries(rawTags)) {
        switch (key) {
            case 'example':
                try {
                    tags.example = JSON.parse(value)
                } catch (e: any) {
                    throw generateError('Cannot parse tag @example (should be valid JSON)', symbol)
                }
                break
            case 'minimum':
                tags.minimum = parseInt(value)
                break
            case 'maximum':
                tags.maximum = parseInt(value)
                break
            case 'format':
                tags.format = value
                break
            case 'component':
                tags.component = value
                break
        }
    }

    return tags
}
