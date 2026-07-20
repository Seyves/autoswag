import ts from 'typescript'
import { typeToTree, type Context } from '@/typescript-parser/tree'
import * as nodes from '@/typescript-parser/nodes'
import { AutodocError } from '@/common/errors'

interface SourceFileWithLocals extends ts.SourceFile {
    locals?: ts.SymbolTable
}

export function parse(
    program: ts.Program,
    components: Record<string, nodes.Node>,
    fileName: string,
    typeName: string,
    debug?: boolean,
) {
    const checker = program.getTypeChecker()
    const source = program.getSourceFile(fileName) as SourceFileWithLocals

    if (!source) throw new Error(`Cannot find source file ${fileName}`)

    const rootChildren = source.getChildren()
    const syntaxList = rootChildren[0]!
    const children = syntaxList.getChildren()

    const ctx: Context = {
        checker,
        components,
        debug: Boolean(debug),
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

        const decl = symbol.declarations?.[0]
        if (!decl) return

        // Check if it's JSDoc @typedef
        if (ts.isJSDocTypedefTag(decl)) {
            const type = checker.getTypeAtLocation(decl)
            return typeToTree(ctx, [], type, type.aliasSymbol)
        }
        // Check if it's an import
        if (!ts.isImportSpecifier(decl)) return

        if (ts.isImportDeclaration(decl.parent.parent.parent)) {
            // Regular TypeScript import - use getAliasedSymbol
            const resSymbol = checker.getAliasedSymbol(symbol)
            const type = checker.getDeclaredTypeOfSymbol(resSymbol)

            return typeToTree(ctx, [], type, resSymbol)
        } else {
            // JSDoc @import - use getTypeAtLocation which properly resolves JSDoc imports
            const type = checker.getTypeAtLocation(decl)
            return typeToTree(ctx, [], type, type.aliasSymbol)
        }
    }
}

/**
 * Function takes a typeExpression and return a node for it.
 * The main usecase is to parse type expressions specified in JSDoc itself:
 * example: @response {Record<string, User>} 200 Ok
 */
export function parseTypeExpression(
    program: ts.Program,
    components: Record<string, nodes.Node>,
    fileName: string,
    typeExpression: string,
    position: [number, number],
    debug?: boolean,
): nodes.Node | undefined {
    const sourceFile = program.getSourceFile(fileName)
    if (!sourceFile) {
        throw new Error(`Source file not found: ${fileName}`)
    }
    const originalText = sourceFile.getFullText()
    const newText = `${originalText}\ntype __AutodocInlineType = ${typeExpression}`

    const updatedSource = ts.createSourceFile(fileName, newText, sourceFile.languageVersion, true)

    const oldOptions = program.getCompilerOptions()
    const host = ts.createCompilerHost(oldOptions)
    const originalGetSourceFile = host.getSourceFile

    // Override to return our modified source for the target file
    host.getSourceFile = (fname, languageVersion, onError, shouldCreateNewSourceFile) => {
        // Return our modified source for the target file
        if (fname === fileName) {
            return updatedSource
        }
        // For all other files, reuse from the existing program (no re-reading/re-parsing)
        const cachedSource = program.getSourceFile(fname)
        if (cachedSource) {
            return cachedSource
        }
        // Fallback: read from disk (for files not yet in the program)
        return originalGetSourceFile.call(
            host,
            fname,
            languageVersion,
            onError,
            shouldCreateNewSourceFile,
        )
    }

    // Create new program with incremental reuse
    // The 4th argument (oldProgram) enables TypeScript to reuse:
    // - Cached source files (from our override)
    // - Type information for unchanged files
    // - Module resolution results
    const newProgram = ts.createProgram(program.getRootFileNames(), oldOptions, host, program)
    const newChecker = newProgram.getTypeChecker()
    const newSourceFile = newProgram.getSourceFile(fileName)
    if (!newSourceFile) {
        throw new Error(`Updated source file not found: ${fileName}`)
    }

    const typeAlias = newSourceFile.statements[newSourceFile.statements.length - 1]
    if (!typeAlias || !ts.isTypeAliasDeclaration(typeAlias)) {
        throw new AutodocError(
            `Invalid type expression: '${typeExpression}'`,
            `${fileName}:${position.join(':')}`,
        )
    }
    const diagnostics = ts.getPreEmitDiagnostics(newProgram)
    const foundDiagnostic = diagnostics.find((d) => {
        return (
            d.file === newSourceFile &&
            d.start !== undefined &&
            d.length !== undefined &&
            d.start >= typeAlias.getStart() &&
            d.start + d.length <= typeAlias.getEnd()
        )
    })

    if (foundDiagnostic) {
        const msg = foundDiagnostic.messageText.toString()
        const tsError = msg[msg.length - 1] === '.' ? msg.slice(0, msg.length - 1) : msg
        throw new AutodocError(
            `Invalid type expression: '${typeExpression}' (${tsError})`,
            `${fileName}:${position.join(':')}`,
        )
    }
    const resolvedType = newChecker.getTypeAtLocation(typeAlias.type)

    const ctx: Context = {
        checker: newChecker,
        components,
        debug: Boolean(debug),
    }

    return typeToTree(ctx, [], resolvedType)
}
