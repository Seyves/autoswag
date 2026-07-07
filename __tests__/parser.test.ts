import { expect, test } from 'vitest'
import { NodeType, parse, type ObjectNode } from '../src/parser'

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
