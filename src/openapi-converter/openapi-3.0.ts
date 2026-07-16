// NOTE: Type definitions includes only supported 3.0 OpenApi properties
import * as nodes from '@/typescript-parser/nodes'

export interface RefType {
    $ref: string
}

export enum Type {
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',
    Array = 'array',
    Object = 'object',
}

export const primitiveTypes = [Type.String, Type.Number, Type.Boolean] as const

export type PrimitiveType = (typeof primitiveTypes)[number]

interface NodeBase {
    description?: string
    example?: any
    format?: string
    pattern?: string
    minimum?: number
    maximum?: number
    multipleOf?: number
    nullable?: boolean
}

interface Primitive extends NodeBase {
    type: Type.String | Type.Number | Type.String | Type.Boolean
}

interface NullNode extends NodeBase {
    nullable: true
}

interface ArrayNode extends NodeBase {
    type: Type.Array
    items?: Node
    minItems?: number
    maxItems?: number
    uniqueItems?: boolean
}

interface ObjectNode extends NodeBase {
    type: Type.Object
    properties?: Record<string, Node>
    required?: string[]
    // TODO: somehow support true or false values
    additionalProperties?: Node
}

interface EnumNode<ItemType extends string | number> extends NodeBase {
    type: ItemType extends string ? Type.String : Type.Number
    enum: ItemType[]
}

interface OneOfNode extends NodeBase {
    oneOf: Node[]
}

type EmptyNode = Record<PropertyKey, never>

export type Node =
    | Primitive
    | NullNode
    | RefType
    | ArrayNode
    | ObjectNode
    | OneOfNode
    | EnumNode<string | number>
    | EmptyNode

export const formatToType: Record<string, Type.String | Type.Number> = {
    base64url: Type.String,
    binary: Type.String,
    byte: Type.String,
    char: Type.String,
    commonmark: Type.String,
    'date-time-local': Type.String,
    'date-time': Type.String,
    date: Type.String,
    decimal: Type.Number,
    decimal128: Type.Number,
    'double-int': Type.Number,
    double: Type.Number,
    duration: Type.String,
    email: Type.String,
    float: Type.Number,
    hostname: Type.String,
    html: Type.String,
    'http-date': Type.String,
    'idn-email': Type.String,
    'idn-hostname': Type.String,
    int16: Type.Number,
    int32: Type.Number,
    int64: Type.Number,
    int8: Type.Number,
    'ipv4-cidr': Type.String,
    ipv4: Type.String,
    'ipv6-cidr': Type.String,
    ipv6: Type.String,
    'iri-reference': Type.String,
    iri: Type.String,
    'json-pointer': Type.String,
    language: Type.String,
    'media-range': Type.String,
    password: Type.String,
    regex: Type.String,
    'relative-json-pointer': Type.String,
    'sf-binary': Type.String,
    'sf-boolean': Type.String,
    'sf-decimal': Type.String,
    'sf-integer': Type.Number,
    'sf-string': Type.String,
    'sf-token': Type.String,
    'time-local': Type.String,
    time: Type.String,
    uint16: Type.Number,
    uint32: Type.Number,
    uint64: Type.Number,
    uint8: Type.Number,
    unixtime: Type.Number,
    'uri-reference': Type.String,
    'uri-template': Type.String,
    uri: Type.String,
    uuid: Type.String,
}

export function resolvePrimitiveOrFormat(typeName: string) {
    // @ts-ignore
    if (primitiveTypes.includes(typeName)) {
        return { type: typeName as PrimitiveType }
    }
    if (formatToType.hasOwnProperty(typeName)) {
        return {
            type: formatToType[typeName]!,
            format: typeName,
        }
    }
}

export function treeToOpenApi(node: nodes.Node): Node {
    let openApiNode: Node = {}

    switch (node.type) {
        case nodes.Kind.Undefined:
            openApiNode = { nullable: true }
            break

        case nodes.Kind.Null:
            openApiNode = { nullable: true }
            break

        case nodes.Kind.String:
            openApiNode = { type: Type.String }
            break

        case nodes.Kind.Number:
            openApiNode = { type: Type.Number }
            break

        case nodes.Kind.Boolean:
            openApiNode = { type: Type.Boolean }
            break

        case nodes.Kind.Object:
            const properties: Record<string, Node> = {}
            for (const prop in node.properties) {
                properties[prop] = treeToOpenApi(node.properties[prop]!)
            }
            openApiNode = {
                type: Type.Object,
                properties: properties,
            }
            if (node.required) {
                ;(openApiNode as ObjectNode).required = node.required
            }
            break

        case nodes.Kind.Union:
            const variants = node.oneOf.map(treeToOpenApi)
            if (isNullableUnion(variants)) {
                openApiNode = resolveNullableUnion(variants)
            } else {
                openApiNode = {
                    oneOf: variants,
                }
            }
            break

        case nodes.Kind.Enum:
            if (typeof node.values[0] === 'number') {
                openApiNode = {
                    type: Type.Number,
                    enum: node.values,
                } as EnumNode<number>
            } else {
                openApiNode = {
                    type: Type.String,
                    enum: node.values,
                } as EnumNode<string>
            }
            break

        case nodes.Kind.Record:
            openApiNode = {
                type: Type.Object,
                additionalProperties: treeToOpenApi(node.items),
            }
            break

        case nodes.Kind.Array:
            openApiNode = {
                type: Type.Array,
                items: treeToOpenApi(node.items),
            }
            break

        case nodes.Kind.Tuple:
            openApiNode = {
                type: Type.Array,
                items: {
                    oneOf: node.items.map(treeToOpenApi),
                },
            }
            break

        case nodes.Kind.Component:
            openApiNode = {
                $ref: `#/components/schemas/${node.ref}`,
            }
            break

        case nodes.Kind.Unknown:
            openApiNode = {}
    }

    if (node.info && isNonEmptyNode(openApiNode)) {
        openApiNode = { ...openApiNode, ...node.info }
    }

    return openApiNode
}

function isNonEmptyNode(node: Node): node is Exclude<Node, EmptyNode> {
    return Object.keys(node).length > 0
}

function isNullableUnion(variants: Node[]) {
    if (variants.length !== 2) return false
    return variants.some((n) => 'nullable' in n && n.nullable)
}

function resolveNullableUnion(variants: Node[]): Node {
    return {
        ...variants.find((n) => !('nullable' in n && n.nullable))!,
        nullable: true,
    }
}
