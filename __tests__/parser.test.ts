import { expect, test } from 'vitest'
import { EnumNode, NodeType, parse, type ObjectNode } from '../src/parser'

test('type with primitives', () => {
    const actual = parse('./__tests__/fixtures/type-with-primitives.ts')[0]
    const expected: ObjectNode = {
        type: NodeType.Object,
        properties: {
            id: { type: NodeType.String },
            name: { type: NodeType.String },
            age: { type: NodeType.Number },
            emailVerified: { type: NodeType.Boolean },
        },
        required: ['id', 'name', 'age'],
    }
    expect(actual).toStrictEqual(expected)
})

test('type with boolean union', () => {
    const actual = parse('./__tests__/fixtures/type-with-bool-union.ts')[0]
    const expected: ObjectNode = {
        type: NodeType.Object,
        properties: {
            unionBoolA: { type: NodeType.Boolean },
            unionBoolB: { type: NodeType.Boolean },
            unionBoolC: { type: NodeType.Boolean },
        },
        required: [],
    }
    expect(actual).toStrictEqual(expected)
})

test('interface with primitives', () => {
    const actual = parse('./__tests__/fixtures/interface-with-primitives.ts')[0]
    const expected: ObjectNode = {
        type: NodeType.Object,
        properties: {
            id: { type: NodeType.String },
            name: { type: NodeType.String },
            age: { type: NodeType.Number },
            emailVerified: { type: NodeType.Boolean },
        },
        required: ['id', 'name', 'age'],
    }
    expect(actual).toStrictEqual(expected)
})

test('nested interface', () => {
    const actual = parse('./__tests__/fixtures/nested-interface.ts')[0]
    const expected: ObjectNode = {
        type: NodeType.Object,
        properties: {
            id: { type: NodeType.String },
            name: { type: NodeType.String },
            age: { type: NodeType.Number },
            preferences: {
                type: NodeType.Object,
                properties: {
                    fontSize: { type: NodeType.Number },
                    theme: {
                        type: NodeType.String,
                    },
                },
                required: ['fontSize', 'theme'],
            },
        },
        required: ['id', 'name', 'age', 'preferences'],
    }
    expect(actual).toStrictEqual(expected)
})

test('nested type', () => {
    const actual = parse('./__tests__/fixtures/nested-type.ts')[0]
    const expected: ObjectNode = {
        type: NodeType.Object,
        properties: {
            id: { type: NodeType.String },
            name: { type: NodeType.String },
            age: { type: NodeType.Number },
            preferences: {
                type: NodeType.Object,
                properties: {
                    fontSize: { type: NodeType.Number },
                    theme: {
                        type: NodeType.String,
                    },
                },
                required: ['fontSize', 'theme'],
            },
        },
        required: ['id', 'name', 'age', 'preferences'],
    }
    expect(actual).toStrictEqual(expected)
})

test('string union enum', () => {
    const actual = parse('./__tests__/fixtures/string-union-enum.ts')[0]
    const expected: EnumNode = {
        type: NodeType.Enum,
        values: ['light', 'dark', 'system'],
    }
    expect(actual).toStrictEqual(expected)
})

test('number union enum', () => {
    const actual = parse('./__tests__/fixtures/number-union-enum.ts')[0]
    const expected: EnumNode = {
        type: NodeType.Enum,
        values: [0, 1, 2],
    }
    expect(actual).toStrictEqual(expected)
})

test('string ts enum', () => {
    const actual = parse('./__tests__/fixtures/string-ts-enum.ts')[0]
    const expected: EnumNode = {
        type: NodeType.Enum,
        values: ['light', 'dark', 'system'],
    }
    expect(actual).toStrictEqual(expected)
})

test('number ts enum', () => {
    const actual = parse('./__tests__/fixtures/number-ts-enum.ts')[0]
    const expected: EnumNode = {
        type: NodeType.Enum,
        values: [0, 1, 2],
    }
    expect(actual).toStrictEqual(expected)
})
