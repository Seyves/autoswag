import ts from 'typescript'

export enum NodeType {
    Undefined,
    Null,
    String,
    Number,
    Boolean,
    Object,
    Union,
    Enum,
}

interface BaseNode {
    type: NodeType
    example?: string
    description?: string
}

export interface PrimitiveNode extends BaseNode {}
export interface ObjectNode extends BaseNode {
    properties: Record<string, Node>
    required: string[]
}
export interface UnionNode extends BaseNode {
    oneOf: Node[]
}
export interface EnumNode extends BaseNode {
    values: string[] | number[]
}
export type Node = PrimitiveNode | ObjectNode | UnionNode | EnumNode

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
    if (type.flags & ts.TypeFlags.Undefined) {
        return {
            type: NodeType.Undefined,
        }
    }

    if (type.flags & ts.TypeFlags.Null) {
        return {
            type: NodeType.Null,
        }
    }

    if (type.flags & ts.TypeFlags.StringLike) {
        return {
            type: NodeType.String,
        }
    }

    if (type.flags & ts.TypeFlags.NumberLike) {
        return {
            type: NodeType.Number,
        }
    }

    if (type.flags & ts.TypeFlags.BooleanLike) {
        return {
            type: NodeType.Boolean,
        }
    }

    if (type.isUnion()) {
        // This condition needed because ts represent boolean
        // internally as `true | false` union
        const isBooleanUnion = type.types.every((t) => t.flags & ts.TypeFlags.BooleanLiteral)
        if (isBooleanUnion) {
            return {
                type: NodeType.Boolean,
            }
        }

        const isStringEnum = type.types.every((t) => t.flags & ts.TypeFlags.StringLiteral)
        if (isStringEnum) {
            const values = type.types.map((t) => {
                if (!t.isLiteral()) throw new Error('TypeFlags.StringLiteral is not literal')
                return t.value as string
            })
            return {
                type: NodeType.Enum,
                values: values,
            }
        }

        const isNumberEnum = type.types.every((t) => t.flags & ts.TypeFlags.NumberLiteral)
        if (isNumberEnum) {
            const values = type.types.map((t) => {
                if (!t.isLiteral()) throw new Error('TypeFlags.NumberLiteral is not literal')
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

    if (type.flags & ts.TypeFlags.Object) {
        return objectToTree(type, checker)
    }

    throw 'unreachable'
}

function objectToTree(type: ts.Type, checker: ts.TypeChecker): ObjectNode {
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
