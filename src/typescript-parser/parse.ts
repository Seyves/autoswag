import ts from 'typescript'
import { typeToTree } from '@/typescript-parser/tree'
import * as nodes from '@/typescript-parser/nodes'

interface SourceFileWithLocals extends ts.SourceFile {
    locals?: ts.SymbolTable
}

export function parse(
    program: ts.Program,
    components: Record<string, nodes.Node>,
    fileName: string,
    typeName: string,
) {
    // const program = ts.createProgram([fileName], {
    //     allowJs: true,
    //     checkJs: true,
    //     target: ts.ScriptTarget.ESNext,
    // })
    //
    const checker = program.getTypeChecker()
    const source = program.getSourceFile(fileName) as SourceFileWithLocals

    if (!source) throw new Error('Cannot get source file')

    const rootChildren = source.getChildren()
    const syntaxList = rootChildren[0]!
    const children = syntaxList.getChildren()

    const ctx = {
        checker,
        components,
        stackSize: 0,
    }

    for (const child of children) {
        if (!(ts.isDeclarationStatement(child) && child.name && child.name.text === typeName)) {
            continue
        }
        const type = checker.getTypeAtLocation(child)
        let symbol = type.symbol
        // For type alias declarations, get the symbol from the name node
        // because type.symbol points to the anonymous type literal, not the alias
        if (child.kind === ts.SyntaxKind.TypeAliasDeclaration) {
            const aliasSymbol = checker.getSymbolAtLocation((child as ts.TypeAliasDeclaration).name)
            if (aliasSymbol) {
                symbol = aliasSymbol
            }
        }
        return typeToTree(ctx, [], type, symbol)
    }

    if (source.locals) {
        const symbol = source.locals.get(ts.escapeLeadingUnderscores(typeName))
        if (!symbol) return 
        // Check if it's a TypeAlias (JSDoc typedef)
        if (symbol.flags & ts.SymbolFlags.TypeAlias) {
            const type = checker.getDeclaredTypeOfSymbol(symbol)
            return typeToTree(ctx, [], type, symbol)
        }
        const decl = symbol.declarations?.[0]
        // Check if it's an import
        if (!decl || !ts.isImportSpecifier(decl)) return 
        const importDecl = decl.parent.parent.parent
        const isJSDocImport = !ts.isImportDeclaration(importDecl)

        if (isJSDocImport) {
            // JSDoc @import - use getTypeAtLocation which properly resolves JSDoc imports
            const type = checker.getTypeAtLocation(decl)
            const resSymbol = type.aliasSymbol 
            return typeToTree(ctx, [], type, resSymbol)
        } else {
            // Regular TypeScript import - use getAliasedSymbol
            const resSymbol = checker.getAliasedSymbol(symbol)
            const type = checker.getDeclaredTypeOfSymbol(resSymbol)
            return typeToTree(ctx, [], type, resSymbol)
        }
    }
}
