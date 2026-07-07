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
    example?: string
    description?: string
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

export function parse(fileName: string) {
    const program = ts.createProgram([fileName], {
        target: ts.ScriptTarget.ESNext,
    })
    const checker = program.getTypeChecker()
    const source = program.getSourceFile(fileName)!

    const rootChildren = source.getChildren()
    const syntaxList = rootChildren[0]!
    const children = syntaxList.getChildren()
    const tree: Node[] = []
    for (const child of children) {
        const type = checker.getTypeAtLocation(child)
        tree.push(typeToTree(type, checker))
    }
    return tree
}

function typeToTree(type: ts.Type, checker: ts.TypeChecker): Node {
    if (hasSomeFlags(type, [ts.TypeFlags.Undefined])) {
        return {
            type: NodeType.Undefined,
        }
    }
    if (hasSomeFlags(type, [ts.TypeFlags.Null])) {
        return {
            type: NodeType.Null,
        }
    }
    if (hasSomeFlags(type, [ts.TypeFlags.StringLike])) {
        return {
            type: NodeType.String,
        }
    }
    if (hasSomeFlags(type, [ts.TypeFlags.NumberLike])) {
        return {
            type: NodeType.Number,
        }
    }
    if (hasSomeFlags(type, [ts.TypeFlags.BooleanLike])) {
        return {
            type: NodeType.Boolean,
        }
    }
    if (type.isUnion()) {
        return unionToTree(type, checker)
    }
    if (checker.isArrayType(type)) {
        return arrayToTree(type, checker)
    }
    if (checker.isTupleType(type)) {
        return tupleToTree(type, checker)
    }
    if (hasSomeFlags(type, [ts.TypeFlags.Object])) {
        return objectToTree(type, checker)
    }
    return {
        type: NodeType.Unknown,
    }
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
        items: typeToTree(arrayIndexInfo.type, checker),
    }
}

function tupleToTree(type: ts.Type, checker: ts.TypeChecker): TupleNode {
    const args = checker.getTypeArguments(type as ts.TypeReference)
    return {
        type: NodeType.Tuple,
        items: args.map((t) => typeToTree(t, checker)),
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
        oneOf.push(typeToTree(unionMember, checker))
    }
    return {
        type: NodeType.Union,
        oneOf,
    }
}

function objectToTree(type: ts.Type, checker: ts.TypeChecker): Node {
    // Check for index signatures (Records with string OR number keys)
    const indexInfos = checker.getIndexInfosOfType(type)
    const recordIndexInfo = indexInfos.find((info) =>
        hasSomeFlags(info.keyType, [ts.TypeFlags.String, ts.TypeFlags.Number]),
    )

    if (recordIndexInfo) {
        // This is a Record type (string or numeric keyed)
        return {
            type: NodeType.Record,
            items: typeToTree(recordIndexInfo.type, checker),
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
        properties[prop.name] = typeToTree(type, checker)
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
