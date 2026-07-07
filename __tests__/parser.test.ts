import { expect, recordArtifact, test } from 'vitest'
import { EnumNode, PrimitiveNode, Node, NodeType, parse, type ObjectNode } from '../src/parser'

test('primitives', () => {
    const actual = parse('./__tests__/fixtures/primitives.ts')
    const expected: PrimitiveNode[] = [
        {
            type: NodeType.String,
        },
        {
            type: NodeType.Number,
        },
        {
            type: NodeType.Boolean,
        },
        {
            type: NodeType.Undefined,
        },
        {
            type: NodeType.Null,
        },
    ]
    expect(actual).toStrictEqual(expected)
})

test('arrays', () => {
    const [stringArray, numberArray, genericArray, readonlyArr, objectArr, nestedArr, tupleArr] =
        parse('./__tests__/fixtures/arrays.ts')

    expect(stringArray).toStrictEqual({
        type: NodeType.Array,
        items: { type: NodeType.String },
    })

    expect(numberArray).toStrictEqual({
        type: NodeType.Array,
        items: { type: NodeType.Number },
    })

    expect(genericArray).toStrictEqual({
        type: NodeType.Array,
        items: { type: NodeType.Boolean },
    })

    expect(readonlyArr).toStrictEqual({
        type: NodeType.Array,
        items: { type: NodeType.String },
    })

    expect(objectArr).toStrictEqual({
        type: NodeType.Array,
        items: {
            type: NodeType.Object,
            required: ['id'],
            properties: {
                id: {
                    type: NodeType.String,
                },
            },
        },
    })

    expect(nestedArr).toStrictEqual({
        type: NodeType.Array,
        items: {
            type: NodeType.Array,
            items: {
                type: NodeType.Number,
            },
        },
    })

    expect(tupleArr).toStrictEqual({
        type: NodeType.Tuple,
        items: [
            {
                type: NodeType.Number,
            },
            {
                type: NodeType.String,
            },
            {
                type: NodeType.Object,
                properties: {
                    property: {
                        type: NodeType.Boolean,
                    },
                },
                required: ['property'],
            },
        ],
    })
})

test('string record types', () => {
    const [numberRecord, stringRecord, objectRecord, mappedInterface] = parse(
        './__tests__/fixtures/string-record-types.ts',
    ).slice(0, 5)

    expect(numberRecord).toStrictEqual({
        type: NodeType.Record,
        items: {
            type: NodeType.Number,
        },
    })
    expect(stringRecord).toStrictEqual({
        type: NodeType.Record,
        items: {
            type: NodeType.String,
        },
    })
    expect(objectRecord).toStrictEqual({
        type: NodeType.Record,
        items: {
            type: NodeType.Object,
            properties: {
                property: {
                    type: NodeType.Number,
                },
            },
            required: ['property'],
        },
    })
    expect(mappedInterface).toStrictEqual({
        type: NodeType.Record,
        items: {
            type: NodeType.Number,
        },
    })
})

test('numeric record types', () => {
    const [numberRecord, stringRecord, objectRecord, mappedInterface] = parse(
        './__tests__/fixtures/string-record-types.ts',
    ).slice(0, 5)

    expect(numberRecord).toStrictEqual({
        type: NodeType.Record,
        items: {
            type: NodeType.Number,
        },
    })
    expect(stringRecord).toStrictEqual({
        type: NodeType.Record,
        items: {
            type: NodeType.String,
        },
    })
    expect(objectRecord).toStrictEqual({
        type: NodeType.Record,
        items: {
            type: NodeType.Object,
            properties: {
                property: {
                    type: NodeType.Number,
                },
            },
            required: ['property'],
        },
    })
    expect(mappedInterface).toStrictEqual({
        type: NodeType.Record,
        items: {
            type: NodeType.Number,
        },
    })
})

test('generics', () => {
    const [resolvedArray, resolvedObject] = parse('./__tests__/fixtures/generics.ts')
    expect(resolvedArray).toStrictEqual({
        type: NodeType.Array,
        items: { type: NodeType.Number },
    })
    expect(resolvedObject).toStrictEqual({
        type: NodeType.Object,
        properties: {
            nested: {
                type: NodeType.Object,
                properties: {
                    age: {
                        type: NodeType.String,
                    },
                    name: {
                        type: NodeType.Number,
                    },
                },
                required: ['age', 'name'],
            },
        },
        required: [],
    })
})

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

test('jsdoc tags', () => {
    const actual = parse('./__tests__/fixtures/jsdoc-tags.ts')[0]
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
