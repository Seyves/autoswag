import ts from 'typescript'
import { typeToTree } from '@/ts-translater/tree'
import * as nodes from '@/ts-translater/nodes'

interface SourceFileWithLocals extends ts.SourceFile {
    locals?: ts.SymbolTable
}

export function translate(fileName: string) {
    const program = ts.createProgram([fileName], {
        allowJs: true,
        checkJs: true,
        target: ts.ScriptTarget.ESNext,
    })

    const checker = program.getTypeChecker()
    const source = program.getSourceFile(fileName) as SourceFileWithLocals

    if (!source) throw new Error('Cannot get source file')

    const rootChildren = source.getChildren()
    const syntaxList = rootChildren[0]!
    const children = syntaxList.getChildren()

    const tree: nodes.Node[] = []
    const ctx = {
        checker,
        components: {},
        stackSize: 0,
    }

    for (const child of children) {
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
        tree.push(typeToTree(ctx, [], type, symbol))
    }
    if (source.locals) {
        source.locals.forEach((symbol) => {
            // Check if it's a TypeAlias (JSDoc typedef)
            if (symbol.flags & ts.SymbolFlags.TypeAlias) {
                const type = checker.getDeclaredTypeOfSymbol(symbol)
                tree.push(typeToTree(ctx, [], type, symbol))
            }
        })
    }
    return tree
}
