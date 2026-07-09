import { expect, test, describe } from 'vitest'
import * as nodes from '../../src/translater/nodes'
import { translate } from '../../src/translater/translate'

describe('Arrays', () => {
    const fixtures = '__tests__/translater/fixtures/arrays'

    test('should translate string array type', () => {
        const [result] = translate(`${fixtures}/string-array.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: { type: nodes.Kind.String },
        })
    })

    test('should translate number array type', () => {
        const [result] = translate(`${fixtures}/number-array.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: { type: nodes.Kind.Number },
        })
    })

    test('should translate generic array type', () => {
        const [result] = translate(`${fixtures}/generic-array.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: { type: nodes.Kind.Boolean },
        })
    })

    test('should translate readonly array type', () => {
        const [result] = translate(`${fixtures}/readonly-array.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: { type: nodes.Kind.String },
        })
    })

    test('should translate object array type', () => {
        const [result] = translate(`${fixtures}/object-array.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: {
                type: nodes.Kind.Object,
                required: ['id'],
                properties: {
                    id: { type: nodes.Kind.String },
                },
            },
        })
    })

    test('should translate nested array type', () => {
        const [result] = translate(`${fixtures}/nested-array.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: {
                type: nodes.Kind.Array,
                items: { type: nodes.Kind.Number },
            },
        })
    })

    test('should translate recursive array type', () => {
        const [result] = translate(`${fixtures}/recursive-array.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Object,
            properties: {
                value: {
                    type: nodes.Kind.String,
                },
                children: {
                    type: nodes.Kind.Array,
                    items: {
                        type: nodes.Kind.Component,
                        ref: 'TreeNode',
                    },
                },
            },
            required: ['value'],
        })
    })

    test('should translate tuple type', () => {
        const [result] = translate(`${fixtures}/tuple.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Tuple,
            items: [
                { type: nodes.Kind.Number },
                { type: nodes.Kind.String },
                {
                    type: nodes.Kind.Object,
                    properties: {
                        property: { type: nodes.Kind.Boolean },
                    },
                    required: ['property'],
                },
            ],
            minItems: 3,
            maxItems: 3,
        })
    })

    test('should translate empty tuple type', () => {
        const [result] = translate(`${fixtures}/empty-tuple.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Tuple,
            items: [],
            minItems: 0,
            maxItems: 0,
        })
    })

    test('should translate single element tuple type', () => {
        const [result] = translate(`${fixtures}/single-element-tuple.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Tuple,
            items: [{ type: nodes.Kind.String }],
            minItems: 1,
            maxItems: 1,
        })
    })

    test('should translate tuple with optional elements', () => {
        const [result] = translate(`${fixtures}/tuple-with-optional.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Tuple,
            items: [{ type: nodes.Kind.String }, { type: nodes.Kind.Number }],
            minItems: 1,
            maxItems: 2,
        })
    })

    test('should translate tuple with rest elements', () => {
        const [result] = translate(`${fixtures}/tuple-with-rest.ts`)
        // Note: rest elements are typically handled as tuples in TS
        expect(result).toMatchObject({
            type: nodes.Kind.Tuple,
        })
    })

    test('should translate readonly tuple type', () => {
        const [result] = translate(`${fixtures}/readonly-tuple.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Tuple,
            items: [{ type: nodes.Kind.String }, { type: nodes.Kind.Number }],
            minItems: 2,
            maxItems: 2,
        })
    })

    test('should translate nested tuple type', () => {
        const [result] = translate(`${fixtures}/nested-tuple.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Tuple,
            minItems: 2,
            maxItems: 2,
            items: [
                {
                    type: nodes.Kind.Tuple,
                    items: [{ type: nodes.Kind.String }, { type: nodes.Kind.Number }],
                    minItems: 2,
                    maxItems: 2,
                },
                {
                    type: nodes.Kind.Tuple,
                    items: [{ type: nodes.Kind.Boolean }, { type: nodes.Kind.Null }],
                    minItems: 2,
                    maxItems: 2,
                },
            ],
        })
    })

    test('should translate tuple with union', () => {
        const [result] = translate(`${fixtures}/tuple-with-union.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Tuple,
            minItems: 2,
            maxItems: 2,
            items: [
                {
                    type: nodes.Kind.Number,
                },
                {
                    type: nodes.Kind.Union,
                    oneOf: [{ type: nodes.Kind.String }, { type: nodes.Kind.Number }],
                },
            ],
        })
    })

    test('should translate array of union types', () => {
        const [result] = translate(`${fixtures}/array-of-unions.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: {
                type: nodes.Kind.Union,
                oneOf: [{ type: nodes.Kind.String }, { type: nodes.Kind.Number }],
            },
        })
    })

    test('should translate deeply nested array type', () => {
        const [result] = translate(`${fixtures}/deeply-nested-array.ts`)
        expect(result).toStrictEqual({
            type: nodes.Kind.Array,
            items: {
                type: nodes.Kind.Array,
                items: {
                    type: nodes.Kind.Array,
                    items: {
                        type: nodes.Kind.Array,
                        items: {
                            type: nodes.Kind.Array,
                            items: { type: nodes.Kind.String },
                        },
                    },
                },
            },
        })
    })
})
