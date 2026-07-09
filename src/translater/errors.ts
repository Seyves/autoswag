import type ts from 'typescript'

export class TranslateError extends Error {
    name: string
    location: string
    constructor(message: string, location: string) {
        super(message)
        this.name = 'TranslateError'
        this.location = location
    }
}

export function generateError(error: string, symbol: ts.Symbol) {
    const node = symbol.valueDeclaration || symbol.getDeclarations()?.[0]
    if (!node) return
    const sf = node.getSourceFile()
    const pos = sf.getLineAndCharacterOfPosition(node.getStart())

    const sourceFile = node.getSourceFile()
    const fullError = `${error} on symbol ${symbol.name || 'unknown'}`
    const location = `${sourceFile.fileName}:${pos.line}:${pos.character}`

    return new TranslateError(fullError, location)
}
