import type ts from 'typescript'
import type * as commentParser from 'comment-parser'

export class AutoswagError extends Error {
    name: string
    location: string
    constructor(message: string, location: string) {
        super(`${message} at ${location}.`)
        this.name = 'AutoswagError'
        this.location = location
    }
}

export function getLocationFromSymbol(symbol: ts.Symbol) {
    const node = symbol.valueDeclaration || symbol.getDeclarations()?.[0]
    if (!node) return 'unknown_location'
    const sf = node.getSourceFile()
    const pos = sf.getLineAndCharacterOfPosition(node.getStart())
    const sourceFile = node.getSourceFile()
    return `${sourceFile.fileName}:${pos.line}:${pos.character}`
}

export function getLocationFromLine(fileName: string, source: commentParser.Line[]) {
    const item = source[0]
    if (!item) return fileName

    const position = getTagPositionFromLine(source)
    if (!position) return fileName

    return `${fileName}:${position[0]}:${position[1]}`
}

export function getTagPositionFromLine(source: commentParser.Line[]): [number, number] {
    const item = source[0]
    if (!item) return [0, 0]

    const line = item.number + 1
    const char =
        item.tokens.start.length +
        item.tokens.delimiter.length +
        item.tokens.postDelimiter.length +
        1
    return [line, char]
}

export function getTypePositionFromLine(source: commentParser.Line[]): [number, number] {
    const item = source[0]
    if (!item) return [0, 0]

    const line = item.number + 1
    const char =
        item.tokens.start.length +
        item.tokens.delimiter.length +
        item.tokens.postDelimiter.length +
        item.tokens.tag.length +
        item.tokens.postTag.length +
        2
    return [line, char]
}
