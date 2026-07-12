import ts, { type PseudoBigInt } from 'typescript'
import * as utils from '@/ts-translater/utils'
import * as nodes from '@/ts-translater/nodes'
import * as tags from '@/ts-translater/tags'
import type { Tags } from './tags'
import { AutodocError, getLocationFromSymbol } from '@/common/errors'

interface Context {
    checker: ts.TypeChecker
    // Map for the types that marked as swagger components
    components: Record<string, nodes.Node>
}

// Main entry point for every unknown node
export function typeToTree(
    ctx: Context,
    symbolStack: number[],
    type: ts.Type,
    symbol?: ts.Symbol,
): nodes.Node {
    symbolStack = [...symbolStack]
    symbol = symbol || type.aliasSymbol || type.symbol
    let node: nodes.Node = { type: nodes.Kind.Unknown }
    let info: Tags = {}

    if (symbol) {
        // Get declaration documentation
        info = tags.parseSymbolJSDoc(ctx.checker, symbol, symbol)
        const component = info.component
        if (component) delete info.component

        if (Object.keys(info).length) {
            node.info = info
        }
        if (component) {
            if (ctx.components.hasOwnProperty(component)) {
                return {
                    type: nodes.Kind.Component,
                    ref: component,
                }
            } else {
                ctx.components[component] = node
            }
        }
    }

    // Check for circle dependencies
    if (type.aliasSymbol && utils.isUserDefinedType(type.aliasSymbol)) {
        const id = (type.aliasSymbol as any).id as number
        if (symbolStack.includes(id)) {
            throw new AutodocError(
                `Recursive declaration encountered on symbol ${symbol.name}. To fix this issue, mark recursive type with @component tag`,
                getLocationFromSymbol(symbol),
            )
        } else {
            symbolStack.push(id)
        }
    }

    if (utils.hasTypeFlags(type, [ts.TypeFlags.Undefined, ts.TypeFlags.VoidLike])) {
        node = { ...node, type: nodes.Kind.Undefined }
    } else if (utils.hasTypeFlags(type, [ts.TypeFlags.Null])) {
        node = { ...node, type: nodes.Kind.Null }
    } else if (utils.hasTypeFlags(type, [ts.TypeFlags.StringLiteral])) {
        if (!type.isLiteral()) {
            throw new Error('TypeFlags.StringLiteral is not literal')
        }
        node = { ...node, type: nodes.Kind.Enum, values: [type.value as string] }
    } else if (utils.hasTypeFlags(type, [ts.TypeFlags.StringLike])) {
        node = { ...node, type: nodes.Kind.String }
    } else if (utils.hasTypeFlags(type, [ts.TypeFlags.NumberLiteral])) {
        if (!type.isLiteral()) {
            throw new Error('TypeFlags.NumberLiteral is not literal')
        }
        node = { ...node, type: nodes.Kind.Enum, values: [type.value as number] }
    } else if (utils.hasTypeFlags(type, [ts.TypeFlags.BigIntLiteral])) {
        if (!type.isLiteral()) {
            throw new Error('TypeFlags.BigIntLiteral is not literal')
        }
        const value = type.value as PseudoBigInt
        node = { ...node, type: nodes.Kind.Enum, values: [value.base10Value] }
    } else if (utils.hasTypeFlags(type, [ts.TypeFlags.NumberLike, ts.TypeFlags.BigIntLike])) {
        node = { ...node, type: nodes.Kind.Number }
    } else if (utils.hasTypeFlags(type, [ts.TypeFlags.BooleanLike])) {
        node = { ...node, type: nodes.Kind.Boolean }
    } else if (type.isUnion()) {
        node = { ...node, ...unionToTree(ctx, symbolStack, type) }
    } else if (ctx.checker.isArrayType(type)) {
        node = { ...node, ...arrayToTree(ctx, symbolStack, type) }
    } else if (ctx.checker.isTupleType(type)) {
        node = { ...node, ...tupleToTree(ctx, symbolStack, type) }
    } else if (utils.hasTypeFlags(type, [ts.TypeFlags.Object])) {
        const objectIndexInfo = getObjectIndexInfo(ctx, type)
        // This is a Record type (string or numeric keyed)
        if (objectIndexInfo) {
            node = {
                ...node,
                type: nodes.Kind.Record,
                items: typeToTree(ctx, symbolStack, objectIndexInfo.type),
            }
        } else {
            node = { ...node, ...objectToTree(ctx, symbolStack, type) }
        }
    } else if (type.isIntersection()) {
        // Only computing object intersections, other should be invalid
        const isObjectIntersection = type.types.every((t) =>
            utils.hasTypeFlags(t, [ts.TypeFlags.Object]),
        )
        if (isObjectIntersection) {
            node = { ...node, ...intersectionToTree(ctx, symbolStack, type) }
        }
    }
    return node
}

function getObjectIndexInfo(ctx: Context, type: ts.Type) {
    const indexInfos = ctx.checker.getIndexInfosOfType(type)
    return indexInfos.find((info) =>
        utils.hasTypeFlags(info.keyType, [ts.TypeFlags.String, ts.TypeFlags.Number]),
    )
}

function arrayToTree(ctx: Context, symbolStack: number[], type: ts.Type): nodes.Array {
    const typeArgs = ctx.checker.getTypeArguments(type as ts.TypeReference)
    const elemType = typeArgs[0]

    if (!elemType) throw new Error('Array is missing type arguments')

    return {
        type: nodes.Kind.Array,
        items: typeToTree(ctx, symbolStack, elemType),
    }
}

function intersectionToTree(
    ctx: Context,
    symbolStack: number[],
    type: ts.UnionOrIntersectionType,
): nodes.Object {
    const properties: Record<string, nodes.Node> = {}
    const required: string[] = []

    for (const item of type.types) {
        const objectIndexInfo = getObjectIndexInfo(ctx, item)
        // Do not account for Record types
        if (objectIndexInfo) continue

        const obj = objectToTree(ctx, symbolStack, item)
        Object.assign(properties, obj.properties)
        required.push(...obj.required)
    }

    return {
        type: nodes.Kind.Object,
        properties: properties,
        required: required,
    }
}

function tupleToTree(ctx: Context, symbolStack: number[], type: ts.Type): nodes.Tuple {
    const args = ctx.checker.getTypeArguments(type as ts.TypeReference)
    const maxItems = args.length
    let minItems = args.length
    const mutatedArgs: ts.Type[] = []

    for (let i = args.length - 1; i >= 0; i--) {
        const child = args[i] as ts.Type
        if (child.isUnion() && utils.isUnionOptional(child)) {
            minItems--
            mutatedArgs.unshift(utils.resolveOptionalUnionProp(child))
        } else {
            mutatedArgs.unshift(child)
        }
    }
    return {
        type: nodes.Kind.Tuple,
        items: mutatedArgs.map((t) => typeToTree(ctx, symbolStack, t)),
        maxItems,
        minItems,
    }
}

function unionToTree(ctx: Context, symbolStack: number[], type: ts.UnionType): nodes.Node {
    // This condition needed because ts represent boolean
    // internally as `true | false` union
    const isBooleanUnion = type.types.every((t) => {
        return utils.hasTypeFlags(t, [ts.TypeFlags.BooleanLiteral])
    })
    if (isBooleanUnion) {
        return {
            type: nodes.Kind.Boolean,
        }
    }

    // Check for string union enum
    const isStringEnum = type.types.every((t) => {
        return utils.hasTypeFlags(t, [ts.TypeFlags.StringLiteral])
    })
    if (isStringEnum) {
        const values = type.types.map((t) => {
            if (!t.isLiteral()) {
                throw new Error('TypeFlags.StringLiteral is not literal')
            }
            return t.value as string
        })
        return {
            type: nodes.Kind.Enum,
            values: values,
        }
    }

    // Check for number union enum
    const isNumberEnum = type.types.every((t) => {
        return utils.hasTypeFlags(t, [ts.TypeFlags.NumberLiteral])
    })
    if (isNumberEnum) {
        const values = type.types.map((t) => {
            if (!t.isLiteral()) {
                throw new Error('TypeFlags.NumberLiteral is not literal')
            }
            return t.value as number
        })
        return {
            type: nodes.Kind.Enum,
            values: values,
        }
    }

    const oneOf: nodes.Node[] = []
    for (const unionMember of type.types) {
        oneOf.push(typeToTree(ctx, symbolStack, unionMember))
    }
    return {
        type: nodes.Kind.Union,
        oneOf,
    }
}

function objectToTree(ctx: Context, symbolStack: number[], type: ts.Type): nodes.Object {
    const properties: Record<string, nodes.Node> = {}
    const required: string[] = []
    const symbol = type.aliasSymbol

    for (const prop of type.getProperties()) {
        if (utils.hasSymbolFlags(prop, [ts.SymbolFlags.Method])) continue

        let type = ctx.checker.getTypeOfSymbol(prop)

        if (!utils.hasSymbolFlags(prop, [ts.SymbolFlags.Optional])) {
            required.push(prop.name)
        } else if (type.isUnion()) {
            type = utils.resolveOptionalUnionProp(type)
        }

        const node = typeToTree(ctx, symbolStack, type)

        // Get property documentation
        const info = tags.parseSymbolJSDoc(ctx.checker, prop, symbol)

        // Component tags only allowed on definitions
        delete info.component

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
        type: nodes.Kind.Object,
        required,
        properties,
    }
}
