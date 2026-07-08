interface SourceFileWithLocals extends ts.SourceFile {
    locals?: ts.SymbolTable
}

import ts from 'typescript'

export enum NodeType {
    Undefined,
    Null,
    String,
    Number,
    Boolean,
    Object,
    Array,
    Tuple,
    Union,
    Enum,
    Record,
    Unknown,
}

interface BaseNode {
    type: NodeType
    info?: JSDocInfo
}

type JSDocInfo = {
    description?: string
    example?: any
    format?: string
    minimum?: number
    maximum?: number
}

export interface PrimitiveNode extends BaseNode {}
export interface ObjectNode extends BaseNode {
    type: NodeType.Object
    properties: Record<string, Node>
    required: string[]
}
export interface UnionNode extends BaseNode {
    type: NodeType.Union
    oneOf: Node[]
}
export interface TupleNode extends BaseNode {
    type: NodeType.Tuple
    items: Node[]
}
export interface EnumNode extends BaseNode {
    type: NodeType.Enum
    values: string[] | number[]
}
export interface RecordNode extends BaseNode {
    type: NodeType.Record
    items: Node
}
export interface ArrayNode extends BaseNode {
    type: NodeType.Array
    items: Node
}
export interface UnknownNode extends BaseNode {}
export type Node =
    | PrimitiveNode
    | ObjectNode
    | TupleNode
    | UnionNode
    | EnumNode
    | RecordNode
    | ArrayNode
    | UnknownNode

class TranslateError extends Error {
    name: string
    location: string
    constructor(message: string, location: string) {
        super(message)
        this.name = 'TranslateError'
        this.location = location
    }
}

export function parse(fileName: string) {
    const program = ts.createProgram([fileName], {
        allowJs: true,
        checkJs: true,
        target: ts.ScriptTarget.ESNext,
    })
    const checker = program.getTypeChecker()
    const source = program.getSourceFile(fileName)! as SourceFileWithLocals

    const rootChildren = source.getChildren()
    const syntaxList = rootChildren[0]!
    const children = syntaxList.getChildren()
    const tree: Node[] = []
    for (const child of children) {
        const type = checker.getTypeAtLocation(child)
        tree.push(typeToTree(type, type.symbol, checker))
    }
    if (source.locals) {
        source.locals.forEach((symbol) => {
            // Check if it's a TypeAlias (JSDoc typedef)
            if (symbol.flags & ts.SymbolFlags.TypeAlias) {
                const type = checker.getDeclaredTypeOfSymbol(symbol)
                tree.push(typeToTree(type, symbol, checker))
            }
        })
    }
    return tree
}

function generateError(error: string, symbol: ts.Symbol) {
    const node = symbol.valueDeclaration || symbol.getDeclarations()?.[0]
    if (!node) return
    const sf = node.getSourceFile()
    const pos = sf.getLineAndCharacterOfPosition(node.getStart())

    const sourceFile = node.getSourceFile()
    const fullError = `${error} on symbol ${symbol.name || 'unknown'}`
    const location = `${sourceFile.fileName}:${pos.line}:${pos.character}`

    return new TranslateError(fullError, location)
}

function typeToTree(type: ts.Type, symbol: ts.Symbol | undefined, checker: ts.TypeChecker): Node {
    let node: Node = { type: NodeType.Unknown }

    if (hasSomeFlags(type, [ts.TypeFlags.Undefined])) {
        node = { type: NodeType.Undefined }
    } else if (hasSomeFlags(type, [ts.TypeFlags.Null])) {
        node = { type: NodeType.Null }
    } else if (hasSomeFlags(type, [ts.TypeFlags.StringLike])) {
        node = { type: NodeType.String }
    } else if (hasSomeFlags(type, [ts.TypeFlags.NumberLike])) {
        node = { type: NodeType.Number }
    } else if (hasSomeFlags(type, [ts.TypeFlags.BooleanLike])) {
        node = { type: NodeType.Boolean }
    } else if (type.isUnion()) {
        node = unionToTree(type, checker)
    } else if (checker.isArrayType(type)) {
        node = arrayToTree(type, checker)
    } else if (checker.isTupleType(type)) {
        node = tupleToTree(type, checker)
    } else if (hasSomeFlags(type, [ts.TypeFlags.Object])) {
        node = objectToTree(type, symbol, checker)
    }
    if (symbol) {
        // Get property documentation
        const docs = symbol.getDocumentationComment(checker)
        const docText = docs.map((d) => d.text).join('\n')

        let info: JSDocInfo = {}
        // For jsdoc typedefs
        if (symbol.flags & ts.SymbolFlags.TypeAlias) {
            // Parse metadata from documentation
            const { description, metadata } = parsePropertyMetadata(docText)
            info = metadataToJSDocInfo(metadata, description)
        } else {
            info = getSymbolJSDocInfo(symbol, node.type, checker)
        }

        if (Object.keys(info).length) return { ...node, info }
    }
    return node
}

function hasSomeFlags(type: ts.Type, flags: ts.TypeFlags[]) {
    return flags.some((f) => type.flags & f)
}

function arrayToTree(type: ts.Type, checker: ts.TypeChecker): ArrayNode {
    const indexInfos = checker.getIndexInfosOfType(type)
    const arrayIndexInfo = indexInfos.find((info) => info.keyType.flags & ts.TypeFlags.Number)

    if (!arrayIndexInfo) {
        throw new Error('Could not find array index info with TypeFlags.Number flag')
    }
    return {
        type: NodeType.Array,
        items: typeToTree(arrayIndexInfo.type, type.symbol, checker),
    }
}

function tupleToTree(type: ts.Type, checker: ts.TypeChecker): TupleNode {
    const args = checker.getTypeArguments(type as ts.TypeReference)
    return {
        type: NodeType.Tuple,
        items: args.map((t) => typeToTree(t, type.symbol, checker)),
    }
}

function unionToTree(type: ts.UnionType, checker: ts.TypeChecker): Node {
    // This condition needed because ts represent boolean
    // internally as `true | false` union
    const isBooleanUnion = type.types.every((t) => {
        return hasSomeFlags(t, [ts.TypeFlags.BooleanLiteral])
    })
    if (isBooleanUnion) {
        return {
            type: NodeType.Boolean,
        }
    }

    // Check for string union enum
    const isStringEnum = type.types.every((t) => {
        return hasSomeFlags(t, [ts.TypeFlags.StringLiteral])
    })
    if (isStringEnum) {
        const values = type.types.map((t) => {
            if (!t.isLiteral()) {
                throw new Error('TypeFlags.StringLiteral is not literal')
            }
            return t.value as string
        })
        return {
            type: NodeType.Enum,
            values: values,
        }
    }

    // Check for number union enum
    const isNumberEnum = type.types.every((t) => {
        return hasSomeFlags(t, [ts.TypeFlags.NumberLiteral])
    })
    if (isNumberEnum) {
        const values = type.types.map((t) => {
            if (!t.isLiteral()) {
                throw new Error('TypeFlags.NumberLiteral is not literal')
            }
            return t.value as number
        })
        return {
            type: NodeType.Enum,
            values: values,
        }
    }

    const oneOf: Node[] = []
    for (const unionMember of type.types) {
        oneOf.push(typeToTree(unionMember, type.symbol, checker))
    }
    return {
        type: NodeType.Union,
        oneOf,
    }
}

function objectToTree(type: ts.Type, symbol: ts.Symbol | undefined, checker: ts.TypeChecker): Node {
    // Check for index signatures (Records with string OR number keys)
    const indexInfos = checker.getIndexInfosOfType(type)
    const recordIndexInfo = indexInfos.find((info) =>
        hasSomeFlags(info.keyType, [ts.TypeFlags.String, ts.TypeFlags.Number]),
    )

    if (recordIndexInfo) {
        // This is a Record type (string or numeric keyed)
        return {
            type: NodeType.Record,
            items: typeToTree(recordIndexInfo.type, type.symbol, checker),
        }
    }

    const properties: Record<string, Node> = {}
    const required: string[] = []

    for (const prop of type.getProperties()) {
        let type = checker.getTypeOfSymbol(prop)

        let isOptional = (prop.flags & ts.SymbolFlags.Optional) !== 0
        if (!isOptional) {
            required.push(prop.name)
        } else if (type.isUnion()) {
            type = resolveOptionalUnionProp(type)
        }

        const node = typeToTree(type, type.aliasSymbol || type.symbol, checker)

        // Get property documentation
        const docs = prop.getDocumentationComment(checker)
        const docText = docs.map((d) => d.text).join('\n')

        let info: JSDocInfo = {}
        const isTypedef = symbol && symbol.flags & ts.SymbolFlags.TypeAlias
        if (isTypedef) {
            const { description, metadata } = parsePropertyMetadata(docText)
            info = metadataToJSDocInfo(metadata, description)
        } else {
            info = getSymbolJSDocInfo(prop, node.type, checker)
        }

        if (Object.keys(info).length) {
            properties[prop.name] = {
                info,
                ...node,
            }
        } else {
            properties[prop.name] = node
        }
    }
    return {
        type: NodeType.Object,
        required,
        properties,
    }
}

function resolveOptionalUnionProp(union: ts.UnionType): ts.Type {
    const members = union.types.filter((t) => !(t.flags & ts.TypeFlags.Undefined))

    // If property is just optional
    if (members.length === 1) {
        return members[0] as ts.Type
        // If property is optional and a union
    } else {
        // WARN: Mutation can cause problems, but not sure
        union.types = members
        return union
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
            const [_, key, value] = metaMatch
            metadata[key] = value.trim()
        } else {
            description = line
        }
    }

    return { description, metadata }
}

function metadataToJSDocInfo(metadata: Record<string, string>, description?: string): JSDocInfo {
    const info: JSDocInfo = {}

    if (description) {
        info.description = description
    }

    for (const [key, value] of Object.entries(metadata)) {
        switch (key) {
            case 'example':
                try {
                    info.example = JSON.parse(value)
                } catch (e) {
                    // If not valid JSON, use as string
                    info.example = value
                }
                break
            case 'format':
                info.format = value
                break
            case 'minimum':
                info.minimum = parseInt(value)
                break
            case 'maximum':
                info.maximum = parseInt(value)
                break
            // Add more cases as needed
        }
    }

    return info
}

function getSymbolJSDocInfo(symbol: ts.Symbol, type: NodeType, checker: ts.TypeChecker): JSDocInfo {
    const info: JSDocInfo = {}
    const description = symbol.getDocumentationComment(checker)
    if (description?.[0]?.text) {
        info.description = description[0].text.replace('\n', ' ').trim()
    }

    const tagsArr = symbol.getJsDocTags()
    for (const tag of tagsArr) {
        if (!tag.text?.[0]?.text) continue
        const text = tag.text[0].text.replace('\n', ' ').trim()

        switch (tag.name) {
            case 'example':
                try {
                    info.example = JSON.parse(text)
                } catch (e: any) {
                    throw generateError('Cannot parse tag @example (should be valid JSON)', symbol)
                }
                break
            case 'format':
                info.format = text
                break
            case 'minimum':
                info.minimum = parseInt(text)
                break
            case 'maximum':
                info.maximum = parseInt(text)
                break
        }
    }

    return info
}
