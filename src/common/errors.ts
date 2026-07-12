import type ts from 'typescript'
import type * as commentParser from 'comment-parser'

export class AutodocError extends Error {
    name: string
    location: string
    constructor(message: string, location: string) {
        super(message)
        this.name = 'AutodocError'
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
    const line = item.number
    const char =
        item.tokens.start.length + item.tokens.delimiter.length + item.tokens.postDelimiter.length
    return `${fileName}:${line}:${char}`
}
